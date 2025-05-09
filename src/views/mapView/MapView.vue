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
        isAdminMarker: true,
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

      // Check if marker already exists
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
      isSharing,
      locationError,
      togglePositionSharing,
      activeRoute,
    }
  },
}
</script>

<template>
  <div class="w-full h-[calc(100vh-60px)] relative overflow-hidden">
    <div id="map" ref="mapContainer" class="w-full h-full"></div>

    <!-- Location Services Control -->
    <div class="absolute bottom-10 right-16 z-50">
      <Button
        @click="togglePositionSharing"
        variant="default"
        class="flex items-center gap-2 bg-white text-gray-700 font-medium p-2 px-3 rounded-lg shadow-md cursor-pointer transition-all duration-200"
        :class="{ 'bg-blue-500 text-white': isSharing }"
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
      <div v-if="locationError" class="mt-2 p-2 px-3 bg-red-100 border border-red-500 rounded-lg text-xs text-red-500">
        {{ locationError }}
      </div>
    </div>

    <!-- Add notification display with proper v-if check -->
    <transition name="fade">
      <div v-if="notification" class="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black/70 text-white p-2 px-4 rounded z-50 text-sm">
        {{ notification }}
      </div>
    </transition>

    <ClosestFacilityFinder v-if="!isLoadingMarkers && !markersLoadError && !isAdminMode" />

    <!-- Add the search bar -->
    <div class="absolute top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm z-50">
      <MapSearchBar />
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoadingMarkers" class="absolute inset-0 bg-white/70 flex flex-col justify-center items-center z-50">
      <div class="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-2"></div>
      <div class="text-base text-gray-700">Laster kart data...</div>
    </div>

    <!-- Error message -->
    <div v-if="markersLoadError" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-lg shadow-lg text-center z-50 w-4/5 max-w-md">
      {{ markersLoadError }}
      <Button @click="retryLoadMarkers" variant="primary" class="mt-3 p-2 px-4 bg-blue-500 hover:bg-blue-600 text-white border-none rounded cursor-pointer">
        Prøv på nytt
      </Button>
    </div>

    <!-- Marker Filter -->
    <div class="absolute top-16 left-4 z-50 transition-all duration-300 max-w-full w-auto"
         :class="{ 'collapsed': isFilterCollapsed }"
         v-if="!isAdminMode">
      <Button
        v-if="isMobileView"
        @click="toggleFilterCollapse"
        variant="default"
        class="w-full bg-white border-none text-center font-medium text-black cursor-pointer shadow-md hover:bg-gray-200"
      >
        <span v-if="isFilterCollapsed">Vis filter</span>
        <span v-else>Skjul filter</span>
      </Button>
      <div :class="['transition-all duration-300', { 'max-h-0 opacity-0 overflow-hidden mt-0': isFilterCollapsed && isMobileView, 'max-h-[500px] opacity-100 mt-3': !isFilterCollapsed || !isMobileView }]">
        <MarkerFilter v-if="!isLoadingMarkers && !markersLoadError" :isMobileView="isMobileView" />
      </div>
    </div>
  </div>
</template>

<!-- CSS for zoom buttons and marker icons -->
<style scoped>
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

#map {
  z-index: 10;
}

@media (max-width: 767px) {
  :deep(.leaflet-control-zoom) {
    bottom: 20px !important;
  }

  :deep(.leaflet-control-zoom-in),
  :deep(.leaflet-control-zoom-out) {
    width: 30px;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fade-in-out {
  0% { opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
