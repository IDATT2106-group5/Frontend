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

<script setup>
import {onMounted, onUnmounted, ref, watch} from 'vue';
import {useMapStore} from '@/stores/map/mapStore';
import {storeToRefs} from 'pinia';
import MarkerService from '@/service/map/markerService';
import GeolocationService from '@/service/map/geoLocationService';
import Button from '@/components/ui/button/Button.vue';

// Component state
const selectedType = ref('SHELTER');
const userLocation = ref(null);
const closestFacility = ref(null);
const isLoading = ref(false);
const locationError = ref(null);
const watchId = ref(null);
const isRouteActive = ref(false);
const isCollapsed = ref(false);
const windowWidth = ref(window.innerWidth);

const isMobileView = () => {
  return windowWidth.value < 768;
};

// Map store
const mapStore = useMapStore();
const {routeError} = storeToRefs(mapStore);

// Toggle collapsed state
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

// Handle window resize
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

// Request user's location when component mounts
onMounted(() => {
  // Set initial collapse state based on screen size
  isCollapsed.value = isMobileView();

  // Add resize event listener
  window.addEventListener('resize', handleResize);

  requestLocation();
});

// Clean up when unmounting
onUnmounted(() => {
  // Remove resize event listener
  window.removeEventListener('resize', handleResize);

  if (watchId.value) {
    navigator.geolocation.clearWatch(watchId.value);
  }
  if (isRouteActive.value) {
    mapStore.clearRoute();
    isRouteActive.value = false;
  }
});

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

// Find the closest facility
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
      console.log("Found closest facility:", facility);
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

// Show/hide route
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

// Format distance for display
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

