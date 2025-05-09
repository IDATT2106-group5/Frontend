<script setup>
import {onMounted, onUnmounted, ref, watch} from 'vue';
import {useMapStore} from '@/stores/map/mapStore';
import {storeToRefs} from 'pinia';
import MarkerService from '@/service/map/markerService';
import GeolocationService from '@/service/map/geoLocationService';
import Button from '@/components/ui/button/Button.vue';

/**
 * Currently selected facility type
 * @type {import('vue').Ref<string>}
 */
const selectedType = ref('SHELTER');

/**
 * User's current geographical location [latitude, longitude]
 * @type {import('vue').Ref<[number, number]|null>}
 */
const userLocation = ref(null);

/**
 * The closest facility to the user's location
 * @type {import('vue').Ref<Object|null>}
 * @property {number} lat - Latitude of the facility
 * @property {number} lng - Longitude of the facility
 * @property {string} name - Name of the facility
 * @property {number} distance - Distance from user in kilometers
 */
const closestFacility = ref(null);

/**
 * Flag indicating if an operation is in progress
 * @type {import('vue').Ref<boolean>}
 */
const isLoading = ref(false);

/**
 * Error message related to location services
 * @type {import('vue').Ref<string|null>}
 */
const locationError = ref(null);

/**
 * ID of the geolocation watch process
 * @type {import('vue').Ref<number|null>}
 */
const watchId = ref(null);

/**
 * Flag indicating if a route is currently displayed
 * @type {import('vue').Ref<boolean>}
 */
const isRouteActive = ref(false);

/**
 * Flag indicating if the component UI is in collapsed state
 * @type {import('vue').Ref<boolean>}
 */
const isCollapsed = ref(false);

/**
 * Current window width for responsive layout
 * @type {import('vue').Ref<number>}
 */
const windowWidth = ref(window.innerWidth);

/**
 * Determines if the component is in mobile view based on window width
 * @returns {boolean} True if in mobile view, false otherwise
 */
const isMobileView = () => {
  return windowWidth.value < 768;
};

/**
 * Map store instance
 * @type {import('@/stores/map/mapStore').MapStore}
 */
const mapStore = useMapStore();

/**
 * Reference to route error from map store
 * @type {import('vue').Ref<string|null>}
 */
const {routeError} = storeToRefs(mapStore);

/**
 * Toggles the collapsed state of the component UI
 */
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

/**
 * Handles window resize events
 * Updates windowWidth and adjusts collapsed state based on viewport size changes
 */
const handleResize = () => {
  const previousIsMobile = isMobileView();
  windowWidth.value = window.innerWidth;
  const currentIsMobile = isMobileView();

  if (previousIsMobile && !currentIsMobile) {
    isCollapsed.value = false;
  }
  else if (!previousIsMobile && currentIsMobile) {
    isCollapsed.value = true;
  }
};

/**
 * Lifecycle hook that runs when the component is mounted
 * Sets initial UI state and starts location tracking
 */
onMounted(() => {
  isCollapsed.value = isMobileView();

  window.addEventListener('resize', handleResize);

  requestLocation();
});

/**
 * Lifecycle hook that runs before the component is unmounted
 * Cleans up event listeners and geolocation services
 */
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);

  if (watchId.value) {
    navigator.geolocation.clearWatch(watchId.value);
  }

  if (isRouteActive.value) {
    mapStore.clearRoute();
    isRouteActive.value = false;
  }
});

/**
 * Requests and continuously tracks the user's location
 *
 * @async
 * @returns {Promise<void>}
 */
const requestLocation = async () => {
  locationError.value = null;
  isLoading.value = true;

  try {
    userLocation.value = await GeolocationService.getUserLocation();

    if (navigator.geolocation) {
      watchId.value = navigator.geolocation.watchPosition(
        (position) => {
          userLocation.value = [position.coords.latitude, position.coords.longitude];
        },
        (error) => {
          console.warn("Geolocation watch error:", error);
        },
        {
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 120000
        }
      );
    }
  } catch (error) {
    console.error("Error getting location:", error);
    locationError.value = error.message || "Could not determine your location.";
  } finally {
    isLoading.value = false;
  }
};

/**
 * Finds the closest facility of the selected type to user's current location
 *
 * @async
 * @returns {Promise<void>}
 */
