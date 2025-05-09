<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useMapStore } from '@/stores/map/mapStore';
import { storeToRefs } from 'pinia';
import MarkerConfigService from '@/service/map/markerConfigService';
import MapView from '@/views/mapView/MapView.vue';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import L from 'leaflet';
import ConfirmModal from '@/components/householdMainView/modals/ConfirmModal.vue';

export default {
  name: 'markerAdmin',
  components: {
    MapView,
    Button,
    Input,
    ConfirmModal,
  },

  setup() {
    const mapView = ref(null);
    const map = ref(null);
    const tempMarker = ref(null);
    const showFilterDropdown = ref(false);
    const showDescriptionTips = ref(false);
    const dropdownOpen = ref(false);
    const activeEditMarker = ref(null);
    const confirmDeleteModalOpen = ref(false);
    const markerToDelete = ref(null);

    // Map configuration
    const mapCenter = ref([63.4305, 10.3951]); // Trondheim
    const mapZoom = ref(13);

    const mapStore = useMapStore();

    const {
      markers,
      filteredMarkers,
      markerFormData,
      isEditing,
      isCreating,
      isLoading,
      error,
      success
    } = storeToRefs(mapStore);

    const searchTerm = ref('');
    const filterType = ref('');

    const markerConfigs = MarkerConfigService.getMarkerConfigs();

    const markerTypes = computed(() => mapStore.adminMarkerTypes);

    /**
   * Closes the custom select dropdown when clicking outside of it.
   * @param {MouseEvent} e
   */
    const closeDropdownOnOutsideClick = (e) => {
      const customSelect = document.querySelector('.custom-select-wrapper');
      if (customSelect && !customSelect.contains(e.target)) {
        dropdownOpen.value = false;
      }
    };

    /**
   * Toggles the visibility of the type dropdown.
   */
    const toggleDropdown = () => {
      dropdownOpen.value = !dropdownOpen.value;
    };

    /**
     * Returns the name of the marker type based on its ID.
     * @param {string} typeId
     * @returns {string}
     */
    const getMarkerTypeName = (typeId) => {
      const type = markerTypes.value.find(t => t.id === typeId);
      return type ? type.name : '';
    };

    /**
   * Sets the selected marker type in the form and closes the dropdown.
   * @param {string} typeId
   */
    const selectMarkerType = (typeId) => {
      markerFormData.value.type = typeId;
      dropdownOpen.value = false;
    };

    /**
     * Handles Leaflet map readiness.
     * @param {L.Map} leafletMap
     */
    const onMapReady = (leafletMap) => {
      map.value = leafletMap;

      map.value.on('click', onMapClick);
    };

    /**
   * Handles map click events when editing or creating a marker.
   * Updates coordinates and address.
   * @param {L.LeafletMouseEvent} e
   */
    const onMapClick = async (e) => {
      if (!isEditing.value && !isCreating.value) {
        return;
      }

      const { lat, lng } = e.latlng;

      markerFormData.value.latitude = lat;
      markerFormData.value.longitude = lng;

      mapStore.updateMarkerCoordinates(lat, lng);

      if (tempMarker.value) {
        tempMarker.value.setLatLng([lat, lng]);
      } else {
        const icon = createMarkerIcon(markerFormData.value.type);
        tempMarker.value = L.marker([lat, lng], { icon }).addTo(map.value);
      }

      try {
        await mapStore.updateAddressFromCoordinates(lat, lng);
      } catch (error) {
        console.error("Error updating address from coordinates:", error);
      }
    };

    /**
   * Creates a Leaflet icon based on marker type config.
   * @param {string} type
   * @returns {L.Icon | null}
   */
    const createMarkerIcon = (type) => {
      const config = markerConfigs[type];
      if (!config) return null;

      return MarkerConfigService.createLeafletIcon(
        config.iconType,
        config.color
      );
    };

    /**
   * Updates marker coordinates based on address input using debounce.
   */
    const onAddressChange = debounce(async () => {
      if (!markerFormData.value.address && !markerFormData.value.postalCode && !markerFormData.value.city) {
        return;
      }

      const addressQuery = [
        markerFormData.value.address,
        markerFormData.value.postalCode,
        markerFormData.value.city
      ].filter(Boolean).join(', ');

      if (addressQuery.trim() === '') {
        return;
      }

      try {
        const coordinates = await mapStore.updateCoordinatesFromAddress(addressQuery);

        if (coordinates && tempMarker.value && map.value) {
          tempMarker.value.setLatLng([coordinates.lat, coordinates.lng]);

          map.value.setView([coordinates.lat, coordinates.lng], map.value.getZoom());
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
      }
    }, 500); 

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
     * Returns the Lucide icon name for a given marker type.
     * @param {string} type
     * @returns {string|null}
     */
    const getMarkerIcon = (type) => {
      return markerConfigs[type]?.lucideIcon || null;
    };

    /**
     * Returns the color associated with a marker type.
     * @param {string} type
     * @returns {string}
     */
    const getMarkerColor = (type) => {
      return markerConfigs[type]?.color || '#333333';
    };

    /**
     * Updates the search term in the store.
     */
    const onSearchChange = () => {
      mapStore.setSearchTerm(searchTerm.value);
    };

    /**
     * Updates the filter type in the store and hides the dropdown.
     */
    const onFilterChange = () => {
      mapStore.setFilterType(filterType.value);
      showFilterDropdown.value = false;
    };

    
    /**
     * Toggles the filter dropdown visibility.
     */
    const toggleFilterDropdown = () => {
      showFilterDropdown.value = !showFilterDropdown.value;
    };

    /**
     * Toggles the description tips section in the form.
     */
    const toggleDescriptionTips = () => {
      showDescriptionTips.value = !showDescriptionTips.value;
    };

  /**
   * Initializes a new marker creation and focuses the map.
   */
    const onAddNew = () => {
      mapStore.initNewMarker();

      if (map.value) {
        map.value.setView([markerFormData.value.latitude, markerFormData.value.longitude], 14);
      }

      if (tempMarker.value) {
        tempMarker.value.remove();
      }

      const icon = createMarkerIcon(markerFormData.value.type);
      tempMarker.value = L.marker(
        [markerFormData.value.latitude, markerFormData.value.longitude],
        { icon }
      ).addTo(map.value);
    };

    /**
     * Loads an existing marker into edit mode and places a temp marker on the map.
     * @param {object} marker
     */
    const onEditMarker = (marker) => {
      activeEditMarker.value = marker.id;

      if (mapView.value && typeof mapView.value.refreshMarkers === 'function') {
        mapView.value.refreshMarkers();
      }

      mapStore.editMarker(marker);

      if (tempMarker.value) {
        tempMarker.value.remove();
        tempMarker.value = null;
      }

      if (map.value) {
        map.value.setView([marker.latitude, marker.longitude], 16);
      }

      setTimeout(() => {
        try {
          const icon = createMarkerIcon(marker.type);
          if (icon && map.value) {
            tempMarker.value = L.marker(
              [marker.latitude, marker.longitude],
              { icon }
            ).addTo(map.value);

            map.value.invalidateSize();
          }
        } catch (err) {
          console.error("Error creating temp marker:", err);
        }
      }, 20);
    };

    /**
     * Cancels marker editing and removes the temporary marker.
     */
    const onCancelEdit = () => {

      if (tempMarker.value) {
        tempMarker.value.remove();
        tempMarker.value = null;
      }

      activeEditMarker.value = null;

      mapStore.cancelEdit();
    };

    /**
     * Saves the current marker and clears temp state.
     */
    const onSaveMarker = async () => {
      if (tempMarker.value) {
        tempMarker.value.remove();
        tempMarker.value = null;
      }
      activeEditMarker.value = null;
      mapStore.refreshMarkerLayers();
      const success = await mapStore.saveMarker();
      if (success) {
        setTimeout(() => {
          if (map.value) {
            map.value.invalidateSize();
          }
        }, 300);
      }
    };

    /**
     * Opens confirmation modal before deleting a marker.
     */
    const onDeleteMarker = () => {
      markerToDelete.value = markerFormData.value.id;
      confirmDeleteModalOpen.value = true;
    };

    /**
     * Confirms marker deletion and removes it from the map and store.
     */
    const confirmMarkerDeletion = async () => {
      if (tempMarker.value) {
        tempMarker.value.remove();
        tempMarker.value = null;
      }
      const deletingId = markerToDelete.value;
      activeEditMarker.value = null;

      if (mapView.value && typeof mapView.value.refreshMarkers === 'function') {
        mapView.value.refreshMarkers();
      }
      await mapStore.deleteMarker(deletingId);
      confirmDeleteModalOpen.value = false;
      markerToDelete.value = null;
    };

    /**
     * Cancels the delete confirmation modal.
     */
    const cancelMarkerDeletion = () => {
      confirmDeleteModalOpen.value = false;
      markerToDelete.value = null;
    };

    /**
     * Clears success message in store.
     */
    const clearSuccess = () => {
      mapStore.clearSuccess();
    };

    /**
     * Clears error message in store.
     */
    const clearError = () => {
      mapStore.clearError();
    };

    /**
     * Updates marker icon when type changes.
     */
    watch(() => markerFormData.value.type, (newType) => {
      if (tempMarker.value && map.value) {
        const icon = createMarkerIcon(newType);
        tempMarker.value.setIcon(icon);
      }
    });

    /**
     * Refreshes marker layers when map is moved (only in admin mode).
     */
    watch(() => map.value, (newMap) => {
      if (newMap && props.isAdminMode) {
        newMap.on('moveend', () => {
          mapStore.refreshMarkerLayers();
        });
      }
    });

    /**
     * Fetches markers and sets up listeners on component mount.
     */
    onMounted(async () => {
      await mapStore.fetchMarkers();

      searchTerm.value = mapStore.searchTerm;
      filterType.value = mapStore.filterType;

      document.addEventListener('click', closeDropdownOnOutsideClick);
    });

    /**
     * Cleans up temporary marker and event listeners on component unmount.
     */
    onUnmounted(() => {
      if (tempMarker.value) {
        tempMarker.value.remove();
        tempMarker.value = null;
      }

      document.removeEventListener('click', closeDropdownOnOutsideClick);
    });

    return {
      mapView,
      mapCenter,
      mapZoom,
      markers,
      filteredMarkers,
      markerFormData,
      isEditing,
      isCreating,
      isLoading,
      error,
      success,
      markerTypes,
      searchTerm,
      filterType,
      showFilterDropdown,
      showDescriptionTips,
      dropdownOpen,
      toggleDropdown,
      getMarkerTypeName,
      selectMarkerType,
      onMapReady,
      onSearchChange,
      onFilterChange,
      toggleFilterDropdown,
      toggleDescriptionTips,
      onAddNew,
      onEditMarker,
      onSaveMarker,
      onCancelEdit,
      onDeleteMarker,
      getMarkerIcon,
      getMarkerColor,
      clearSuccess,
      clearError,
      onMapClick,
      onAddressChange,
      activeEditMarker,
      confirmDeleteModalOpen,
      markerToDelete,
      confirmMarkerDeletion,
      cancelMarkerDeletion,
    };
  }
};
</script>

<template>
  <div class="flex w-full h-[calc(100vh-60px)] gap-4 p-4 relative overflow-hidden">
    <!-- Alert messages -->
    <div v-if="success" class="fixed top-5 right-5 p-3 bg-green-100 text-green-800 border border-green-200 rounded flex items-center justify-between min-w-[300px] max-w-[400px] shadow-md z-[2000]">
      {{ success }}
      <Button variant="ghost" size="icon" class="h-6 w-6 flex items-center justify-center" @click="clearSuccess">×</Button>
    </div>

    <div v-if="error" class="fixed top-5 right-5 p-3 bg-red-100 text-red-800 border border-red-200 rounded flex items-center justify-between min-w-[300px] max-w-[400px] shadow-md z-[2000]">
      {{ error }}
      <Button variant="ghost" size="icon" class="h-6 w-6 flex items-center justify-center" @click="clearError">×</Button>
    </div>

    <!-- Left panel: List or Form -->
    <div class="w-[400px] shrink-0 bg-white rounded-lg p-4 overflow-y-auto">
      <!-- Marker List -->
      <div v-if="!isEditing && !isCreating" class="w-full">
        <h1 class="text-gray-800 text-2xl font-semibold mb-6">Markører</h1>

        <Button
          variant="default"
          class="w-full mb-3"
          @click="onAddNew"
        >
          + Legg til ny
        </Button>

        <!-- Search and Filter -->
        <div class="flex flex-col gap-2 mb-4">
          <input
            type="text"
            v-model="searchTerm"
            class="w-full py-2 px-3 border border-gray-300 rounded text-sm"
            placeholder="Søk markører..."
            @input="onSearchChange"
          />

          <div class="relative">
            <Button
              variant="outline"
              class="w-full justify-between text-left"
              @click="toggleFilterDropdown"
            >
              Filtrer etter ikoner <span class="ml-1">▼</span>
            </Button>

            <div v-if="showFilterDropdown" class="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md z-10 shadow-md w-full max-h-[300px] overflow-y-auto">
              <div class="p-2 hover:bg-gray-100 cursor-pointer">
                <input
                  type="radio"
                  id="all-types"
                  name="filter"
                  value=""
                  v-model="filterType"
                  @change="onFilterChange"
                  class="mr-2"
                />
                <label for="all-types" class="cursor-pointer">Alle typer</label>
              </div>

              <div
                v-for="type in markerTypes"
                :key="type.id"
                class="p-2 hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="radio"
                  :id="type.id"
                  name="filter"
                  :value="type.id"
                  v-model="filterType"
                  @change="onFilterChange"
                  class="mr-2"
                />
                <div class="flex items-center">
                  <div class="flex items-center justify-center w-6 h-6 mr-2">
                    <component
                      :is="getMarkerIcon(type.id)"
                      :color="getMarkerColor(type.id)"
                      size="16"
                    />
                  </div>
                  <label :for="type.id" class="cursor-pointer">{{ type.name }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Markers List -->
        <div class="flex flex-col gap-3 mb-5 max-h-[475px] overflow-y-auto">
          <div
            v-for="marker in filteredMarkers"
            :key="marker.id"
            class="flex items-center p-3 bg-white rounded border border-gray-200"
          >
            <div class="flex items-center justify-center mr-3">
              <component
                :is="getMarkerIcon(marker.type)"
                :color="getMarkerColor(marker.type)"
                size="20"
              />
            </div>
            <div class="flex-1">
              <p class="text-sm">{{ marker.address }}, {{ marker.city }}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="ml-2"
              @click="onEditMarker(marker)"
            >
              Rediger
            </Button>
          </div>

          <div v-if="filteredMarkers.length === 0" class="p-5 text-center text-gray-600 bg-white rounded border border-gray-200">
            <p>Ingen markører funnet</p>
          </div>
        </div>
      </div>

      <!-- Marker Form (Edit/Create) -->
      <div v-else class="w-full">
        <h1 class="text-gray-800 text-2xl font-semibold mb-6">{{ isCreating ? 'Legg til ny markør' : 'Rediger markør' }}</h1>

        <p class="mb-4 text-sm text-gray-600">Klikk på kartet for å endre markørens posisjon.</p>

        <form @submit.prevent="onSaveMarker">
          <div class="mb-4">
            <label for="type" class="block mb-2 font-medium text-gray-700">Type</label>
            <div class="relative w-full">
              <div
                class="border border-gray-300 rounded bg-white cursor-pointer select-none h-[42px] hover:border-gray-400"
                @click="toggleDropdown"
                :class="{ 'border-blue-500 shadow-outline': dropdownOpen }"
              >
                <div class="flex items-center h-full px-3">
                  <div class="flex items-center justify-center mr-3 w-6 h-6">
                    <component
                      :is="getMarkerIcon(markerFormData.type)"
                      :color="getMarkerColor(markerFormData.type)"
                      size="20"
                    />
                  </div>
                  <span class="flex-1">{{ getMarkerTypeName(markerFormData.type) }}</span>
                  <div class="text-gray-500 text-xs ml-2">▼</div>
                </div>
              </div>
              <div class="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-md max-h-[200px] overflow-y-auto z-10 shadow-md" v-if="dropdownOpen">
                <div
                  v-for="type in markerTypes"
                  :key="type.id"
                  class="flex items-center p-3 cursor-pointer hover:bg-gray-100"
                  @click="selectMarkerType(type.id)"
                  :class="{ 'bg-blue-50': markerFormData.type === type.id }"
                >
                  <div class="flex items-center justify-center mr-3 w-6 h-6">
                    <component
                      :is="getMarkerIcon(type.id)"
                      :color="getMarkerColor(type.id)"
                      size="20"
                    />
                  </div>
                  <span>{{ type.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <label for="address" class="block mb-2 font-medium text-gray-700">Adresse</label>
            <Input
              id="address"
              v-model="markerFormData.address"
              @input="onAddressChange"
            />
          </div>

          <div class="flex gap-4 mb-4">
            <div class="flex-1">
              <label for="postalCode" class="block mb-2 font-medium text-gray-700">Postkode</label>
              <Input
                id="postalCode"
                v-model="markerFormData.postalCode"
                @input="onAddressChange"
              />
            </div>

            <div class="flex-1">
              <label for="city" class="block mb-2 font-medium text-gray-700">Sted</label>
              <Input
                id="city"
                v-model="markerFormData.city"
                @input="onAddressChange"
              />
            </div>
          </div>

          <div class="mb-4">
            <div class="flex items-center mb-2">
              <label for="description" class="font-medium text-gray-700">Beskrivelse</label>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                class="ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100"
                @click="toggleDescriptionTips"
              >
                ?
              </Button>
            </div>

            <div v-if="showDescriptionTips" class="relative p-4 mb-3 bg-blue-50 text-blue-600 rounded-md">
              <h4 class="font-medium mb-2">Tips for en god beskrivelse:</h4>

              <button
                type="button"
                class="absolute top-3 right-3 text-blue-600 hover:text-black"
                @click="toggleDescriptionTips"
              >
                x
              </button>

              <!-- Tips list -->
              <ul class="pl-5 list-disc">
                <li class="mb-2 text-sm">Vær konkret om hva som finnes på stedet</li>
                <li class="mb-2 text-sm">Nevn relevante detaljer som kan være viktige i en krisesituasjon</li>
                <li class="mb-2 text-sm">Inkluder informasjon om tilgjengelighet</li>
                <li class="text-sm">Beskriv synlige kjennetegn ved stedet</li>
              </ul>
            </div>

            <textarea
              id="description"
              v-model="markerFormData.description"
              class="w-full p-3 border border-gray-300 rounded resize-y text-sm"
              rows="4"
            ></textarea>
          </div>

          <div class="mb-4">
            <label for="contactInfo" class="block mb-2 font-medium text-gray-700">Kontaktinformasjon</label>
            <Input
              id="contactInfo"
              v-model="markerFormData.contactInfo"
            />
          </div>

          <div class="mb-4">
            <label for="openingHours" class="block mb-2 font-medium text-gray-700">Åpningstider</label>
            <Input
              id="openingHours"
              v-model="markerFormData.openingHours"
            />
          </div>

          <div class="mb-4">
            <label class="block mb-2 font-medium text-gray-700">Koordinater</label>
            <div class="flex gap-4">
              <div class="flex-1">
                <Input
                  v-model="markerFormData.latitude"
                  placeholder="Breddgrad °N"
                  class="w-full"
                />
              </div>

              <div class="flex-1">
                <Input
                  v-model="markerFormData.longitude"
                  placeholder="Lengdegrad °E"
                  class="w-full"
                />
              </div>
            </div>
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
              @click="onDeleteMarker"
            >
              Slett
            </Button>

            <Button
              variant="default"
              type="submit"
              class="ml-auto"
            >
              Lagre
            </Button>
          </div>
        </form>
      </div>
    </div>

    <!-- Right panel: Map -->
    <div class="flex-grow relative rounded-lg overflow-hidden">
      <MapView
        ref="mapView"
        :center="mapCenter"
        :zoom="mapZoom"
        :is-admin-mode="true"
        :markers="markers"
        :editingMarkerId="activeEditMarker"
        @map-ready="onMapReady"
        @map-click="onMapClick"
        class="w-full h-full absolute inset-0"
      />
    </div>
  </div>
  <ConfirmModal
    v-if="confirmDeleteModalOpen"
    title="Slett markør"
    description="Er du sikker på at du vil slette denne markøren? Dette kan ikke angres."
    confirm-text="Slett"
    cancel-text="Avbryt"
    @cancel="cancelMarkerDeletion"
    @confirm="confirmMarkerDeletion"
    class="z-[2000]"
  />
</template>
