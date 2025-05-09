<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useIncidentAdminStore } from '@/stores/admin/incidentAdminStore';
import { storeToRefs } from 'pinia';
import IncidentConfigService from '@/service/map/incidentConfigService';
import MapView from '@/views/mapView/MapView.vue';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import L from 'leaflet';
import { useScenarioStore } from '@/stores/ScenarioStore'
import ConfirmModal from '@/components/householdMainView/modals/ConfirmModal.vue';

export default {
  name: 'IncidentAdmin',
  components: {
    MapView,
    Button,
    Input,
    ConfirmModal
  },

  /**
   * @function setup
   * @description Vue Composition API setup function
   * @returns {Object} Reactive properties and methods for the component
   */
  setup() {

    const mapView = ref(null);
    const map = ref(null);
    const incidentLayers = ref(null);
    const showFilterDropdown = ref(false);
    const showDescriptionTips = ref(false);
    const selectedScenarioId = ref(null);
    const mapCenter = ref([63.4305, 10.3951]);
    const mapZoom = ref(13);
    const searchTerm = ref('');
    const filterSeverity = ref('');
    const startDate = ref('');
    const startTime = ref('');
    const endDate = ref('');
    const endTime = ref('');
    const confirmDeleteModalOpen = ref(false);
    const incidentToDelete = ref(null);


    const scenarioStore = useScenarioStore();
    const incidentAdminStore = useIncidentAdminStore();

    const {
      incidents,
      filteredIncidents,
      incidentFormData,
      isEditing,
      isCreating,
      isLoading,
      error,
      success
    } = storeToRefs(incidentAdminStore);

    /**
     * @async
     * @function fetchScenarios
     * @description Fetches all available scenarios from the server
     * @returns {Promise<void>}
     */
    const fetchScenarios = async () => {
      await scenarioStore.fetchAllScenarios();
    };

    /**
     * @function updateDateTimeFields
     * @description Updates date and time fields based on the current incident form data
     */
    const updateDateTimeFields = () => {
      if (incidentFormData.value.startedAt) {
        const startDateTime = new Date(incidentFormData.value.startedAt);
        startDate.value = startDateTime.toISOString().split('T')[0];
        startTime.value = startDateTime.toTimeString().substring(0, 5);
      } else {
        const now = new Date();
        startDate.value = now.toISOString().split('T')[0];
        startTime.value = now.toTimeString().substring(0, 5);
      }

      if (incidentFormData.value.endedAt) {
        const endDateTime = new Date(incidentFormData.value.endedAt);
        endDate.value = endDateTime.toISOString().split('T')[0];
        endTime.value = endDateTime.toTimeString().substring(0, 5);
      } else {
        endDate.value = '';
        endTime.value = '';
      }
    };

    /**
     * @description Watch for changes in incident form data to update date/time fields
     */
    watch(() => incidentFormData.value, updateDateTimeFields, { immediate: true });

    /**
     * @description Watch for changes in start date/time to update incident form data
     */
    watch([startDate, startTime], () => {
      if (startDate.value && startTime.value) {
        incidentFormData.value.startedAt = new Date(`${startDate.value}T${startTime.value}`).toISOString();
      }
    });

    /**
     * @description Watch for changes in end date/time to update incident form data
     */
    watch([endDate, endTime], () => {
      if (endDate.value && endTime.value) {
        incidentFormData.value.endedAt = new Date(`${endDate.value}T${endTime.value}`).toISOString();
      } else {
        incidentFormData.value.endedAt = null;
      }
    });

    /**
     * @type {import('vue').ComputedRef<Array>}
     * @description Computed property that returns available severity levels
     */
    const severityLevels = computed(() => incidentAdminStore.severityLevels);

    /**
     * @function getSeverityColor
     * @description Gets the color associated with a severity level
     * @param {string|number} severityId - ID of the severity level
     * @returns {string} Hex color code for the severity level
     */
    const getSeverityColor = (severityId) => {
      const levels = IncidentConfigService.getSeverityLevels();
      return levels[severityId]?.color || '#45D278';
    };

    /**
     * @function formatDateForDisplay
     * @description Formats a date string for in Norwegian locale
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date string or empty string if input is falsy
     */
    const formatDateForDisplay = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `Startet: ${date.toLocaleDateString('no-NO')} ${date.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}`;
    };

    /**
     * @function onMapReady
     * @description Callback function when the map is ready
     * @param {Object} leafletMap - Leaflet map instance
     */
    const onMapReady = (leafletMap) => {
      map.value = leafletMap;

      // No need to add click handler here as we're using the @map-click event

      incidentLayers.value = L.layerGroup().addTo(map.value);

      if (isEditing.value || isCreating.value) {
        drawIncidentOnMap();
      }
    };

    /**
     * @function onMapClick
     * @description Handler for map click events
     * @param {Object} e - Click event object containing latlng data
     */
    const onMapClick = async (e) => {

      if (!isEditing.value && !isCreating.value) {
        return;
      }

      const { lat, lng } = e.latlng;

      // Update form data with the new coordinates
      incidentFormData.value.latitude = lat;
      incidentFormData.value.longitude = lng;

      // Also update through the store to ensure reactivity
      incidentAdminStore.updateIncidentCoordinates(lat, lng);

      // Redraw incident on the map
      drawIncidentOnMap();

      // Perform reverse geocoding to get address information
      try {
        const addressInfo = await updateAddressFromCoordinates(lat, lng);
      } catch (error) {
        console.error("Error updating address from coordinates:", error);
      }
    };

    /**
     * @function updateAddressFromCoordinates
     * @description Updates address fields based on coordinates using reverse geocoding
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Promise<Object>} Address information
     */
    const updateAddressFromCoordinates = async (lat, lng) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          { headers: { 'Accept-Language': 'no' } }
        );

        if (!response.ok) {
          throw new Error('Geocoding API request failed');
        }

        const data = await response.json();

        incidentFormData.value.address = data.address.road || '';
        incidentFormData.value.postalCode = data.address.postcode || '';
        incidentFormData.value.city = data.address.city || data.address.town || data.address.village || '';

        return {
          address: incidentFormData.value.address,
          postalCode: incidentFormData.value.postalCode,
          city: incidentFormData.value.city
        };

      } catch (error) {
        console.error('Error in reverse geocoding:', error);
        throw error;
      }
    };

    /**
     * @function onAddressChange
     * @description Handles address field changes and updates coordinates
     */
    const onAddressChange = debounce(async () => {
      // Only proceed if we have at least some address information
      if (!incidentFormData.value.address && !incidentFormData.value.postalCode && !incidentFormData.value.city) {
        return;
      }

      // Build a complete address string for geocoding
      const addressQuery = [
        incidentFormData.value.address,
        incidentFormData.value.postalCode,
        incidentFormData.value.city
      ].filter(Boolean).join(', ');

      if (addressQuery.trim() === '') {
        return;
      }

      try {
        const coordinates = await updateCoordinatesFromAddress(addressQuery);

        if (coordinates && map.value) {
          // Update the form data
          incidentFormData.value.latitude = coordinates.lat;
          incidentFormData.value.longitude = coordinates.lng;

          // Center the map on the new position
          map.value.setView([coordinates.lat, coordinates.lng], map.value.getZoom());

          // Redraw the incident on the map
          drawIncidentOnMap();
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
      }
    }, 500); // 500ms debounce to avoid too many API calls when typing

    /**
     * @function updateCoordinatesFromAddress
     * @description Updates coordinates based on address using geocoding
     * @param {string} addressQuery - Complete address string
     * @returns {Promise<Object>} Coordinates object with lat and lng
     */
    const updateCoordinatesFromAddress = async (addressQuery) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=1`,
          { headers: { 'Accept-Language': 'no' } }
        );

        if (!response.ok) {
          throw new Error('Geocoding API request failed');
        }

        const data = await response.json();

        if (data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          };
        } else {
          throw new Error('No results found for this address');
        }
      } catch (error) {
        console.error('Error in geocoding:', error);
        throw error;
      }
    };

    /**
     * @function debounce
     * @description Limits how often a function can be called
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    /**
     * @function drawIncidentOnMap
     * @description Renders the current incident on the map
     */
    const drawIncidentOnMap = () => {
      if (incidentLayers.value) {
        incidentLayers.value.clearLayers();
      }

      if (!map.value) return;

      const incidentLayerGroup = IncidentConfigService.createIncidentCircles(
        incidentFormData.value,
        map.value
      );

      if (incidentLayerGroup) {
        incidentLayerGroup.addTo(incidentLayers.value);
      }
    };

    /**
     * @function onSearchChange
     * @description Updates the search term when the search input changes
     */
    const onSearchChange = () => {
      incidentAdminStore.setSearchTerm(searchTerm.value);
    };

    /**
     * @function onFilterChange
     * @description Updates the severity filter and closes the dropdown
     */
    const onFilterChange = () => {
      incidentAdminStore.setFilterSeverity(filterSeverity.value);
      showFilterDropdown.value = false;
    };

    /**
     * @function toggleFilterDropdown
     * @description Toggles the visibility of the severity filter dropdown
     */
    const toggleFilterDropdown = () => {
      showFilterDropdown.value = !showFilterDropdown.value;
    };

    /**
     * @function toggleDescriptionTips
     * @description Toggles the visibility of description tips
     */
    const toggleDescriptionTips = () => {
      showDescriptionTips.value = !showDescriptionTips.value;
    };

    /**
     * @function onAddNew
     * @description Initializes the form for creating a new incident
     */
    const onAddNew = () => {
      incidentAdminStore.initNewIncident();
      updateDateTimeFields();

      selectedScenarioId.value = null;

      if (map.value) {
        map.value.setView([incidentFormData.value.latitude, incidentFormData.value.longitude], 13);
      }

      drawIncidentOnMap();
    };

    /**
     * @function onEditIncident
     * @description Sets up the form for editing an existing incident
     * @param {Object} incident - The incident to edit
     */
    const onEditIncident = (incident) => {
      incidentAdminStore.editIncident(incident);

      selectedScenarioId.value = incident.scenarioId || null;

      updateDateTimeFields();

      if (map.value) {
        map.value.setView([incident.latitude, incident.longitude], 14);
      }
      drawIncidentOnMap();
    };

    /**
     * @async
     * @function onSaveIncident
     * @description Saves the current incident and clears map layers if successful
     * @returns {Promise<void>}
     */
    const onSaveIncident = async () => {
      incidentFormData.value.scenarioId = selectedScenarioId.value;

      await incidentAdminStore.saveIncident();

    };

    /**
     * @function onCancelEdit
     * @description Cancels the current edit operation and clears map layers
     */
    const onCancelEdit = () => {
      incidentAdminStore.cancelEdit();

      if (incidentLayers.value) {
        incidentLayers.value.clearLayers();
      }
    };

    /**
     * @function onDeleteIncident
     * @description Opens the confirmation modal for deleting an incident
     */
    const onDeleteIncident = () => {
      // Store the ID of the incident to delete
      incidentToDelete.value = incidentFormData.value.id;
      // Open the confirmation modal
      confirmDeleteModalOpen.value = true;
    };

    /**
     * @async
     * @function confirmIncidentDeletion
     * @description Deletes the incident after confirmation
     * @returns {Promise<void>}
     */
    const confirmIncidentDeletion = async () => {
      const success = await incidentAdminStore.deleteIncident(incidentToDelete.value);

      if (success) {
        if (incidentLayers.value) {
          incidentLayers.value.clearLayers();
        }
      }

      // Close the modal
      confirmDeleteModalOpen.value = false;
      incidentToDelete.value = null;
    };

    /**
     * @function cancelIncidentDeletion
     * @description Cancels the deletion operation
     */
    const cancelIncidentDeletion = () => {
      confirmDeleteModalOpen.value = false;
      incidentToDelete.value = null;
    };

    /**
     * @function clearSuccess
     * @description Clears success messages from the store
     */
    const clearSuccess = () => {
      incidentAdminStore.clearSuccess();
    };

    /**
     * @function clearError
     * @description Clears error messages from the store
     */
    const clearError = () => {
      incidentAdminStore.clearError();
    };

    /**
     * @description Watch for changes in incident radius or severity to update map
     */
    watch(
      [
        () => incidentFormData.value.impactRadius,
        () => incidentFormData.value.severity
      ],
      () => {
        drawIncidentOnMap();
      }
    );

    /**
     * @description Watch for changes in selected scenario to update form data
     */
    watch(selectedScenarioId, (newVal) => {
      if (incidentFormData.value) {
        incidentFormData.value.scenarioId = newVal;
      }
    });

    /**
     * @description Lifecycle hook that runs when component is mounted
     */
    onMounted(async () => {
      await scenarioStore.fetchAllScenarios();

      await incidentAdminStore.fetchIncidents();

      searchTerm.value = incidentAdminStore.searchTerm;
      filterSeverity.value = incidentAdminStore.filterSeverity;
    });

    /**
     * @description Lifecycle hook that runs when component is unmounted
     */
    onUnmounted(() => {
      // Clean up map layers if needed
      if (incidentLayers.value) {
        incidentLayers.value.clearLayers();
      }
    });

    return {
      mapView,
      mapCenter,
      mapZoom,
      incidents,
      filteredIncidents,
      incidentFormData,
      isEditing,
      isCreating,
      isLoading,
      error,
      success,
      severityLevels,
      searchTerm,
      filterSeverity,
      showFilterDropdown,
      showDescriptionTips,
      startDate,
      startTime,
      endDate,
      endTime,
      selectedScenarioId,
      onMapReady,
      onMapClick,
      onSearchChange,
      onFilterChange,
      toggleFilterDropdown,
      toggleDescriptionTips,
      onAddNew,
      onEditIncident,
      onSaveIncident,
      onCancelEdit,
      onDeleteIncident,
      getSeverityColor,
      formatDateForDisplay,
      clearSuccess,
      clearError,
      fetchScenarios,
      onAddressChange,
      confirmDeleteModalOpen,
      incidentToDelete,
      confirmIncidentDeletion,
      cancelIncidentDeletion,
      scenarios: computed(() => scenarioStore.getAllScenarios)
    };
  }
};
</script>

<template>
  <div class="flex w-full h-[calc(100vh-60px)] gap-4 p-4 relative overflow-hidden">
    <!-- Success Alert -->
    <div v-if="success" class="fixed top-5 right-5 p-3 flex items-center justify-between min-w-[300px] max-w-[400px] bg-green-100 text-green-800 border border-green-200 rounded shadow-md z-50">
      {{ success }}
      <Button variant="ghost" size="icon" class="ml-2" @click="clearSuccess">×</Button>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="fixed top-5 right-5 p-3 flex items-center justify-between min-w-[300px] max-w-[400px] bg-red-100 text-red-800 border border-red-200 rounded shadow-md z-50">
      {{ error }}
      <Button variant="ghost" size="icon" class="ml-2" @click="clearError">×</Button>
    </div>

    <!-- Left Panel -->
    <div class="flex-1 bg-white rounded-lg p-4 overflow-y-auto max-w-[400px] min-w-[320px]">
      <!-- Incident List Panel -->
      <div v-if="!isEditing && !isCreating" class="space-y-4">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Aktive kriseområder</h1>

        <Button
          variant="default"
          class="w-full mb-2"
          @click="onAddNew"
        >
          + Legg til ny krisesituasjon
        </Button>

        <div class="space-y-2 mb-4">
          <input
            type="text"
            v-model="searchTerm"
            class="w-full p-2.5 border border-gray-300 rounded-md text-sm"
            placeholder="Søk hendelser..."
            @input="onSearchChange"
          />

          <div class="relative">
            <Button
              variant="outline"
              class="w-full flex justify-between items-center"
              @click="toggleFilterDropdown"
            >
              Filtrer krisetyper <span>▼</span>
            </Button>

            <div v-if="showFilterDropdown" class="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 w-full max-h-[300px] overflow-y-auto">
              <div class="p-2.5 flex items-center gap-2 cursor-pointer hover:bg-gray-100">
                <input
                  type="radio"
                  id="all-types"
                  name="filter"
                  value=""
                  v-model="filterSeverity"
                  @change="onFilterChange"
                />
                <label for="all-types" class="cursor-pointer">Alle typer</label>
              </div>

              <div
                v-for="level in severityLevels"
                :key="level.id"
                class="p-2.5 flex items-center gap-2 cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="radio"
                  :id="level.id"
                  name="filter"
                  :value="level.id"
                  v-model="filterSeverity"
                  @change="onFilterChange"
                />
                <div class="flex items-center gap-2 flex-1 cursor-pointer">
                  <div
                    class="w-4 h-4 rounded-full"
                    :style="{backgroundColor: getSeverityColor(level.id)}"
                  ></div>
                  <label :for="level.id" class="cursor-pointer">{{ level.name }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 max-h-[475px] overflow-y-auto">
          <div
            v-for="incident in filteredIncidents"
            :key="incident.id"
            class="flex items-center p-3 bg-white border border-gray-200 rounded-md"
          >
            <div
              class="w-4 h-4 rounded-full mr-3"
              :style="{backgroundColor: getSeverityColor(incident.severity)}"
            ></div>
            <div class="flex-1">
              <div class="font-medium mb-1">{{ incident.name }}</div>
              <p class="text-gray-600 text-sm">{{ formatDateForDisplay(incident.startedAt) }}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              @click="onEditIncident(incident)"
            >
              Rediger
            </Button>
          </div>

          <div v-if="filteredIncidents.length === 0" class="p-5 text-center text-gray-600 bg-white border border-gray-200 rounded-md">
            <p>Ingen krisesituasjoner funnet</p>
          </div>
        </div>
      </div>

      <!-- Incident Form Panel -->
      <div v-else class="space-y-4">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">{{ isCreating ? 'Ny krisesituasjon' : 'Rediger krisesituasjon' }}</h1>

        <p class="text-sm text-gray-600 mb-4">Klikk på kartet for å justere kriseområdets midtpunkt. Bruk glidebryteren eller skriv inn antall km for å endre radius.</p>

        <form @submit.prevent="onSaveIncident" class="space-y-4">
          <div class="space-y-2">
            <label for="name" class="block font-medium text-gray-700">Tittel</label>
            <Input
              id="name"
              v-model="incidentFormData.name"
              required
              class="w-full"
            />
          </div>

          <div class="space-y-2">
            <label for="scenario" class="block font-medium text-gray-700">Scenario</label>
            <select
              id="scenario"
              v-model="selectedScenarioId"
              class="w-full p-2.5 border border-gray-300 rounded-md text-sm"
            >
              <option :value="null">Velg scenario</option>
              <option
                v-for="scenario in scenarios"
                :key="scenario.id"
                :value="scenario.id"
              >
                {{ scenario.name }}
              </option>
            </select>
          </div>

          <!-- Address fields -->
          <div class="space-y-2">
            <label for="address" class="block font-medium text-gray-700">Adresse</label>
            <Input
              id="address"
              v-model="incidentFormData.address"
              @input="onAddressChange"
              class="w-full"
            />
          </div>

          <div class="flex gap-4 mb-4">
            <div class="space-y-2 flex-1">
              <label for="postalCode" class="block font-medium text-gray-700">Postkode</label>
              <Input
                id="postalCode"
                v-model="incidentFormData.postalCode"
                @input="onAddressChange"
                class="w-full"
              />
            </div>

            <div class="space-y-2 flex-1">
              <label for="city" class="block font-medium text-gray-700">Sted</label>
              <Input
                id="city"
                v-model="incidentFormData.city"
                @input="onAddressChange"
                class="w-full"
              />
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-1.5">
              <label for="description" class="block font-medium text-gray-700">Beskrivelse</label>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                class="inline-flex items-center justify-center w-6 h-6 bg-blue-50 text-blue-500 rounded-full text-sm font-bold"
                @click="toggleDescriptionTips"
              >
                ?
              </Button>
            </div>

            <div v-if="showDescriptionTips" class="relative bg-blue-50 text-blue-500 rounded-md p-4 mb-3">
              <h4 class="font-medium mb-2">Tips for en effektiv krisebeskrivelse:</h4>

              <button
                type="button"
                class="absolute top-3 right-3 text-blue-500 font-bold hover:text-black"
                @click="toggleDescriptionTips"
              >
                x
              </button>

              <ul class="list-disc pl-5 space-y-2">
                <li class="text-sm">Vær konkret om hva som har skjedd</li>
                <li class="text-sm">Beskriv omfanget av krisen tydelig</li>
                <li class="text-sm">Nevn hvilke områder som er berørt</li>
                <li class="text-sm">Inkluder informasjon om igangsatte tiltak</li>
                <li class="text-sm">Gi anslag på forventet varighet hvis mulig</li>
              </ul>
            </div>

            <textarea
              id="description"
              v-model="incidentFormData.description"
              class="w-full p-2.5 border border-gray-300 rounded-md text-sm"
              rows="4"
            ></textarea>
          </div>

          <div class="flex gap-4 mb-4">
            <div class="space-y-2 flex-1">
              <label class="block font-medium text-gray-700">Start tidspunkt</label>
              <div class="flex gap-2">
                <input
                  type="date"
                  v-model="startDate"
                  class="flex-grow p-2.5 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="time"
                  v-model="startTime"
                  class="p-2.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            <div class="space-y-2 flex-1">
              <label class="block font-medium text-gray-700">Slutt tidspunkt (valgfritt)</label>
              <div class="flex gap-2">
                <input
                  type="date"
                  v-model="endDate"
                  class="flex-grow p-2.5 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="time"
                  v-model="endTime"
                  class="p-2.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block font-medium text-gray-700">Krise-/beredskapsnivå</label>
            <div class="flex flex-col sm:flex-row gap-2 mt-2">
              <div
                v-for="level in severityLevels"
                :key="level.id"
                class="flex-1 p-2.5 border border-gray-300 rounded-md flex items-center gap-2 cursor-pointer transition-all duration-200 hover:bg-gray-50"
                :class="{ 'bg-gray-100 border-gray-400': incidentFormData.severity === level.id }"
                @click="incidentFormData.severity = level.id"
              >
                <div
                  class="w-4 h-4 rounded-full"
                  :style="{backgroundColor: getSeverityColor(level.id)}"
                ></div>
                <span>{{ level.name }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block font-medium text-gray-700">Koordinater</label>
            <div class="flex gap-4 mb-4">
              <div class="space-y-2 flex-1">
                <Input
                  v-model="incidentFormData.latitude"
                  placeholder="Breddgrad °N"
                  class="w-full"
                />
              </div>
              <div class="space-y-2 flex-1">
                <Input
                  v-model="incidentFormData.longitude"
                  placeholder="Lengdegrad °E"
                  class="w-full"
                />
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label for="radius" class="block font-medium text-gray-700">Radius i km: {{ incidentFormData.impactRadius }}</label>
            <div class="mb-2">
              <input
                type="range"
                id="radius"
                v-model.number="incidentFormData.impactRadius"
                min="0"
                max="50"
                step="1"
                class="w-full"
              />
              <div class="flex justify-between text-xs text-gray-500">
                <span>0 km</span>
                <span>25 km</span>
                <span>50 km</span>
              </div>
            </div>
            <Input
              v-model.number="incidentFormData.impactRadius"
              type="number"
              min="0"
              max="50"
              class="w-[60px] text-center"
            />
          </div>

          <div class="flex gap-3 mt-6">
            <Button
              variant="outline"
              type="button"
              @click="onCancelEdit"
            >
              Avbryt
            </Button>

            <Button
              v-if="isEditing"
              variant="destructive"
              type="button"
              @click="onDeleteIncident"
            >
              Slett krise
            </Button>

            <Button
              variant="default"
              type="submit"
              class="ml-auto"
            >
              {{ isCreating ? 'Lagre' : 'Lagre' }}
            </Button>
          </div>
        </form>
      </div>
    </div>

    <!-- Right Panel (Map) -->
    <div class="flex-grow h-full relative rounded-lg overflow-hidden">
      <MapView
        ref="mapView"
        :center="mapCenter"
        :zoom="mapZoom"
        :is-admin-mode="true"
        @map-ready="onMapReady"
        @map-click="onMapClick"
        class="h-full w-full"
      />
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <ConfirmModal
    v-if="confirmDeleteModalOpen"
    title="Slett markør"
    description="Er du sikker på at du vil slette denne markøren? Dette kan ikke angres."
    confirm-text="Slett"
    cancel-text="Avbryt"
    @cancel="cancelIncidentDeletion"
    @confirm="confirmIncidentDeletion"
    class="z-[2000]"
  />
</template>
