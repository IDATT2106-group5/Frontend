// src/views/admin/IncidentAdmin.vue
<template>
  <div class="incident-admin-container">
    <!-- Alert messages -->
    <div v-if="success" class="alert alert-success">
      {{ success }}
      <Button variant="ghost" size="icon" class="close-btn" @click="clearSuccess">×</Button>
    </div>

    <div v-if="error" class="alert alert-error">
      {{ error }}
      <Button variant="ghost" size="icon" class="close-btn" @click="clearError">×</Button>
    </div>

    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Laster...</p>
    </div>

    <!-- Left panel: List or Form -->
    <div class="left-panel">
      <!-- Incident List -->
      <div v-if="!isEditing && !isCreating" class="incident-list-panel">
        <h1>Aktive kriseområder</h1>

        <!-- Search and Filter -->
        <div class="search-filter-container">
          <input
            type="text"
            v-model="searchTerm"
            class="search-input"
            placeholder="Søk hendelser..."
            @input="onSearchChange"
          />

          <div class="filter-dropdown">
            <Button
              variant="outline"
              class="filter-button"
              @click="toggleFilterDropdown"
            >
              Filtrer krisetyper <span class="dropdown-arrow">▼</span>
            </Button>

            <div v-if="showFilterDropdown" class="filter-options">
              <div class="filter-option">
                <input
                  type="radio"
                  id="all-types"
                  name="filter"
                  value=""
                  v-model="filterSeverity"
                  @change="onFilterChange"
                />
                <label for="all-types" class="filter-label">Alle typer</label>
              </div>

              <div
                v-for="level in severityLevels"
                :key="level.id"
                class="filter-option"
              >
                <input
                  type="radio"
                  :id="level.id"
                  name="filter"
                  :value="level.id"
                  v-model="filterSeverity"
                  @change="onFilterChange"
                />
                <div class="filter-label-with-icon">
                  <!-- Add severity level indicator -->
                  <div
                    class="severity-indicator"
                    :style="{backgroundColor: getSeverityColor(level.id)}"
                  ></div>
                  <label :for="level.id" class="filter-label">{{ level.name }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Incidents List -->
        <div class="incidents-container">
          <div
            v-for="incident in filteredIncidents"
            :key="incident.id"
            class="incident-item"
          >
            <div
              class="severity-indicator"
              :style="{backgroundColor: getSeverityColor(incident.severity)}"
            ></div>
            <div class="incident-info">
              <div class="incident-title">{{ incident.name }}</div>
              <p>{{ formatDateForDisplay(incident.startedAt) }}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="edit-btn"
              @click="onEditIncident(incident)"
            >
              Rediger
            </Button>
          </div>

          <div v-if="filteredIncidents.length === 0" class="empty-incidents">
            <p>Ingen krisesituasjoner funnet</p>
          </div>
        </div>

        <Button
          variant="default"
          class="add-new-btn"
          @click="onAddNew"
        >
          + Legg til ny krisesituasjon
        </Button>
      </div>

      <!-- Incident Form (Edit/Create) -->
      <div v-else class="incident-form-panel">
        <h1>{{ isCreating ? 'Ny krisesituasjon' : 'Rediger krisesituasjon' }}</h1>

        <p class="click-info">Klikk på kartet for å justere kriseområdets midtpunkt. Bruk glidebryteren eller skriv inn antall km for å endre radius.</p>

        <form @submit.prevent="onSaveIncident">
          <div class="form-group">
            <label for="name">Tittel</label>
            <Input
              id="name"
              v-model="incidentFormData.name"
              required
            />
          </div>

          <div class="form-group">
            <label for="description" class="description-label">
              Beskrivelse
              <Button
                variant="ghost"
                size="sm"
                type="button"
                class="info-btn"
                @click="toggleDescriptionTips"
              >
                ?
              </Button>
            </label>

            <div v-if="showDescriptionTips" class="tips-box">
              <h4 class="tips-title">Tips for en effektiv krisebeskrivelse:</h4>

              <button
                type="button"
                class="close-tips-btn"
                @click="toggleDescriptionTips"
              >
                x
              </button>

              <!-- Tips list -->
              <ul class="tips-list">
                <li>Vær konkret om hva som har skjedd</li>
                <li>Beskriv omfanget av krisen tydelig</li>
                <li>Nevn hvilke områder som er berørt</li>
                <li>Inkluder informasjon om igangsatte tiltak</li>
                <li>Gi anslag på forventet varighet hvis mulig</li>
              </ul>
            </div>

            <textarea
              id="description"
              v-model="incidentFormData.description"
              class="form-control"
              rows="4"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="startedAt">Start tidspunkt</label>
              <div class="datetime-inputs">
                <input
                  type="date"
                  v-model="startDate"
                  class="date-input"
                />
                <input
                  type="time"
                  v-model="startTime"
                  class="time-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="endedAt">Slutt tidspunkt (valgfritt)</label>
              <div class="datetime-inputs">
                <input
                  type="date"
                  v-model="endDate"
                  class="date-input"
                />
                <input
                  type="time"
                  v-model="endTime"
                  class="time-input"
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Krise-/beredskapsnivå</label>
            <div class="severity-options">
              <div
                v-for="level in severityLevels"
                :key="level.id"
                class="severity-option"
                :class="{ active: incidentFormData.severity === level.id }"
                @click="incidentFormData.severity = level.id"
              >
                <div
                  class="severity-indicator"
                  :style="{backgroundColor: getSeverityColor(level.id)}"
                ></div>
                <span>{{ level.name }}</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Koordinater</label>
            <div class="form-row">
              <div class="form-group">
                <Input
                  v-model="incidentFormData.latitude"
                  placeholder="Breddgrad °N"
                  class="coordinate-input"
                />
              </div>

              <div class="form-group">
                <Input
                  v-model="incidentFormData.longitude"
                  placeholder="Lengdegrad °E"
                  class="coordinate-input"
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="radius">Radius i km: {{ incidentFormData.impactRadius }}</label>
            <div class="radius-slider">
              <input
                type="range"
                id="radius"
                v-model.number="incidentFormData.impactRadius"
                min="0"
                max="50"
                step="1"
                class="slider"
              />
              <div class="radius-labels">
                <span>0 km</span>
                <span>25 km</span>
                <span>50 km</span>
              </div>
            </div>
            <Input
              v-model.number="incidentFormData.impactRadius"
              type="number"
              min="0"
              max="50"
              class="radius-input"
            />
          </div>

          <div class="button-row">
            <Button
              variant="outline"
              type="button"
              @click="onCancelEdit"
            >
              Avbryt
            </Button>

            <Button
              v-if="isEditing"
              variant="destructive"
              type="button"
              @click="onDeleteIncident"
            >
              Slett krise
            </Button>

            <Button
              variant="default"
              type="submit"
              class="ml-auto"
            >
              {{ isCreating ? 'Lagre' : 'Lagre' }}
            </Button>
          </div>
        </form>
      </div>
    </div>

    <!-- Right panel: Map -->
    <div class="right-panel">
      <MapView
        ref="mapView"
        :center="mapCenter"
        :zoom="mapZoom"
        @map-ready="onMapReady"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useIncidentAdminStore } from '@/stores/admin/incidentAdminStore';
