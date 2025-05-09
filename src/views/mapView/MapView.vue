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

    <ClosestFacilityFinder v-if="!isLoadingMarkers && !markersLoadError && !isAdminMode" />

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
import { useLocationStore } from '@/stores/map/LocationStore.js'
import { LocateFixed } from 'lucide-vue-next'
import MapSearchBar from '@/components/map/MapSearchBar.vue';
import markerConfigService from '@/service/map/markerConfigService.js'

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
    },
    markers: {
      type: Array,
      default: () => []
    },
    editingMarkerId: {
      type: String,
      default: null
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
    const locationStore = useLocationStore()
    const householdId = householdStore.currentHousehold?.id || null

    // Get location related state from the location store
    const isSharing = computed(() => locationStore.isSharing)
    const locationError = computed(() => locationStore.locationError)

    const { subscribeToPosition, fetchHouseholdPositions, connected } = useWebSocket()

    // Use storeToRefs for reactive properties
    const { isLoadingMarkers, markersLoadError, notification, activeRoute } =
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
          mapInitialized.value = true

          // Common map initialization - emit map-ready event
          emit('map-ready', map.value);

          // Process user positions for both admin and regular mode
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
              positions.forEach((pos) => handlePositionUpdate(pos))
            } else {
              console.warn('Expected positions array but received:', positions)
            }
          } catch (error) {
            console.error('Error fetching household positions:', error)
          }

          // Admin-specific setup
          if (props.isAdminMode) {

            // Set up click handler for admin mode
            map.value.on('click', (e) => {
              emit('map-click', e);
            });

            // Sync admin markers to the map store if provided
            if (props.markers && props.markers.length > 0) {
              syncAdminMarkersToStore();
            }
          }

          // Add additional timeout to ensure markers are refreshed after map is ready
          setTimeout(() => {
            mapStore.refreshMarkerLayers();
          }, 500);
        }
      } catch (error) {
        console.error('Map initialization failed:', error)
      }

      window.addEventListener('resize', handleResize)
    })

    // Function to sync admin markers to the map store for unified handling
    const syncAdminMarkersToStore = () => {
      if (!props.isAdminMode || !props.markers || !props.markers.length) return;

      // Convert admin markers to the format expected by the map store
      // and add them to a special admin layer in the store
      const adminMarkers = props.markers.map(marker => ({
        id: marker.id,
        lat: marker.latitude,
        lng: marker.longitude,
        type: marker.type,
        name: marker.name || '',
        address: marker.address || '',
        description: marker.description || '',
        contactInfo: marker.contactInfo || '',
        openingHours: marker.openingHours || '',
        // Add a flag to identify admin markers
        isAdminMarker: true,
        // Add editingMarkerId to allow filtering
        editingMarkerId: props.editingMarkerId
      }));

      // Update the store with these markers
      mapStore.setAdminMarkers(adminMarkers);
    };

    // Watch for changes in the markers prop from the parent component
    watch(() => props.markers, () => {
      if (props.isAdminMode && map.value) {
        syncAdminMarkersToStore();
      }
    }, { deep: true });

    // Watch for changes in the editingMarkerId
    watch(() => props.editingMarkerId, (newId, oldId) => {
      if (props.isAdminMode && map.value) {
        syncAdminMarkersToStore();
      }
    });

    watch(() => connected.value && householdId, (isConnected) => {
      if (isConnected && householdId) {
        subscribeToPosition(householdId, handlePositionUpdate)
      }
    })

    // When the map changes (after initialization), set up the map move handler
    watch(() => map.value, (newMap) => {
      if (newMap && props.isAdminMode) {
        // Set up map move event for admin mode
        newMap.on('moveend', () => {
          mapStore.refreshMarkerLayers();
        });
      }
    });

    // Clean up on unmount
    onUnmounted(() => {
      if (map.value && props.isAdminMode) {
        map.value.off('moveend');
      }
      window.removeEventListener('resize', handleResize);
    });

    const handlePositionUpdate = (positionData) => {

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
      }
    }

    function updateUserMarker(userId, name, longitude, latitude, isCurrentUser = false) {

      // First check if marker already exists
      if (userMarkers.value.has(userId)) {
        const marker = userMarkers.value.get(userId)
        marker.setLatLng([latitude, longitude])
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

.map-search-container {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 400px;
  z-index: 1000;
}

.location-services-container {
  position: absolute;
  bottom: 40px;
  right: 60px;
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

@media (max-width: 767px) {
  .map-search-container {
    top: 10px;
    max-width: 50%;
  }

  .location-services-button {
    padding: 6px 10px;
    font-size: 12px;
  }
}

#map {
  width: 100%;
  height: 100%;
}

:deep(.leaflet-top.leaflet-right > div) {
  display: none;
}

.map-notification {
  position: absolute;
  bottom: 40px;
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
  top: 48px;
  left: 16px;
  z-index: 1000;
  transition: all 0.3s ease;
  max-width: 100%;
  width: auto;
}

.filter-toggle-button {
  display: block;
  width: 100%;
  background-color: white;
  border: none;
  text-align: center;
  font-weight: 500;
  color: #000000;
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

:deep(.leaflet-control-zoom) {
  position: absolute !important;
  bottom: 20px !important;
  right: 0 !important;
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

@media (max-width: 767px) {
  :deep(.leaflet-control-zoom) {
    bottom: 40px !important;
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
    top: 70px;
  }
}
</style>



