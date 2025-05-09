/**
* @fileoverview Component for finding and navigating to nearby facilities on a map
* @component MapFacilityFinder
* @description Allows users to find the closest facility of a selected type based on their location and navigate to it
*/
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
  // Set initial collapse state based on screen size
  isCollapsed.value = isMobileView();

  // Add resize event listener
  window.addEventListener('resize', handleResize);

  requestLocation();
});

/**
 * Lifecycle hook that runs before the component is unmounted
 * Cleans up event listeners and geolocation services
 */
onUnmounted(() => {
  // Remove resize event listener
  window.removeEventListener('resize', handleResize);

  // Clean up geolocation watch
  if (watchId.value) {
    navigator.geolocation.clearWatch(watchId.value);
  }

  // Clear any active routes
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
    // Get initial location
    userLocation.value = await GeolocationService.getUserLocation();

    // Set up continuous location tracking if supported
    if (navigator.geolocation) {
      watchId.value = navigator.geolocation.watchPosition(
        (position) => {
          userLocation.value = [position.coords.latitude, position.coords.longitude];
        },
        (error) => {
          // Only log watching errors, don't update error display
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
      // Clear any existing route if we find a new facility
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
  <div class="bg-white rounded-md shadow mb-2 overflow-hidden">
    <!-- Edit mode -->
    <div v-if="isEditing && householdStore.isCurrentUserOwner" class="p-4">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Navn</label>
          <input
            v-model="editName"
            placeholder="Navn"
            class="w-full px-3 py-2 border rounded"
          />
        </div>

        <div class="flex justify-end gap-2">
          <Button variant="outline" size="sm" @click="cancelEdit">
            <X class="h-4 w-4 mr-1" /> Avbryt
          </Button>
          <Button size="sm" :disabled="isSaving" @click="saveEdit">
            <Save class="h-4 w-4 mr-1" /> Lagre
          </Button>
        </div>

        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      </div>
    </div>

    <!-- View mode -->
    <div v-else class="flex items-center justify-between p-4">
      <div class="flex items-start flex-1 min-w-0">
        <UserIcon class="h-5 w-5 text-gray-700 mr-3 mt-1 flex-shrink-0" />
        <div class="max-w-full overflow-hidden">
          <div class="font-medium text-[#2C3E50] flex items-center gap-1">
            <span class="truncate max-w-[150px] sm:max-w-[250px] md:max-w-xs">
              {{ member.fullName }}
            </span>
            <Crown
              v-if="isOwner"
              class="w-4 h-4 text-yellow-500 flex-shrink-0"
              title="Husstandseier"
            />
          </div>
          <p v-if="member.email" class="text-sm text-gray-600 flex items-center">
            <Mail class="w-4 h-4 mr-1 flex-shrink-0" />
            <span class="truncate max-w-[150px] sm:max-w-[250px] md:max-w-xs">
              {{ member.email }}
            </span>
          </p>
          <p v-if="member.tlf" class="text-sm text-gray-600 flex items-center">
            <Phone class="w-4 h-4 mr-1 flex-shrink-0" />
            <span class="truncate max-w-[150px] sm:max-w-[250px] md:max-w-xs">
              {{ member.tlf }}
            </span>
          </p>
          <p
            v-if="!member.email && !member.tlf"
            class="flex-shrink-0 w-32 text-center px-3 py-1 text-sm text-gray-500 bg-gray-100 border border-gray-300 rounded whitespace-nowrap"
          >
            Ikke registrert
          </p>
        </div>
      </div>

      <div
        v-if="householdStore.isCurrentUserOwner"
        class="flex items-center gap-2 flex-shrink-0 ml-4"
      >
        <Button
          v-if="!member.isRegistered && !isOwner"
          data-cy="edit-member-button"
          variant="ghost"
          size="sm"
          @click="startEdit"
        >
          <Edit
          class="h-4 w-4" />
        </Button>
        <Button
          v-if="!isOwner"
          variant="outline"
          class="text-red-600 border-red-500 hover:bg-red-50"
          size="sm"
          @click="openConfirmRemove"
        >
          Fjern
        </Button>
      </div>
    </div>

    <ConfirmModal
      v-if="confirmRemoveOpen"
      title="Fjern medlem"
      :description="`Er du sikker på at du vil fjerne ${props.member.fullName}?`"
      confirmText="Fjern"
      cancelText="Avbryt"
      @cancel="confirmRemoveOpen = false"
      @confirm="doRemove"
    />
  </div>
</template>
