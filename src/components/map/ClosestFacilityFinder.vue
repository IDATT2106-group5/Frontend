<template>
  <div class="closest-facility-panel">
    <h3>Finn nærmeste</h3>

    <div class="type-selection">
      <select v-model="selectedType" class="type-dropdown">
        <option value="">Alle typer</option>
        <option value="SHELTER">Tilfluktsrom</option>
        <option value="HOSPITAL">Sykehus</option>
        <option value="MEETINGPLACE">Møteplass</option>
        <option value="FOODSTATION">Matstasjon</option>
      </select>
    </div>

    <button
      @click="findClosestFacility"
      class="find-button"
      :disabled="isLoading || !userLocation"
    >
      <span v-if="!isLoading">Finn nærmeste</span>
      <span v-else>Søker...</span>
    </button>

    <div v-if="locationError" class="error-message">
      <p>{{ locationError }}</p>
      <button @click="requestLocation" class="retry-button">
        Prøv igjen
      </button>
    </div>

    <div v-if="closestFacility" class="facility-info">
      <h4>{{ closestFacility.name }}</h4>
      <p v-if="closestFacility.address">{{ closestFacility.address }}</p>
      <p class="distance">{{ formatDistance(closestFacility.distance) }} unna</p>

      <div class="route-actions">
        <button @click="showRoute" class="route-button">
          <span v-if="!isRouteActive">Vis rute</span>
          <span v-else>Skjul rute</span>
        </button>
      </div>
    </div>

    <div v-if="routeError" class="error-message">
      {{ routeError }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMapStore } from '@/stores/map/mapStore';
import { storeToRefs } from 'pinia';
import MarkerService from '@/service/map/markerService';

// Component state
const selectedType = ref('SHELTER'); // Default to shelters
const userLocation = ref(null);
const closestFacility = ref(null);
const isLoading = ref(false);
const locationError = ref(null);
const watchId = ref(null);
const isRouteActive = ref(false);

// Map store
const mapStore = useMapStore();
const { routeError } = storeToRefs(mapStore);

// Request user's location when component mounts
onMounted(() => {
  requestLocation();
});

// Clean up location watcher when unmounting
onUnmounted(() => {
  if (watchId.value) {
    navigator.geolocation.clearWatch(watchId.value);
  }
  if (isRouteActive.value) {
    mapStore.clearRoute();
  }
});

const requestLocation = () => {
  locationError.value = null;

  if (!navigator.geolocation) {
    locationError.value = "Geolokasjon støttes ikke av din nettleser.";
    return;
  }

  // First try to get a single position (faster response)
  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation.value = [position.coords.latitude, position.coords.longitude];
      console.log("Initial user location acquired:", userLocation.value);

      // Then set up continuous watching with less strict parameters
      watchId.value = navigator.geolocation.watchPosition(
        (position) => {
          userLocation.value = [position.coords.latitude, position.coords.longitude];
          console.log("Updated user location:", userLocation.value);
        },
        (error) => {
          // Only log watching errors, don't update the error display
          // as we already have an initial position
          console.warn("Geolocation watch error:", error);
        },
        {
          enableHighAccuracy: false, // Less strict for continuous updates
          timeout: 30000,
          maximumAge: 120000  // 2 minutes
        }
      );
    },
    (error) => {
      console.error("Geolocation error:", error);
      locationError.value = getGeolocationErrorMessage(error);

      // Fallback to IP-based geolocation if browser geolocation fails
      fallbackToIPGeolocation();
    },
    {
      enableHighAccuracy: true,
      timeout: 15000, // Longer timeout for initial position
      maximumAge: 0    // Force fresh position
    }
  );
};

// Fallback to IP-based geolocation when browser geolocation fails
const fallbackToIPGeolocation = async () => {
  try {
    isLoading.value = true;
    console.log("Falling back to IP-based geolocation");

    // Using a free IP geolocation service
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();

    if (data.latitude && data.longitude) {
      userLocation.value = [data.latitude, data.longitude];
      console.log("IP-based location:", userLocation.value);

      // Show a notice that we're using approximate location
      locationError.value = "Bruker omtrentlig posisjon basert på IP. For nøyaktig posisjon, gi tillatelse til stedsbestemmelse.";
    } else {
      throw new Error("Could not determine location from IP");
    }
  } catch (error) {
    console.error("IP geolocation fallback failed:", error);
    locationError.value = "Kunne ikke bestemme din posisjon. Vennligst aktiver stedstjenester i nettleseren.";
  } finally {
    isLoading.value = false;
  }
};

// Helper function to get readable geolocation error messages
const getGeolocationErrorMessage = (error) => {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      return "Du må gi tillatelse til å dele din posisjon.";
    case error.POSITION_UNAVAILABLE:
      return "Posisjonen din er ikke tilgjengelig.";
    case error.TIMEOUT:
      return "Det tok for lang tid å hente posisjonen din.";
    default:
      return "Det oppstod en feil ved henting av posisjon.";
  }
};

// Find closest facility
const findClosestFacility = async () => {
  if (!userLocation.value) {
    locationError.value = "Din posisjon er ikke tilgjengelig ennå.";
    return;
  }

  isLoading.value = true;

  try {
    const [lat, lng] = userLocation.value;

    // Find closest facility using marker service
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
  if (!closestFacility.value || !userLocation.value) return;

  if (isRouteActive.value) {
    // If route is already active, clear it
    mapStore.clearRoute();
    isRouteActive.value = false;
  } else {
    // Generate a new route
    const startCoords = userLocation.value;
    const endCoords = [closestFacility.value.lat, closestFacility.value.lng];

    mapStore.generateRoute(startCoords, endCoords);
    isRouteActive.value = true;
  }
};

// Format distance for display
const formatDistance = (distance) => {
  if (!distance) return '';

  if (distance < 1) {
    return `${Math.round(distance * 1000)} meter`;
  }
  return `${distance.toFixed(1)} km`;
};
</script>

<style scoped>
.closest-facility-panel {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 250px;
}

h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
}

.type-selection {
  margin-bottom: 12px;
}

.type-dropdown {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.find-button {
  width: 100%;
  padding: 10px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.find-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.facility-info {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.facility-info h4 {
  margin-top: 0;
  margin-bottom: 8px;
}

.distance {
  font-weight: 600;
  color: #1976d2;
}

.route-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.route-button {
  flex: 1;
  padding: 8px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-button {
  width: 100%;
  padding: 8px;
  margin-top: 8px;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error-message {
  margin-top: 16px;
  padding: 8px;
  background-color: #ffebee;
  color: #d32f2f;
  border-radius: 4px;
  font-size: 14px;
}

@media (max-width: 767px) {
  .closest-facility-panel {
    width: 100%;
  }
}
</style>
