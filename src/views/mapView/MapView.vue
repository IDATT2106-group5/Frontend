<template>
  <div class="map-container">
    <div id="map" ref="mapContainer"></div>

    <!-- Location Services Control -->
    <div class="location-services-container">
      <Button
        @click="togglePositionSharing"
        variant="default"
        class="location-services-button"
        :class="{ 'services-active': isSharing }"
      >
        <div class="relative">
          <LocateFixed class="w-5 h-5" />
          <div v-if="!isSharing" class="absolute inset-0 flex items-center justify-center">
            <div class="w-5 h-0.5 bg-red-500 -rotate-45 rounded-full"></div>
          </div>
        </div>
        <span>
          {{ isSharing ? 'Stedstjenester på' : 'Stedstjenester av' }}
        </span>
      </Button>
      <div v-if="locationError" class="location-error-message">
        {{ locationError }}
      </div>
    </div>

    <!-- Add notification display with proper v-if check -->
    <transition name="fade">
      <div v-if="notification" class="map-notification">
        {{ notification }}
      </div>
    </transition>

    <ClosestFacilityFinder v-if="!isLoadingMarkers && !markersLoadError" />

    <!-- Add the search bar -->
    <div class="map-search-container">
      <MapSearchBar />
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
        Prøv på nytt
      </Button>
    </div>

    <!-- Marker Filter -->
    <div class="marker-filter-container" :class="{ collapsed: isFilterCollapsed }" v-if="!isAdminMode">
      <Button
        v-if="isMobileView"
        @click="toggleFilterCollapse"
        variant="default"
        class="filter-toggle-button"
      >
        <span v-if="isFilterCollapsed">Vis filter</span>
        <span v-else>Skjul filter</span>
      </Button>
      <div :class="['filter-content', { hidden: isFilterCollapsed && isMobileView }]">
        <MarkerFilter v-if="!isLoadingMarkers && !markersLoadError" :isMobileView="isMobileView" />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useMapStore } from '@/stores/map/mapStore'
import { storeToRefs } from 'pinia'
import MarkerFilter from '@/components/map/MarkerFilter.vue'
import Button from '@/components/ui/button/Button.vue'
import 'leaflet/dist/leaflet.css'
import useWebSocket from '@/service/websocketComposable.js'
import L from 'leaflet'
import ClosestFacilityFinder from '@/components/map/ClosestFacilityFinder.vue'
import { useUserStore } from '@/stores/UserStore.js'
import { useHouseholdStore } from '@/stores/HouseholdStore.js'
import { useLocationStore } from '@/stores/map/LocationStore.js' // Import the new store
import { LocateFixed } from 'lucide-vue-next' // Import the icon
import MapSearchBar from '@/components/map/MapSearchBar.vue';