import { storeToRefs } from 'pinia';
import IncidentConfigService from '@/service/map/incidentConfigService';
import MapView from '@/views/mapView/MapView.vue';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import L from 'leaflet';

export default {
  name: 'IncidentAdmin',
  components: {
    MapView,
    Button,
    Input
  },

  setup() {
    const mapView = ref(null);
    const map = ref(null);
    const incidentLayers = ref(null);
    const showFilterDropdown = ref(false);
    const showDescriptionTips = ref(false);

    // Map configuration
    const mapCenter = ref([63.4305, 10.3951]); // Trondheim
    const mapZoom = ref(13);

    const incidentAdminStore = useIncidentAdminStore();
    const {
      incidents,
      filteredIncidents,
      incidentFormData,
      isEditing,
      isCreating,
      isLoading,
      error,
      success
    } = storeToRefs(incidentAdminStore);

    const searchTerm = ref('');
    const filterSeverity = ref('');

    // Date and time handling for form inputs
    const startDate = ref('');
    const startTime = ref('');
    const endDate = ref('');
    const endTime = ref('');

    // Set initial date/time values when component mounted or form data changes
    const updateDateTimeFields = () => {
      if (incidentFormData.value.startedAt) {
        const startDateTime = new Date(incidentFormData.value.startedAt);
        startDate.value = startDateTime.toISOString().split('T')[0];
        startTime.value = startDateTime.toTimeString().substring(0, 5);
      } else {
        const now = new Date();
        startDate.value = now.toISOString().split('T')[0];
        startTime.value = now.toTimeString().substring(0, 5);
      }

      if (incidentFormData.value.endedAt) {
        const endDateTime = new Date(incidentFormData.value.endedAt);
        endDate.value = endDateTime.toISOString().split('T')[0];
        endTime.value = endDateTime.toTimeString().substring(0, 5);
      } else {
        endDate.value = '';
        endTime.value = '';
      }
    };

    // Watch for changes to form data
    watch(() => incidentFormData.value, updateDateTimeFields, { immediate: true });

    // Watch date/time inputs to update form data
    watch([startDate, startTime], () => {
      if (startDate.value && startTime.value) {
        incidentFormData.value.startedAt = new Date(`${startDate.value}T${startTime.value}`).toISOString();
      }
    });

    watch([endDate, endTime], () => {
      if (endDate.value && endTime.value) {
        incidentFormData.value.endedAt = new Date(`${endDate.value}T${endTime.value}`).toISOString();
      } else {
        incidentFormData.value.endedAt = null;
      }
    });

    // Computed properties
    const severityLevels = computed(() => incidentAdminStore.severityLevels);

    // Methods
    const getSeverityColor = (severityId) => {
      const levels = IncidentConfigService.getSeverityLevels();
      return levels[severityId]?.color || '#45D278';
    };

    const formatDateForDisplay = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `Startet: ${date.toLocaleDateString('no-NO')} ${date.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}`;
    };

    const onMapReady = (leafletMap) => {
      // Store the map instance
      map.value = leafletMap;

      // Add click handler for setting incident position
      map.value.on('click', onMapClick);

      // Initialize layers for incidents
      incidentLayers.value = L.layerGroup().addTo(map.value);

      // Draw any existing incidents if editing
      if (isEditing.value || isCreating.value) {
        drawIncidentOnMap();
      }
    };

    const onMapClick = async (e) => {
      if (!isEditing.value && !isCreating.value) return;

      const { lat, lng } = e.latlng;

      // Update form data
      incidentAdminStore.updateIncidentCoordinates(lat, lng);

      // Redraw incident visualization
      drawIncidentOnMap();
    };

    const drawIncidentOnMap = () => {
      // Clear previous layers
      if (incidentLayers.value) {
        incidentLayers.value.clearLayers();
      }

      if (!map.value) return;

      // Create incident visualization
      const incidentLayerGroup = IncidentConfigService.createIncidentCircles(
        incidentFormData.value,
        map.value
      );

      if (incidentLayerGroup) {
        incidentLayerGroup.addTo(incidentLayers.value);
      }
    };

    const onSearchChange = () => {
      incidentAdminStore.setSearchTerm(searchTerm.value);
    };

    const onFilterChange = () => {
      incidentAdminStore.setFilterSeverity(filterSeverity.value);
      showFilterDropdown.value = false;
    };

    const toggleFilterDropdown = () => {
      showFilterDropdown.value = !showFilterDropdown.value;
    };

    const toggleDescriptionTips = () => {
      showDescriptionTips.value = !showDescriptionTips.value;
    };

    const onAddNew = () => {
      incidentAdminStore.initNewIncident();
      updateDateTimeFields();

      // Center map at default location
      if (map.value) {
        map.value.setView([incidentFormData.value.latitude, incidentFormData.value.longitude], 13);
      }

      // Draw incident on map
      drawIncidentOnMap();
    };

    const onEditIncident = (incident) => {
      incidentAdminStore.editIncident(incident);
      updateDateTimeFields();


      // Center map at incident location
      if (map.value) {
        map.value.setView([incident.latitude, incident.longitude], 13);
      }

      // Draw incident on map
      drawIncidentOnMap();
    };

    const onSaveIncident = async () => {
      const success = await incidentAdminStore.saveIncident();

      if (success) {
        // Clear visualization if going back to list view
        if (incidentLayers.value) {
          incidentLayers.value.clearLayers();
        }
      }
    };

    const onCancelEdit = () => {
      incidentAdminStore.cancelEdit();

      // Clear visualization
      if (incidentLayers.value) {
        incidentLayers.value.clearLayers();
      }
    };

    const onDeleteIncident = async () => {
      if (!confirm('Er du sikker på at du vil slette denne krisesituasjonen?')) {
        return;
      }

      const success = await incidentAdminStore.deleteIncident(incidentFormData.value.id);

      if (success) {
        // Clear visualization
        if (incidentLayers.value) {
          incidentLayers.value.clearLayers();
        }
      }
    };

    const clearSuccess = () => {
      incidentAdminStore.clearSuccess();
    };

    const clearError = () => {
      incidentAdminStore.clearError();
    };

    // Watch for changes to impact radius or severity to update visualization
    watch(
      [
        () => incidentFormData.value.impactRadius,
        () => incidentFormData.value.severity
      ],
      () => {
        drawIncidentOnMap();
      }
    );

    // (Continued from previous code)
    onMounted(async () => {
      // Fetch incidents
      await incidentAdminStore.fetchIncidents();

      // Initialize search and filter
      searchTerm.value = incidentAdminStore.searchTerm;
      filterSeverity.value = incidentAdminStore.filterSeverity;
    });

    onUnmounted(() => {
      // Clean up map resources if needed
      if (incidentLayers.value && map.value) {
        incidentLayers.value.clearLayers();
        incidentLayers.value = null;
      }
    });

    return {
      mapView,
      mapCenter,
      mapZoom,
      incidents,
      filteredIncidents,
      incidentFormData,
      isEditing,
      isCreating,
      isLoading,
      error,
      success,
      severityLevels,
      searchTerm,
      filterSeverity,
      showFilterDropdown,
      showDescriptionTips,
      startDate,
      startTime,
      endDate,
      endTime,
      onMapReady,
      onSearchChange,
      onFilterChange,
      toggleFilterDropdown,
      toggleDescriptionTips,
      onAddNew,
      onEditIncident,
      onSaveIncident,
      onCancelEdit,
      onDeleteIncident,
      getSeverityColor,
      formatDateForDisplay,
      clearSuccess,
      clearError
    };
  }
};
</script>

