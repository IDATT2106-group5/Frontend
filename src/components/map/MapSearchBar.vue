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
  <div ref="searchContainerRef" class="relative w-full max-w-full md:max-w-[400px] z-[1001]">
    <div class="relative flex items-center">
      <input
        v-model="searchInput"
        type="search"
        placeholder="Søk etter adresse eller sted..."
        class="w-full py-2 px-3 md:py-2.5 md:px-4 border-none rounded-lg bg-white shadow-md text-xs md:text-sm transition-shadow focus:outline-none focus:shadow-lg [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:hidden"
        @keydown="onKeyDown"
        :disabled="isSearching"
      />
      <div v-if="isSearching" class="absolute right-3 w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      <button
        v-else-if="searchInput"
        class="absolute right-10 bg-transparent border-none text-gray-500 text-lg cursor-pointer p-0 flex items-center justify-center w-[18px] h-[18px] hover:text-gray-700"
        @click="clearSearch"
        aria-label="Tøm søk"
      >
        ×
      </button>
      <button
        v-if="searchInput && !isSearching"
        class="absolute right-3 bg-transparent border-none cursor-pointer p-0 flex items-center justify-center w-6 h-6"
        @click="triggerSearch"
        aria-label="Søk"
      >
        <SearchIcon class="text-gray-600 transition-colors hover:text-black" size="16" />
      </button>
    </div>

    <!-- Search results dropdown -->
    <div v-if="searchResults.length > 0" class="absolute top-full left-0 right-0 bg-white rounded-b-lg shadow-lg mt-1 max-h-[250px] md:max-h-[300px] overflow-y-auto z-[2000]">
      <div
        v-for="result in searchResults"
        :key="result.id"
        class="py-2.5 px-3 md:py-3 md:px-4 cursor-pointer border-b border-gray-100 last:border-b-0 last:rounded-b-lg transition-colors hover:bg-gray-50"
        @click="selectResult(result)"
      >
        <div class="font-medium text-xs md:text-sm mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{{ result.name }}</div>
        <div class="text-[10px] md:text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
          {{ formatAddress(result.address) }}
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="searchError" class="bg-red-50 text-red-600 py-2 px-3 rounded-md mt-2 text-xs md:text-sm shadow-md">
      {{ searchError }}
    </div>
  </div>
</template>
