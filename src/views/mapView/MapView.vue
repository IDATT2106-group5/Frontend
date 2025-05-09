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
    MapSearchBar,
  },
  props: {
    center: {
      type: Array,
      default: () => [63.4305, 10.3951],
    },
    zoom: {
      type: Number,
      default: 13,
    },
    isAdminMode: {
      type: Boolean,
      default: false,
    },
    markers: {
      type: Array,
      default: () => [],
    },
    editingMarkerId: {
      type: String,
      default: null,
    },
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

    const isSharing = computed(() => locationStore.isSharing)

    const { subscribeToPosition, fetchHouseholdPositions, connected } = useWebSocket()

    const { isLoadingMarkers, markersLoadError, notification, activeRoute } = storeToRefs(mapStore)

    const isMobileView = computed(() => {
      return windowWidth.value < 768 
    })

    /**
     * Toggles the user's position sharing state via LocationStore.
     */
    function togglePositionSharing() {
      locationStore.togglePositionSharing()
    }

    /**
     * Lifecycle hook: runs when the component is mounted.
     * Initializes the map, sets up listeners, subscribes to WebSocket updates,
     * loads initial user positions and admin markers if applicable.
     */
    onMounted(async () => {
      isFilterCollapsed.value = isMobileView.value

      try {
        map.value = await mapStore.initMap(mapContainer.value)

        if (map.value) {
          console.log('Map initialized successfully')
          mapInitialized.value = true

          emit('map-ready', map.value)

          userPositions.value.forEach((position, userId) => {
            const isCurrentUser = userId === userStore.user.id
            updateUserMarker(
              userId,
              position.fullName,
              position.longitude,
              position.latitude,
              isCurrentUser,
            )
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

          if (props.isAdminMode) {
            console.log('Setting up admin mode in MapView')

            map.value.on('click', (e) => {
              console.log('Admin map clicked:', e.latlng)
              emit('map-click', e)
            })

            if (props.markers && props.markers.length > 0) {
              syncAdminMarkersToStore()
            }
          }

          setTimeout(() => {
            mapStore.refreshMarkerLayers()
            console.log('Forced marker refresh after timeout')
          }, 500)
        }
      } catch (error) {
        console.error('Map initialization failed:', error)
      }

      window.addEventListener('resize', handleResize)
    })

    /**
     * Syncs the provided markers (admin mode) to the map store.
     */
    const syncAdminMarkersToStore = () => {
      if (!props.isAdminMode || !props.markers || !props.markers.length) return

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

      mapStore.setAdminMarkers(adminMarkers)
    }

    /**
     * Watcher: Sync admin markers to store when props.markers change.
     */
    watch(() => props.markers, () => {
      if (props.isAdminMode && map.value) {
        console.log('Admin markers changed, syncing to map store');
        syncAdminMarkersToStore();
      }
    }, { deep: true });

    /**
     * Watcher: Updates current user marker when isSharing changes.
     */
    watch(
      () => isSharing.value,
      (newValue) => {
        try {
          if (userPositions.value.has(userStore.user.id)) {
            const position = userPositions.value.get(userStore.user.id)
            const name = position.fullName.split(' ')[0]
            updateUserMarker(userStore.user.id, name, position.longitude, position.latitude, true)
          }
        } catch (error) {
          console.log('Error updating user marker: No user logged in')
        }
        if (map.value) {
          mapStore.updateMarkerPopups(newValue)
        }
      },
    )
    
    /**
     * Watcher: Refresh markers if the editingMarkerId changes (admin mode only).
     */
    watch(() => props.editingMarkerId, (newId, oldId) => {
      if (props.isAdminMode && map.value) {
        syncAdminMarkersToStore();
      }
    });

    /**
     * Watcher: Subscribes to position updates when WebSocket connects and householdId is available.
     */
    watch(
      () => connected.value && householdId,
      (isConnected) => {
        if (isConnected && householdId) {
          subscribeToPosition(householdId, handlePositionUpdate)
        }
      },
    )

    /**
     * Watcher: Refresh marker layers when the map becomes available.
     */
    watch(() => map.value, (newMap) => {
      if (newMap && props.isAdminMode) {
        newMap.on('moveend', () => {
          mapStore.refreshMarkerLayers();
        });
      }
    });

    /**
     * Lifecycle hook: runs when the component is about to be destroyed.
     * Cleans up event listeners and map subscriptions.
     */
    onUnmounted(() => {
      if (map.value && props.isAdminMode) {
        map.value.off('moveend')
      }
      window.removeEventListener('resize', handleResize)
    })

    /**
     * Handles incoming user position data from WebSocket and updates map state.
     * @param {Object} positionData - The position object with userId, fullName, latitude, and longitude
     */
    const handlePositionUpdate = (positionData) => {
      console.log('Handling position update:', positionData)

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
        fullName: fullName,
      })

      if (mapInitialized.value && map.value) {
        const isCurrentUser = userId === userStore.user.id
        const name = fullName.split(' ')[0]
        updateUserMarker(userId, name, parsedLong, parsedLat, isCurrentUser)
      } else {
        console.log(`Map not ready yet. Storing position for user ${userId} for later display`)
      }
    }

    /**
     * Updates or creates a user location marker on the map.
     * @param {string} userId
     * @param {string} name - First name to display in marker
     * @param {number} longitude
     * @param {number} latitude
     * @param {boolean} isCurrentUser - True if the marker is for the current user
     */
    function updateUserMarker(userId, name, longitude, latitude, isCurrentUser = false) {
      if (userMarkers.value.has(userId)) {
        const marker = userMarkers.value.get(userId)

        if (isCurrentUser && !isSharing.value) {
          if (map.value && typeof map.value.removeLayer === 'function') {
            map.value.removeLayer(marker)
          }
          userMarkers.value.delete(userId)
          console.log(`Removed marker for user ${userId} due to sharing turned off`)
          return
        }

        marker.setLatLng([latitude, longitude])
        return
      }

      if (isCurrentUser && !isSharing.value) {
        console.log(`Skipping marker creation for current user (sharing off)`)
        return
      }

      try {
        let markerIcon = null

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
            className: 'user-position-marker other-user-marker',
            html: `
          <div style="position: relative; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;">
            <div style="position: relative; background-color: #FF8C00; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
              ${name.substring(0, 2)}
            </div>
          </div>
        `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          })
        }

        if (!markerIcon) {
          console.error(`Could not create marker icon for user ${userId}`)
          return
        }

        const newMarker = L.marker([latitude, longitude], {
          icon: markerIcon,
        })

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

    /**
     * Handles window resize events to adapt map/filter UI.
     */
    const handleResize = () => {
      windowWidth.value = window.innerWidth
      mapStore.resizeMap()

      if (isMobileView.value) {
        if (!isFilterCollapsed.value) {
          isFilterCollapsed.value = true
        }
      }
    }

    /**
     * Re-attempts loading markers from the map store.
     */
    const retryLoadMarkers = () => {
      mapStore.initMarkers()
    }

    /**
     * Toggles the visibility of the marker filter (especially in mobile view).
     */
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
      </div>

    <!-- Add notification display with proper v-if check -->
      <transition name="fade">
        <div
          v-if="notification"
          class="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black/70 text-white p-2 px-4 rounded z-50 text-sm"
        >
          {{ notification }}
        </div>
      </transition>

      <ClosestFacilityFinder
        v-if="!isLoadingMarkers && !markersLoadError && !isAdminMode && isSharing"
      />

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



