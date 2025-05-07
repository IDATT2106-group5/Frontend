<!-- src/views/admin/MarkerAdmin.vue -->
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
        @map-ready="onMapReady"
        @map-click="onMapClick"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useMarkerAdminStore } from '@/stores/admin/markerAdminStore';
import { storeToRefs } from 'pinia';
import MarkerConfigService from '@/service/map/markerConfigService';
import MapView from '@/views/mapView/MapView.vue';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import L from 'leaflet';

export default {
  name: 'markerAdmin',
  components: {
    MapView,
    Button,
    Input,
  },

  setup() {
    const mapView = ref(null);
    const map = ref(null);
    const tempMarker = ref(null);
    const showFilterDropdown = ref(false);
    const showDescriptionTips = ref(false);
    const dropdownOpen = ref(false);

    // Map configuration
    const mapCenter = ref([63.4305, 10.3951]); // Trondheim
    const mapZoom = ref(13);

    const markerAdminStore = useMarkerAdminStore();
    const {
      markers,
      filteredMarkers,
      markerFormData,
      isEditing,
      isCreating,
      isLoading,
      error,
      success
    } = storeToRefs(markerAdminStore);

    const searchTerm = ref('');
    const filterType = ref('');

    // Get marker configurations
    const markerConfigs = MarkerConfigService.getMarkerConfigs();

    // Computed properties
    const markerTypes = computed(() => markerAdminStore.markerTypes);

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
      console.log("Map click handler called:", e.latlng);

      // Only proceed if in edit or create mode
      if (!isEditing.value && !isCreating.value) {
        console.log("Click ignored: not in edit or create mode");
        return;
      }

      const { lat, lng } = e.latlng;

      console.log("Updating coordinates to:", lat, lng);

      // Update form data with the new coordinates
      markerFormData.value.latitude = lat;
      markerFormData.value.longitude = lng;

      // Also update through the store to ensure reactivity
      markerAdminStore.updateMarkerCoordinates(lat, lng);

      // Update or create temporary marker
      if (tempMarker.value) {
        tempMarker.value.setLatLng([lat, lng]);
        console.log("Updated existing marker position");
      } else {
        const icon = createMarkerIcon(markerFormData.value.type);
        tempMarker.value = L.marker([lat, lng], { icon }).addTo(map.value);
        console.log("Created new temporary marker");
      }

      // Perform reverse geocoding to get address information
      try {
        const addressInfo = await markerAdminStore.updateAddressFromCoordinates(lat, lng);
        console.log("Address updated based on new coordinates:", addressInfo);
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

    // Add this method to the setup() function in MarkerAdmin.vue
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
        const coordinates = await markerAdminStore.updateCoordinatesFromAddress(addressQuery);

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
      markerAdminStore.setSearchTerm(searchTerm.value);
    };

    const onFilterChange = () => {
      markerAdminStore.setFilterType(filterType.value);
      showFilterDropdown.value = false;
    };

    const toggleFilterDropdown = () => {
      showFilterDropdown.value = !showFilterDropdown.value;
    };

    const toggleDescriptionTips = () => {
      showDescriptionTips.value = !showDescriptionTips.value;
    };

    const onAddNew = () => {
      markerAdminStore.initNewMarker();

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

    const onEditMarker = (marker) => {
      markerAdminStore.editMarker(marker);

      // Center map at marker location
      if (map.value) {
        map.value.setView([marker.latitude, marker.longitude], 16);
      }

      // Create temporary marker
      if (tempMarker.value) {
        tempMarker.value.remove();
      }

      const icon = createMarkerIcon(marker.type);
      tempMarker.value = L.marker(
        [marker.latitude, marker.longitude],
        { icon }
      ).addTo(map.value);
    };

    const onSaveMarker = async () => {
      const success = await markerAdminStore.saveMarker();

      if (success) {
        // Clear temporary marker
        if (tempMarker.value) {
          tempMarker.value.remove();
          tempMarker.value = null;
        }

        // If we've successfully saved the marker, add it to the map immediately
        if (map.value) {
          // Get the marker data we just saved
          const savedMarkerData = {
            id: markerFormData.value.id,
            type: markerFormData.value.type,
            name: markerFormData.value.name || '',
            address: `${markerFormData.value.address}, ${markerFormData.value.postalCode}, ${markerFormData.value.city}`,
            lat: markerFormData.value.latitude,
            lng: markerFormData.value.longitude,
            description: markerFormData.value.description,
            contactInfo: markerFormData.value.contactInfo,
            openingHours: markerFormData.value.openingHours
          };

          // Find the marker type configuration
          const markerType = markerTypes.value.find(t => t.id === savedMarkerData.type);

          if (markerType) {
            // Create icon for the saved marker
            const icon = createMarkerIcon(savedMarkerData.type);

            // Create and add the marker to the map
            const marker = L.marker([savedMarkerData.lat, savedMarkerData.lng], { icon });

            // Create popup for the marker
            const popupContent = MarkerConfigService.createMarkerPopupContent(savedMarkerData);
            marker.bindPopup(popupContent);

            // Add the marker to the map
            marker.addTo(map.value);

            // Optionally: flash or highlight the marker to show it was saved
            setTimeout(() => {
              marker.openPopup();
            }, 300);
          }
        }
      }
    };

    const onCancelEdit = () => {
      markerAdminStore.cancelEdit();

      // Clear temporary marker
      if (tempMarker.value) {
        tempMarker.value.remove();
        tempMarker.value = null;
      }
    };

    const onDeleteMarker = async () => {
      if (!confirm('Er du sikker på at du vil slette denne markøren?')) {
        return;
      }

      const success = await markerAdminStore.deleteMarker(markerFormData.value.id);

      if (success) {
        // Clear temporary marker
        if (tempMarker.value) {
          tempMarker.value.remove();
          tempMarker.value = null;
        }
      }
    };

    const clearSuccess = () => {
      markerAdminStore.clearSuccess();
    };

    const clearError = () => {
      markerAdminStore.clearError();
    };

    // Watch for changes to marker type to update icon
    watch(() => markerFormData.value.type, (newType) => {
      if (tempMarker.value && map.value) {
        // Update the icon
        const icon = createMarkerIcon(newType);
        tempMarker.value.setIcon(icon);
      }
    });

    // Lifecycle hooks
    onMounted(async () => {
      // Fetch markers
      await markerAdminStore.fetchMarkers();

      // Initialize search and filter
      searchTerm.value = markerAdminStore.searchTerm;
      filterType.value = markerAdminStore.filterType;

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