<style scoped>
.incident-admin-container {
  display: flex;
  width: 100%;
  height: calc(100vh - 60px);
  gap: 16px;
  padding: 16px;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1010;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 4px;
  z-index: 1020;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 300px;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: inherit;
  margin-left: 10px;
}

.left-panel {
  flex: 1;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
  max-width: 400px;
  min-width: 320px;
}

.right-panel {
  flex: 2;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

h1 {
  color: #2c3e50;
  font-size: 28px;
  margin-bottom: 24px;
}

/* Form styles */
.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

textarea.form-control {
  resize: vertical;
}

.coordinate-input {
  width: 100%;
}

.button-row {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.ml-auto {
  margin-left: auto;
}

/* Search and Filter */
.search-filter-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.search-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-dropdown {
  position: relative;
}

.filter-button {
  width: 100%;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
}

.filter-option {
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.filter-option:hover {
  background-color: #f1f1f1;
}

.filter-label-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  cursor: pointer;
}

.filter-label {
  cursor: pointer;
}

/* Incidents List */
.incidents-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  max-height: 475px;
  overflow-y: auto;
}

.incident-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #eee;
}

.severity-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 12px;
}

.incident-info {
  flex: 1;
}

.incident-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.incident-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.add-new-btn {
  width: 100%;
}