const findClosestFacility = async () => {
  if (!userLocation.value) {
    locationError.value = "Din posisjon er ikke tilgjengelig ennå.";
    return;
  }

  isLoading.value = true;

  try {
    const [lat, lng] = userLocation.value;

    const facility = await MarkerService.findClosestMarker(
      lat, lng, selectedType.value || null
    );

    closestFacility.value = facility;

    if (!facility) {
      locationError.value = "Ingen fasiliteter funnet i nærheten.";
    } else {

      if (isRouteActive.value) {
        mapStore.clearRoute();
        isRouteActive.value = false;
      }
    }
  } catch (error) {
    console.error("Error finding closest facility:", error);
    locationError.value = "Kunne ikke finne nærmeste fasilitet.";
  } finally {
    isLoading.value = false;
  }
};

/**
 * Toggles the display of a route between user location and closest facility
 * Generates a new route if none is active, or clears existing route
 */
const showRoute = () => {
  if (!closestFacility.value || !userLocation.value) {
    return;
  }

  if (isRouteActive.value) {
    mapStore.clearRoute();
    isRouteActive.value = false;
  } else {
    const startCoords = userLocation.value;
    const endCoords = [closestFacility.value.lat, closestFacility.value.lng];

    mapStore.generateRoute(startCoords, endCoords);
    isRouteActive.value = true;
  }
};

/**
 * Formats distance for display with appropriate units
 *
 * @param {number|null} distance - Distance in kilometers
 * @returns {string} Formatted distance string with units (meters or km)
 */
const formatDistance = (distance) => {
  if (!distance) {
    return '';
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)} meter`;
  }
  return `${distance.toFixed(1)} km`;
};
</script>

<template>
  <div
    :class="[
      'absolute bg-white rounded-lg shadow-md transition-all duration-300 overflow-hidden z-[1000]',
      'top-[70px] right-4 max-w-[300px] box-border',
      isCollapsed ? 'cursor-pointer py-2 px-3 right-2 w-auto hover:bg-gray-100' : 'p-3 w-[300px]'
    ]"
  >
    <!-- Collapsed state -->
    <div
      v-if="isCollapsed"
      class="flex flex-row items-center justify-between gap-2 transition-colors duration-200"
      @click="toggleCollapse"
    >
      <div>Vis rute til</div>
      <div class="text-base text-gray-700">↓</div>
    </div>

    <!-- Expanded state -->
    <div v-else class="p-2 bg-white">
      <div class="flex justify-between items-center mb-4">
        <h3 class="m-0 text-base">Vis rute til</h3>
        <Button
          variant="ghost"
          size="icon"
          @click="toggleCollapse"
          class="p-0 h-auto text-[#777]"
        >
          <span class="text-lg">↑</span>
        </Button>
      </div>

      <div class="mb-3">
        <select
          v-model="selectedType"
          class="w-full p-2 rounded border border-gray-200 bg-white"
        >
          <option value="">Alle typer</option>
          <option value="SHELTER">Tilfluktsrom</option>
          <option value="HOSPITAL">Sykehus</option>
          <option value="MEETINGPLACE">Møteplass</option>
          <option value="FOODSTATION">Matstasjon</option>
        </select>
      </div>

      <Button
        :disabled="isLoading || !userLocation"
        variant="default"
        @click="findClosestFacility"
        class="w-full bg-[#1976d2] hover:bg-[#1565c0] text-white"
      >
        <span v-if="!isLoading">Finn nærmeste</span>
        <span v-else>Søker...</span>
      </Button>

      <div
        v-if="locationError"
        class="mt-4 p-2 bg-red-50 text-red-700 rounded text-sm"
      >
        <p>{{ locationError }}</p>
        <Button
          variant="default"
          @click="requestLocation"
          class="w-full mt-2 bg-[#ff9800] hover:bg-[#f57c00] text-white"
        >
          Prøv igjen
        </Button>
      </div>

      <div
        v-if="closestFacility"
        class="mt-4 pt-4 border-t border-gray-100"
      >
        <h4 class="mt-0 mb-2">{{ closestFacility.name }}</h4>
        <p v-if="closestFacility.address">{{ closestFacility.address }}</p>
        <p class="font-semibold text-[#1976d2]">{{ formatDistance(closestFacility.distance) }} unna</p>

        <div class="flex flex-col gap-2 mt-3">
          <Button
            variant="default"
            @click="showRoute"
            class="w-full bg-[#1976d2] hover:bg-[#1565c0] text-white"
          >
            <span v-if="!isRouteActive">Vis rute</span>
            <span v-else>Skjul rute</span>
          </Button>
        </div>
      </div>

      <div
        v-if="routeError"
        class="mt-4 p-2 bg-red-50 text-red-700 rounded text-sm"
      >
        {{ routeError }}
      </div>
    </div>
  </div>
</template>



