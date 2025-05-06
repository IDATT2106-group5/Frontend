<template>
  <div class="map-container">
    <div id="map" ref="mapContainer"></div>

    <!-- Add notification display with proper v-if check -->
    <transition name="fade">
      <div v-if="notification" class="map-notification">
        {{ notification }}
      </div>
    </transition>

    <!-- Add the search bar -->
    <div class="map-search-container">
      <MapSearchBar />
    </div>

    <!-- Existing components with proper condition checks -->
    <div class="closest-facility-container" v-if="!isLoadingMarkers && !markersLoadError">
      <ClosestFacilityFinder />
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoadingMarkers" class="map-loading-overlay">
      <div class="map-loading-spinner"></div>
      <div class="map-loading-text">Laster kart data...</div>
    </div>

    <!-- Error message -->
    <div v-if="markersLoadError" class="map-error-message">
      {{ markersLoadError }}
      <Button @click="retryLoadMarkers" variant="primary" class="retry-button">
        Prøv på nytt</Button>
    </div>

    <!-- Custom Layer Controls -->
    <div class="layer-control-container" :class="{ 'collapsed': isLayerCollapsed }">
      <Button
        v-if="isMobileView"
        @click="toggleLayerCollapse"
        variant="default"
        class="layer-toggle-button"
      >
        <span v-if="isLayerCollapsed">Vis informasjonslag</span>
        <span v-else>Skjul informasjonslag</span>
      </Button>
      <div :class="['layer-content', { 'hidden': isLayerCollapsed && isMobileView }]">
        <div class="layer-controls">
          <button
            v-for="layer in layerOptions"
            :key="layer.id"
            :class="['layer-button', { active: activeLayerId === layer.id }]"
            @click="setActiveLayer(layer.id)"
          >
            <div class="layer-icon" :class="[`${layer.id}-icon`]"></div>
            <div class="layer-name">{{ layer.name }}</div>
          </button>
        </div>
      </div>
    </div>

    <!-- Marker Filter -->
    <div class="marker-filter-container" :class="{ 'collapsed': isFilterCollapsed }">
      <Button
        v-if="isMobileView"
        @click="toggleFilterCollapse"
        variant="default"
        class="filter-toggle-button"
      >
        <span v-if="isFilterCollapsed">Vis filter</span>
        <span v-else>Skjul filter</span>
      </Button>
      <div :class="['filter-content', { 'hidden': isFilterCollapsed && isMobileView }]">
        <MarkerFilter
          v-if="!isLoadingMarkers && !markersLoadError"
          :isMobileView="isMobileView"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, onUnmounted, computed } from 'vue';
import { useMapStore } from '@/stores/map/mapStore';
import { storeToRefs } from 'pinia';
import MarkerFilter from '@/components/map/MarkerFilter.vue';
import Button from '@/components/ui/button/Button.vue';
import MapSearchBar from '@/components/map/MapSearchBar.vue';
import 'leaflet/dist/leaflet.css';
import ClosestFacilityFinder from "@/components/map/ClosestFacilityFinder.vue";

export default {
  name: 'EmergencyMap',
  components: {
    ClosestFacilityFinder,
    MarkerFilter,
    Button,
    MapSearchBar
  },
  setup() {
    const mapContainer = ref(null);
    const mapStore = useMapStore();
    const windowWidth = ref(window.innerWidth);
    const isFilterCollapsed = ref(false);
    const isLayerCollapsed = ref(false);

    // Use storeToRefs for reactive properties
    const {
      layerOptions,
      activeLayerId,
      isLoadingMarkers,
      markersLoadError,
      notification
    } = storeToRefs(mapStore);

    // Determine if we're in mobile view
    const isMobileView = computed(() => {
      return windowWidth.value < 768; // Common breakpoint for mobile
    });

    // Set initial collapsed states based on screen size
    onMounted(() => {
      isFilterCollapsed.value = isMobileView.value;
      isLayerCollapsed.value = isMobileView.value;
      mapStore.initMap(mapContainer.value);

      // Add resize event listener
      window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
      // Clean up event listener
      window.removeEventListener('resize', handleResize);

      // Clean up map
      mapStore.cleanupMap();
    });

    const handleResize = () => {
      windowWidth.value = window.innerWidth;
      mapStore.resizeMap();

      // Auto-collapse filter and layers on small screens when resizing
      if (isMobileView.value) {
        if (!isFilterCollapsed.value) {
          isFilterCollapsed.value = true;
        }
        if (!isLayerCollapsed.value) {
          isLayerCollapsed.value = true;
        }
      }
    };

    const setActiveLayer = (layerId) => {
      mapStore.setActiveLayer(layerId);
    };

    const retryLoadMarkers = () => {
      mapStore.initMarkers();
    };

    const toggleFilterCollapse = () => {
      isFilterCollapsed.value = !isFilterCollapsed.value;
      // When expanding filter, we need to resize map after a small delay
      // to account for the new layout
      if (!isFilterCollapsed.value) {
        setTimeout(() => {
          mapStore.resizeMap();
        }, 300);
      }
    };

    const toggleLayerCollapse = () => {
      isLayerCollapsed.value = !isLayerCollapsed.value;
      // When expanding layers, we need to resize map after a small delay
      if (!isLayerCollapsed.value) {
        setTimeout(() => {
          mapStore.resizeMap();
        }, 300);
      }
    };

    return {
      mapContainer,
      layerOptions,
      activeLayerId,
      setActiveLayer,
      isLoadingMarkers,
      markersLoadError,
      retryLoadMarkers,
      isMobileView,
      isFilterCollapsed,
      toggleFilterCollapse,
      isLayerCollapsed,
      toggleLayerCollapse,
      notification
    };
  }
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: calc(100vh - 60px);
  position: relative;
  overflow: hidden;
}