export default {
  name: 'MapView',
  components: {
    ClosestFacilityFinder,
    MarkerFilter,
    Button,
    LocateFixed,
    MapSearchBar
  },
  props: {
    center: {
      type: Array,
      default: () => [63.4305, 10.3951]
    },
    zoom: {
      type: Number,
      default: 13
    },
    isAdminMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['map-ready', 'map-click'],
  setup(props, { emit }) {
    const mapContainer = ref(null)
    const mapStore = useMapStore()
    const windowWidth = ref(window.innerWidth)
    const isFilterCollapsed = ref(false)
    const userMarkers = ref(new Map())
    const userPositions = ref(new Map())
    const map = ref(null)
    const mapInitialized = ref(false)
    const userStore = useUserStore()
    const householdStore = useHouseholdStore()
    const locationStore = useLocationStore() // Use the location store
    const householdId = householdStore.currentHousehold?.id || null

    // Get location related state from the location store
    const isSharing = computed(() => locationStore.isSharing)
    const locationError = computed(() => locationStore.locationError)

    const { subscribeToPosition, fetchHouseholdPositions, connected } = useWebSocket()

    // Use storeToRefs for reactive properties
    const { layerOptions, activeLayerId, isLoadingMarkers, markersLoadError, notification, activeRoute } =
      storeToRefs(mapStore)

    const isMobileView = computed(() => {
      return windowWidth.value < 768 // Common breakpoint for mobile
    })

    function togglePositionSharing() {
      locationStore.togglePositionSharing()
    }

    onMounted(async () => {
      isFilterCollapsed.value = isMobileView.value

      try {
        map.value = await mapStore.initMap(mapContainer.value)

        if (map.value) {
          console.log('Map initialized successfully')
          mapInitialized.value = true

          emit('map-ready', map.value);

          // If in admin mode, set up click handler directly on the Leaflet map
          if (props.isAdminMode) {
            console.log("Setting up admin mode click handler");
            map.value.on('click', (e) => {
              console.log("Leaflet map click:", e.latlng);
              emit('map-click', e);
            });
          } else {
            // Only process user positions if not in admin mode
            // Process any stored positions that came in before map initialization
            userPositions.value.forEach((position, userId) => {
              const isCurrentUser = userId === userStore.user.id
              updateUserMarker(userId, position.fullName, position.longitude, position.latitude, isCurrentUser)
            })

            if (connected.value && householdId) {
              subscribeToPosition(householdId, handlePositionUpdate)
            }

            try {
              const positions = await fetchHouseholdPositions()
              if (Array.isArray(positions)) {
                console.log(`Received ${positions.length} initial positions`)
                positions.forEach((pos) => handlePositionUpdate(pos))
              } else {
                console.warn('Expected positions array but received:', positions)
              }
            } catch (error) {
              console.error('Error fetching household positions:', error)
            }
          }
        }
      } catch (error) {
        console.error('Map initialization failed:', error)
      }

      window.addEventListener('resize', handleResize)
    })

    watch(() => connected.value && householdId, (isConnected) => {
      if (isConnected && householdId && !props.isAdminMode) {
        subscribeToPosition(householdId, handlePositionUpdate)
      }
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)

      userMarkers.value.forEach((marker) => {
        if (map.value) {
          map.value.removeLayer(marker)
        }
      })

      mapStore.cleanupMap()
    })

    const handlePositionUpdate = (positionData) => {
      // Skip if in admin mode
      if (props.isAdminMode) return;

      console.log('Handling position update:', positionData)

      if (!positionData) {
        console.warn('Received empty position data')
        return
      }

      const { userId, fullName, longitude, latitude } = positionData

      if (
        !userId ||
        longitude === null ||
        latitude === null ||
        fullName === null ||
        isNaN(parseFloat(longitude)) ||
        isNaN(parseFloat(latitude))
      ) {
        console.warn(`Invalid position data for user ${userId}: (${longitude}, ${latitude})`)
        return
      }

      const parsedLong = parseFloat(longitude)
      const parsedLat = parseFloat(latitude)

      userPositions.value.set(userId, {
        latitude: parsedLat,
        longitude: parsedLong,
        fullName: fullName
      })

      if (mapInitialized.value && map.value) {
        const isCurrentUser = userId === userStore.user.id
        const name = fullName.split(' ')[0]
        updateUserMarker(userId, name, parsedLong, parsedLat, isCurrentUser)
      } else {
        console.log(`Map not ready yet. Storing position for user ${userId} for later display`)
      }
    }

    function updateUserMarker(userId, name, longitude, latitude, isCurrentUser = false) {
      // Skip if in admin mode
      if (props.isAdminMode) return;

      // First check if marker already exists
      if (userMarkers.value.has(userId)) {
        const marker = userMarkers.value.get(userId)
        marker.setLatLng([latitude, longitude])
        console.log(`Updated existing marker for user ${userId}`)
        return
      }

      try {
        let markerIcon

        if (isCurrentUser) {
          markerIcon = L.divIcon({
            className: 'user-position-marker current-user-marker',
            html: `<div style="position: relative; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;">
                <style>
                  @keyframes pulsate {
                    0% { transform: scale(0.8); opacity: 0.8; }
                    100% { transform: scale(2); opacity: 0; }
                  }
                </style>
                <div style="position: absolute; top: 5px; left: 5px; width: 30px; height: 30px; background-color: rgba(0,196,255,0.55); border-radius: 50%; animation: pulsate 1.5s ease-out infinite;"></div>
                <div style="position: relative; background-color: #009dff; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
                  Me
                </div>
              </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          })
        } else {
          markerIcon = L.divIcon({
            className: 'user-position-marker',
            html: `<div style="background-color: #ff4d4f; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${name}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          })
        }

        const newMarker = L.marker([latitude, longitude], {
          icon: markerIcon,
        })

        // Check if map is properly initialized before adding
        if (map.value && typeof map.value.addLayer === 'function') {
          newMarker.addTo(map.value)
          userMarkers.value.set(userId, newMarker)
          console.log(`Created new marker for user ${userId}`)
        } else {
          console.error(`Cannot add marker: map instance is not properly initialized`, map.value)
          userMarkers.value.set(userId, newMarker)
        }
      } catch (error) {
        console.error(`Error creating marker for user ${userId}:`, error)
      }
    }

    const handleResize = () => {
      windowWidth.value = window.innerWidth
      mapStore.resizeMap()

      // Auto-collapse filter on small screens when resizing
      if (isMobileView.value) {
        if (!isFilterCollapsed.value) {
          isFilterCollapsed.value = true
        }
      }
    }

    const retryLoadMarkers = () => {
      mapStore.initMarkers()
    }

    const toggleFilterCollapse = () => {
      isFilterCollapsed.value = !isFilterCollapsed.value
      // When expanding filter, we need to resize map after a small delay
      // to account for the new layout
      if (!isFilterCollapsed.value) {
        setTimeout(() => {
          mapStore.resizeMap()
        }, 300)
      }
    }

    return {
      mapContainer,
      isLoadingMarkers,
      markersLoadError,
      retryLoadMarkers,
      isMobileView,
      isFilterCollapsed,
      toggleFilterCollapse,
      notification,
      map,
      userMarkers,
      userPositions,
      isAdminMode: props.isAdminMode,
      isSharing, // Expose from location store
      locationError, // Expose from location store
      togglePositionSharing, // Expose from location store
      activeRoute,
    }
  },
}
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

/* Location Services Styling */
.location-services-container {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 1000;
}

.location-services-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: white;
  color: #333;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.2s ease;
}

.location-services-button.services-active {
  background-color: #0088ff;
  color: white;
}

.location-error-message {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #ffdddd;
  border: 1px solid #ff4d4f;
  border-radius: 8px;
  font-size: 12px;
  color: #ff4d4f;
}

/* Moving the marker filter below location services */
.marker-filter-container {
  position: absolute;
  top: 70px; /* Moved down to account for location services */
  left: 16px;
  z-index: 1000;
  transition: all 0.3s ease;
  max-width: 100%;
  width: auto;
}

/* Rest of the original styles */
.closest-facility-container {
  position: absolute;
  top: 55px;
  right: 8px;
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

  /* Adjust location services on mobile */
  .location-services-button {
    padding: 6px 10px;
    font-size: 12px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
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

:deep(.leaflet-top.leaflet-right > div) {
  display: none;
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
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
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