.empty-incidents {
  padding: 20px;
  text-align: center;
  color: #666;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #eee;
}

/* Severity options */
.severity-options {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.severity-option {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.severity-option.active {
  background-color: #f1f1f1;
  border-color: #aaa;
}

.severity-option:hover {
  background-color: #f9f9f9;
}

/* Datetime inputs */
.datetime-inputs {
  display: flex;
  gap: 8px;
}

.date-input, .time-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.date-input {
  flex: 2;
}

.time-input {
  flex: 1;
}

/* Radius slider */
.radius-slider {
  margin-bottom: 8px;
}

.slider {
  width: 100%;
  margin-bottom: 4px;
}

.radius-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.radius-input {
  width: 60px;
  text-align: center;
}

.click-info {
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
}

.description-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: rgb(239, 246, 255);
  color: rgb(59, 130, 246);
  border-radius: 50%;
  border: none;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.info-btn:hover {
  background-color: rgb(219, 234, 254);
}

/* Tips box styling */
.tips-box {
  background-color: rgb(239, 246, 255);
  color: rgb(59, 130, 246);
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
  position: relative;
}

/* Close button - positioned in the corner */
.close-tips-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  color: rgb(59, 130, 246);
  font-weight: bold;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.close-tips-btn:hover {
  color: rgb(0, 0, 0);
}

/* Tips list */
.tips-list {
  list-style-type: disc;
  padding-left: 20px;
  margin: 0;
}

.tips-list li {
  margin-bottom: 8px;
  font-size: 14px;
  color: rgb(59, 130, 246);
}

.tips-list li:last-child {
  margin-bottom: 0;
}

/* Responsive styles */
@media (max-width: 768px) {
  .incident-admin-container {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 60px);
  }

  .left-panel {
    max-width: 100%;
    min-width: 100%;
    order: 2;
  }

  .right-panel {
    height: 400px;
    order: 1;
    margin-bottom: 16px;
  }

  .incidents-container {
    max-height: 300px;
  }

  .severity-options {
    flex-direction: column;
  }
}
</style>
