<template>
  <div class="marker-admin-container">
    <!-- Alert messages -->
    <div v-if="success" class="alert alert-success">
      {{ success }}
      <Button variant="ghost" size="icon" class="close-btn" @click="clearSuccess">×</Button>
    </div>

    <div v-if="error" class="alert alert-error">
      {{ error }}
      <Button variant="ghost" size="icon" class="close-btn" @click="clearError">×</Button>
    </div>

    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Laster...</p>
    </div>

    <!-- Left panel: List or Form -->
    <div class="left-panel">
      <!-- Marker List -->
      <div v-if="!isEditing && !isCreating" class="marker-list-panel">
        <h1>Markører</h1>

        <!-- Search and Filter -->
        <div class="search-filter-container">
          <input
            type="text"
            v-model="searchTerm"
            class="search-input"
            placeholder="Søk markører..."
            @input="onSearchChange"
          />

          <div class="filter-dropdown">
            <Button
              variant="outline"
              class="filter-button"
              @click="toggleFilterDropdown"
            >
              Filtrer etter ikoner <span class="dropdown-arrow">▼</span>
            </Button>

            <div v-if="showFilterDropdown" class="filter-options">
              <div class="filter-option">
                <input
                  type="radio"
                  id="all-types"
                  name="filter"
                  value=""
                  v-model="filterType"
                  @change="onFilterChange"
                />
                <label for="all-types" class="filter-label">Alle typer</label>
              </div>

              <div
                v-for="type in markerTypes"
                :key="type.id"
                class="filter-option"
              >
                <input
                  type="radio"
                  :id="type.id"
                  name="filter"
                  :value="type.id"
                  v-model="filterType"
                  @change="onFilterChange"
                />
                <div class="filter-label-with-icon">
                  <!-- Add the marker icon here -->
                  <div class="filter-icon">
                    <component
                      :is="getMarkerIcon(type.id)"
                      :color="getMarkerColor(type.id)"
                      size="16"
                    />
                  </div>
                  <label :for="type.id" class="filter-label">{{ type.name }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Markers List -->
        <div class="markers-container">
          <div
            v-for="marker in filteredMarkers"
            :key="marker.id"
            class="marker-item"
          >
            <div class="marker-icon">
              <component
                :is="getMarkerIcon(marker.type)"
                :color="getMarkerColor(marker.type)"
                size="20"
              />
            </div>
            <div class="marker-info">
              <p>{{ marker.address }}, {{ marker.city }}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="edit-btn"
              @click="onEditMarker(marker)"
            >
              Rediger
            </Button>
          </div>

          <div v-if="filteredMarkers.length === 0" class="empty-markers">
            <p>Ingen markører funnet</p>
          </div>
        </div>

        <Button
          variant="default"
          class="add-new-btn"
          @click="onAddNew"
        >
          + Legg til ny
        </Button>
      </div>

      <!-- Marker Form (Edit/Create) -->
      <div v-else class="marker-form-panel">
        <h1>{{ isCreating ? 'Legg til ny markør' : 'Rediger markør' }}</h1>

        <p class="click-info">Klikk på kartet for å endre markørens posisjon.</p>

        <form @submit.prevent="onSaveMarker">
          <div class="form-group">
            <label for="type">Type</label>
            <div class="custom-select-wrapper">
              <div
                class="custom-select"
                @click="toggleDropdown"
                :class="{ 'dropdown-open': dropdownOpen }"
              >
                <div class="selected-option">
                  <div class="option-icon">
                    <component
                      :is="getMarkerIcon(markerFormData.type)"
                      :color="getMarkerColor(markerFormData.type)"
                      size="20"
                    />
                  </div>
                  <span class="option-text">{{ getMarkerTypeName(markerFormData.type) }}</span>
                  <div class="dropdown-arrow">▼</div>
                </div>
              </div>
              <div class="options-container" v-if="dropdownOpen">
                <div
                  v-for="type in markerTypes"
                  :key="type.id"
                  class="option-item"
                  @click="selectMarkerType(type.id)"
                  :class="{ 'selected': markerFormData.type === type.id }"
                >
                  <div class="option-icon">
                    <component
                      :is="getMarkerIcon(type.id)"
                      :color="getMarkerColor(type.id)"
                      size="20"
                    />
                  </div>
                  <span class="option-text">{{ type.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="address">Adresse</label>
            <Input
              id="address"
              v-model="markerFormData.address"
              @input="onAddressChange"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="postalCode">Postkode</label>
              <Input
                id="postalCode"
                v-model="markerFormData.postalCode"
                @input="onAddressChange"
              />
            </div>

            <div class="form-group">
              <label for="city">Sted</label>
              <Input
                id="city"
                v-model="markerFormData.city"
                @input="onAddressChange"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="description" class="description-label">
              Beskrivelse
              <Button
                variant="ghost"
                size="sm"
                type="button"
                class="info-btn"
                @click="toggleDescriptionTips"
              >
                ?
              </Button>
            </label>

            <div v-if="showDescriptionTips" class="tips-box">
              <h4 class="tips-title">Tips for en god beskrivelse:</h4>

              <button
                type="button"
                class="close-tips-btn"
                @click="toggleDescriptionTips"
              >
                x
              </button>

              <!-- Tips list -->
              <ul class="tips-list">
                <li>Vær konkret om hva som finnes på stedet</li>
                <li>Nevn relevante detaljer som kan være viktige i en krisesituasjon</li>
                <li>Inkluder informasjon om tilgjengelighet</li>
                <li>Beskriv synlige kjennetegn ved stedet</li>
              </ul>
            </div>

            <textarea
              id="description"
              v-model="markerFormData.description"
              class="form-control"
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="contactInfo">Kontaktinformasjon</label>
            <Input
              id="contactInfo"
              v-model="markerFormData.contactInfo"
            />
          </div>

          <div class="form-group">
            <label for="openingHours">Åpningstider</label>
            <Input
              id="openingHours"
              v-model="markerFormData.openingHours"
            />
          </div>

          <div class="form-group">
            <label>Koordinater</label>
            <div class="form-row">
              <div class="form-group">
                <Input
                  v-model="markerFormData.latitude"
                  placeholder="Breddgrad °N"
                  class="coordinate-input"
                />
              </div>

              <div class="form-group">
                <Input
                  v-model="markerFormData.longitude"
                  placeholder="Lengdegrad °E"
                  class="coordinate-input"
                />
              </div>
            </div>
          </div>

          <div class="button-row">
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
    <div class="right-panel">
      <MapView
        ref="mapView"
        :center="mapCenter"
        :zoom="mapZoom"
        :is-admin-mode="true"
        :markers="markers"
        :editingMarkerId="activeEditMarker"
        @map-ready="onMapReady"
        @map-click="onMapClick"
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
    class="marker-delete-modal"
  />
</template>

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

    // Initialize the mapStore
    const mapStore = useMapStore();

    // Get reactive properties from the store
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

    // Get marker configurations
    const markerConfigs = MarkerConfigService.getMarkerConfigs();

    // Computed properties
    const markerTypes = computed(() => mapStore.adminMarkerTypes);

    // Close dropdown when clicking outside
    const closeDropdownOnOutsideClick = (e) => {
      const customSelect = document.querySelector('.custom-select-wrapper');
      if (customSelect && !customSelect.contains(e.target)) {
        dropdownOpen.value = false;
      }
    };

    // Toggle dropdown state
    const toggleDropdown = () => {
      dropdownOpen.value = !dropdownOpen.value;
    };

    // Get marker type name by id
    const getMarkerTypeName = (typeId) => {
      const type = markerTypes.value.find(t => t.id === typeId);
      return type ? type.name : '';
    };

    // Select marker type
    const selectMarkerType = (typeId) => {
      markerFormData.value.type = typeId;
      dropdownOpen.value = false;
    };

    // Methods
    const onMapReady = (leafletMap) => {
      // Store the map instance
      map.value = leafletMap;

      // Add click handler for setting marker position
      map.value.on('click', onMapClick);
    };

    const onMapClick = async (e) => {
      // Only proceed if in edit or create mode
      if (!isEditing.value && !isCreating.value) {
        return;
      }

      const { lat, lng } = e.latlng;

      // Update form data with the new coordinates
      markerFormData.value.latitude = lat;
      markerFormData.value.longitude = lng;

      // Also update through the store to ensure reactivity
      mapStore.updateMarkerCoordinates(lat, lng);

      // Update or create temporary marker
      if (tempMarker.value) {
        tempMarker.value.setLatLng([lat, lng]);
      } else {
        const icon = createMarkerIcon(markerFormData.value.type);
        tempMarker.value = L.marker([lat, lng], { icon }).addTo(map.value);
      }

      // Perform reverse geocoding to get address information
      try {
        await mapStore.updateAddressFromCoordinates(lat, lng);
      } catch (error) {
        console.error("Error updating address from coordinates:", error);
      }
    };

    const createMarkerIcon = (type) => {
      // Get configuration for this marker type
      const config = markerConfigs[type];
      if (!config) return null;

      // Create Leaflet icon using MarkerConfigService
      return MarkerConfigService.createLeafletIcon(
        config.iconType,
        config.color
      );
    };

    const onAddressChange = debounce(async () => {
      // Only proceed if we have at least some address information
      if (!markerFormData.value.address && !markerFormData.value.postalCode && !markerFormData.value.city) {
        return;
      }

      // Build a complete address string for geocoding
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
          // Update the marker position on the map
          tempMarker.value.setLatLng([coordinates.lat, coordinates.lng]);

          // Center the map on the new position
          map.value.setView([coordinates.lat, coordinates.lng], map.value.getZoom());
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
      }
    }, 500); // 500ms debounce to avoid too many API calls when typing

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

    const getMarkerIcon = (type) => {
      return markerConfigs[type]?.lucideIcon || null;
    };

    const getMarkerColor = (type) => {
      return markerConfigs[type]?.color || '#333333';
    };

    const onSearchChange = () => {
      mapStore.setSearchTerm(searchTerm.value);
    };

    const onFilterChange = () => {
      mapStore.setFilterType(filterType.value);
      showFilterDropdown.value = false;
    };

    const toggleFilterDropdown = () => {
      showFilterDropdown.value = !showFilterDropdown.value;
    };

    const toggleDescriptionTips = () => {
      showDescriptionTips.value = !showDescriptionTips.value;
    };

    const onAddNew = () => {
      mapStore.initNewMarker();

      // Center map at default location
      if (map.value) {
        map.value.setView([markerFormData.value.latitude, markerFormData.value.longitude], 14);
      }

      // Create temporary marker
      if (tempMarker.value) {
        tempMarker.value.remove();
      }

      const icon = createMarkerIcon(markerFormData.value.type);
      tempMarker.value = L.marker(
        [markerFormData.value.latitude, markerFormData.value.longitude],
        { icon }
      ).addTo(map.value);
    };

    // Enhanced onEditMarker with forced marker updates
    const onEditMarker = (marker) => {

      // Set active marker ID FIRST to hide original immediately
      activeEditMarker.value = marker.id;

      // Immediate refresh to hide original marker
      if (mapView.value && typeof mapView.value.refreshMarkers === 'function') {
        mapView.value.refreshMarkers();
      }

      // Then call store method
      mapStore.editMarker(marker);

      // Remove any existing temp marker
      if (tempMarker.value) {
        tempMarker.value.remove();
        tempMarker.value = null;
      }

      // Center map at marker location
      if (map.value) {
        map.value.setView([marker.latitude, marker.longitude], 16);
      }

      // Create temporary marker with small delay to ensure map is ready
      setTimeout(() => {
        try {
          const icon = createMarkerIcon(marker.type);
          if (icon && map.value) {
            tempMarker.value = L.marker(
              [marker.latitude, marker.longitude],
              { icon }
            ).addTo(map.value);

            // Force map to update to ensure marker is visible
            map.value.invalidateSize();
          }
        } catch (err) {
          console.error("Error creating temp marker:", err);
        }
      }, 20);
    };

    // Enhanced onCancelEdit with retries
    const onCancelEdit = () => {

      // First clear temp marker
      if (tempMarker.value) {
        tempMarker.value.remove();
        tempMarker.value = null;
      }

      // Store marker ID being edited before clearing
      const editingId = activeEditMarker.value;

      // Clear local reference
      activeEditMarker.value = null;

      // Call store method to cancel
      mapStore.cancelEdit();
    };

    // Enhanced onSaveMarker with multi-stage refresh
    const onSaveMarker = async () => {

      if (tempMarker.value) {
        tempMarker.value.remove();
        tempMarker.value = null;
      }

      activeEditMarker.value = null;
      mapStore.refreshMarkerLayers();


      // Call store method to save
      const success = await mapStore.saveMarker();

      if (success) {

        setTimeout(() => {
          if (map.value) {
            map.value.invalidateSize();
          }
        }, 300);
      }
    };

    const onDeleteMarker = () => {
      // Store the ID of the marker to delete
      markerToDelete.value = markerFormData.value.id;
      // Open the confirmation modal
      confirmDeleteModalOpen.value = true;
    };

    const confirmMarkerDeletion = async () => {
      // Clear temp marker
      if (tempMarker.value) {
        tempMarker.value.remove();
        tempMarker.value = null;
      }

      // Store the ID to verify deletion
      const deletingId = markerToDelete.value;

      // Clear active marker reference
      activeEditMarker.value = null;

      // Force immediate refresh first to hide visually
      if (mapView.value && typeof mapView.value.refreshMarkers === 'function') {
        mapView.value.refreshMarkers();
      }

      // Call store method to delete
      const success = await mapStore.deleteMarker(deletingId);

      // Close the modal
      confirmDeleteModalOpen.value = false;
      markerToDelete.value = null;
    };

    const cancelMarkerDeletion = () => {
      confirmDeleteModalOpen.value = false;
      markerToDelete.value = null;
    };

    const clearSuccess = () => {
      mapStore.clearSuccess();
    };

    const clearError = () => {
      mapStore.clearError();
    };



    // Watch for changes to marker type to update icon
    watch(() => markerFormData.value.type, (newType) => {
      if (tempMarker.value && map.value) {
        // Update the icon
        const icon = createMarkerIcon(newType);
        tempMarker.value.setIcon(icon);
      }
    });

    watch(() => map.value, (newMap) => {
      if (newMap && props.isAdminMode) {
        // Set up map move event for admin mode
        newMap.on('moveend', () => {
          mapStore.refreshMarkerLayers();
        });
      }
    });

    // Lifecycle hooks
    onMounted(async () => {
      // Fetch markers
      await mapStore.fetchMarkers();

      // Initialize search and filter
      searchTerm.value = mapStore.searchTerm;
      filterType.value = mapStore.filterType;

      document.addEventListener('click', closeDropdownOnOutsideClick);
    });

    onUnmounted(() => {
      // Clean up marker if needed
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

<style scoped>
.custom-select-wrapper {
  position: relative;
  width: 100%;
}

.custom-select {
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  user-select: none;
  height: 42px; /* Match your form control height */
}

.custom-select:hover {
  border-color: #bbb;
}

.dropdown-open {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.3);
}

.selected-option {
  display: flex;
  align-items: center;
  padding: 10px;
  height: 100%;
}

.option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  width: 24px;
  height: 24px;
}

.option-text {
  flex: 1;
}

.dropdown-arrow {
  color: #666;
  font-size: 10px;
  margin-left: 8px;
}

.options-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.option-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
}

.option-item:hover {
  background-color: #f5f5f5;
}

.option-item.selected {
  background-color: #e0f0ff;
}

/* Keep all your existing styles below */
.marker-admin-container {
  display: flex;
  width: 100%;
  height: calc(100vh - 60px);
  gap: 16px;
  padding: 16px;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1010;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 4px;
  z-index: 1020;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.filter-button {
  width: 100%;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-panel {
  flex: 1;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
  max-width: 400px;
  min-width: 320px;
}

.right-panel {
  flex: 2;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

h1 {
  color: #2c3e50;
  font-size: 28px;
  margin-bottom: 24px;
}

/* Form styles */
.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

textarea.form-control {
  resize: vertical;
}

.coordinate-input {
  width: 100%;
}

.button-row {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.ml-auto {
  margin-left: auto;
}

/* Markers list styles */
.search-filter-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.search-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.markers-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  max-height: 475px;
  overflow-y: auto;
}

.marker-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #eee;
}

.marker-icon {
  font-size: 24px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.marker-info {
  flex: 1;
}

.marker-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.marker-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.add-new-btn {
  width: 100%;
}

.empty-markers {
  padding: 20px;
  text-align: center;
  color: #666;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #eee;
}

.click-info {
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
}

.marker-delete-modal {
  z-index: 2000 !important; /* Higher than map and other UI elements */
  position: fixed !important;
}

/* Make sure any overlay in the ConfirmModal has the same high z-index */
.marker-delete-modal .fixed {
  z-index: 2000 !important;
}
/* Responsive styles */
@media (max-width: 768px) {
  .marker-admin-container {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 60px);
  }

  .left-panel {
    max-width: 100%;
    min-width: 100%;
    order: 2;
  }

  .right-panel {
    height: 400px;
    order: 1;
    margin-bottom: 16px;
  }

  .markers-container {
    max-height: 300px;
  }
}

.description-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: rgb(239, 246, 255);
  color: rgb(59, 130, 246);
  border-radius: 50%;
  border: none;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.info-btn:hover {
  background-color: rgb(219, 234, 254);
}

/* Tips box styling */
.tips-box {
  background-color: rgb(239, 246, 255);
  color: rgb(59, 130, 246);
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
  position: relative;
}

/* Close button - positioned in the corner */
.close-tips-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  color: rgb(59, 130, 246);
  font-weight: bold;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.close-tips-btn:hover {
  color: rgb(0, 0, 0);
}

/* Tips list */
.tips-list {
  list-style-type: disc;
  padding-left: 20px;
  margin: 0;
}

.tips-list li {
  margin-bottom: 8px;
  font-size: 14px;
  color: rgb(59, 130, 246);
}

.tips-list li:last-child {
  margin-bottom: 0;
}

.filter-dropdown {
  position: relative;
}

.filter-option {
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.filter-option:hover {
  background-color: #f1f1f1;
}

.filter-label-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  cursor: pointer;
}

.filter-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.filter-label {
  cursor: pointer;
}

.filter-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
}
</style>