/* Search container */
.map-search-container {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 400px;
  z-index: 1000;
}

.closest-facility-container {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1000;
}

@media (max-width: 767px) {
  .closest-facility-container {
    top: auto;
    bottom: 16px;
    right: 16px;
  }

  .map-search-container {
    top: 10px;
    max-width: 90%;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

#map {
  width: 100%;
  height: 100%;
}

/* Custom Marker Popup Styles */
.marker-popup-container {
  padding: 4px;
}

.marker-info-content {
  margin-bottom: 12px;
}

.marker-popup {
  min-width: 200px;
}

.marker-popup h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
}

.marker-popup p {
  margin: 4px 0;
  font-size: 14px;
}

.marker-popup-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  border-top: 1px solid #eee;
  padding-top: 8px;
}

.marker-route-button {
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.marker-route-button:hover {
  background-color: #388e3c;
}

/* Map Notification */
.map-notification {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  z-index: 1000;
  font-size: 14px;
}

@keyframes fade-in-out {
  0% { opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { opacity: 0; }
}

/* Layer Control Container */
.layer-control-container {
  position: absolute;
  bottom: 30px;
  left: 16px;
  z-index: 1000;
  transition: all 0.3s ease;
  max-width: 100%;
  width: auto;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

/* Layer Toggle Button (for mobile) */
.layer-toggle-button {
  padding: 10px 16px;
  background-color: white;
  border: none;
  border-radius: 12px;
  text-align: center;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.layer-content {
  transition: all 0.3s ease;
  opacity: 1;
  margin-left: 12px;
}

.layer-content.hidden {
  width: 0;
  opacity: 0;
  overflow: hidden;
  margin-left: 0;
  visibility: hidden;
}

.layer-content:not(.hidden) {
  visibility: visible;
}

/* Layer Controls */
.layer-controls {
  display: flex;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  padding: 4px;
}

.layer-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 8px;
  padding: 8px 10px;
  margin: 0 2px;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 65px;
}

.layer-button:hover {
  background-color: #f5f5f5;
}

.layer-button.active {
  background-color: #f0f0f0;
}

.layer-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  transition: all 0.2s;
}

.satellite-icon {
  background-color: #212121;
}

.terrain-icon {
  background-color: #e8f5e9;
}

.standard-icon {
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
}

.layer-name {
  font-size: 11px;
  color: #333;
  font-weight: 500;
}

.marker-filter-container {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 1000;
  transition: all 0.3s ease;
  max-width: 100%;
  width: auto;
}

.filter-toggle-button {
  display: block;
  width: 100%;
  padding: 10px 16px;
  background-color: white;
  border: none;
  border-radius: 12px;
  text-align: center;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.filter-content {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: 500px;
  opacity: 1;
}

.filter-content.hidden {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  margin-top: 0;
}

.filter-content:not(.hidden) {
  margin-top: 12px;
}

/* Custom Zoom Controls */
:deep(.leaflet-control-zoom) {
  position: absolute !important;
  bottom: 16px !important;
  right: 10px !important;
  margin: 20px !important;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

:deep(.leaflet-control-zoom-in),
:deep(.leaflet-control-zoom-out) {
  width: 36px;
  height: 36px;
  line-height: 36px;
  background-color: white;
  color: #333;
  font-size: 18px;
  font-weight: bold;
  display: block;
}

:deep(.leaflet-control-zoom-in) {
  border-bottom: 1px solid #eee;
}

:deep(.leaflet-control-zoom-in:hover),
:deep(.leaflet-control-zoom-out:hover) {
  background-color: #f0f0f0;
}

:deep(.leaflet-control-attribution) {
  display: none;
}

:deep(.custom-div-icon) {
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

/* Search result marker styles */
:deep(.search-result-icon) {
  z-index: 1000 !important;
}

.map-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.map-loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.map-loading-text {
  font-size: 16px;
  color: #333;
}

.map-error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
  z-index: 1000;
  width: 80%;
  max-width: 400px;
}

.retry-button {
  margin-top: 12px;
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-button:hover {
  background-color: #2980b9;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile-specific styles */
@media (max-width: 767px) {
  .layer-controls {
    padding: 2px;
    flex-wrap: nowrap;
  }

  .layer-button {
    padding: 6px 8px;
    min-width: 54px;
  }

  .layer-icon {
    width: 32px;
    height: 32px;
    margin-bottom: 2px;
  }

  .layer-name {
    font-size: 10px;
  }

  .layer-control-container {
    flex-direction: row;
    align-items: center;
  }

  .layer-content {
    height: auto;
    margin-bottom: 0;
  }

  :deep(.leaflet-control-zoom) {
    bottom: 16px !important;
  }

  :deep(.leaflet-control-zoom-in),
  :deep(.leaflet-control-zoom-out) {
    width: 30px;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
  }

  .map-loading-spinner {
    width: 30px;
    height: 30px;
  }

  .map-loading-text {
    font-size: 14px;
  }

  .marker-filter-container {
    top: 70px; /* Moved below search bar on mobile */
  }
}
</style>
