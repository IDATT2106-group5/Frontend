// src/stores/admin/incidentAdminStore.js
import { defineStore } from 'pinia';
import IncidentAdminService from '@/service/admin/incidentAdminService';
import IncidentConfigService from '@/service/map/incidentConfigService';
import ScenarioService from '@/service/scenarioService';

export const useIncidentAdminStore = defineStore('incidentAdmin', {
  state: () => ({
    incidents: [],
    filteredIncidents: [],
    scenarios: [],
    selectedScenarioId: null,
    searchTerm: '',
    filterSeverity: '',
    isLoading: false,
    error: null,
    success: null,
    incidentFormData: {
      id: null,
      name: '',
      description: '',
      severity: 'RED', // Default to critical level
      latitude: 63.4305,
      longitude: 10.3951,
      impactRadius: 7, // Default radius in km
      startedAt: new Date().toISOString(),
      endedAt: null
    },
    isEditing: false,
    isCreating: false
  }),

  getters: {
    /**
     * Get severity levels for the dropdown
     */
    severityLevels() {
      const configs = IncidentConfigService.getSeverityLevels();
      return Object.entries(configs).map(([id, config]) => ({
        id,
        name: config.name
      }));
    },

    /**
     * Check if we have incidents
     */
    hasIncidents() {
      return this.incidents.length > 0;
    }
  },

  actions: {
    /**
     * Fetch all incidents for admin interface
     */
    async fetchIncidents() {
      this.isLoading = true;
      this.error = null;

      try {
        const incidents = await IncidentAdminService.fetchAllIncidentsForAdmin();
        this.incidents = incidents.map(incident => ({
          id: incident.id,
          name: incident.name || '',
          description: incident.description || '',
          severity: incident.severity || 'RED',
          latitude: incident.latitude,
          longitude: incident.longitude,
          impactRadius: incident.impactRadius || 7,
          startedAt: incident.startedAt,
          endedAt: incident.endedAt
        }));
        this.applyFilters();
      } catch (error) {
        this.error = 'Kunne ikke laste krisesituasjoner. Vennligst prøv igjen senere.';
        console.error('Error in fetchIncidents:', error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Apply search and filters to incidents
     */
    applyFilters() {
      this.filteredIncidents = this.incidents.filter(incident => {
        const matchesSearch =
          this.searchTerm === '' ||
          (incident.name && incident.name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (incident.description && incident.description.toLowerCase().includes(this.searchTerm.toLowerCase()));

        const matchesSeverity =
          this.filterSeverity === '' ||
          incident.severity === this.filterSeverity;

        return matchesSearch && matchesSeverity;
      });
    },

    /**
     * Set search term and apply filters
     */
    setSearchTerm(term) {
      this.searchTerm = term;
      this.applyFilters();
    },

    /**
     * Set filter severity and apply filters
     */
    setFilterSeverity(severity) {
      this.filterSeverity = severity;
      this.applyFilters();
    },

    /**
     * Reset form data for creating a new incident
     */
    initNewIncident() {
      this.incidentFormData = {
        id: null,
        name: '',
        description: '',
        severity: 'RED',
        latitude: 63.4305,
        longitude: 10.3951,
        impactRadius: 7,
        startedAt: new Date().toISOString(),
        endedAt: null
      };
      this.isCreating = true;
      this.isEditing = false;
      this.error = null;
      this.success = null;
    },

    /**
     * Load incident data into form for editing
     */
    editIncident(incident) {
      this.incidentFormData = {
        id: incident.id,
        name: incident.name || '',
        description: incident.description || '',
        severity: incident.severity || 'RED',
        latitude: incident.latitude,
        longitude: incident.longitude,
        impactRadius: incident.impactRadius || 7,
        startedAt: incident.startedAt,
        endedAt: incident.endedAt
      };

      this.isEditing = true;
      this.isCreating = false;
      this.error = null;
      this.success = null;
    },

    /**
     * Create a new incident
     */
    async createIncident() {
      this.isLoading = true;
      this.error = null;

      try {
        await IncidentAdminService.createIncident(this.incidentFormData);
        this.success = 'Krisesituasjon opprettet.';
        await this.fetchIncidents();
        this.isCreating = false;
        return true;
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
          this.error = error.response.data.error;
        } else {
          this.error = 'Kunne ikke opprette krisesituasjon. Vennligst prøv igjen senere.';
        }
        console.error('Error in createIncident:', error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Update an existing incident
     */
    async updateIncident() {
      this.isLoading = true;
      this.error = null;

      try {
        await IncidentAdminService.updateIncident(this.incidentFormData.id, this.incidentFormData);
        this.success = 'Krisesituasjon oppdatert.';
        await this.fetchIncidents();
        this.isEditing = false;
        return true;
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
          this.error = error.response.data.error;
        } else {
          this.error = 'Kunne ikke oppdatere krisesituasjon. Vennligst prøv igjen senere.';
        }
        console.error('Error in updateIncident:', error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Save incident (create or update)
     */
    async saveIncident() {
      if (this.isCreating) {
        return await this.createIncident();
      } else if (this.isEditing) {
        return await this.updateIncident();
      }
      return false;
    },

    /**
     * Delete an incident
     */
    async deleteIncident(id) {
      this.isLoading = true;
      this.error = null;

      try {
        await IncidentAdminService.deleteIncident(id);
        this.success = 'Krisesituasjon slettet.';
        this.incidents = this.incidents.filter(incident => incident.id !== id);
        this.applyFilters();

        if (this.isEditing && this.incidentFormData.id === id) {
          this.isEditing = false;
        }

        return true;
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
          this.error = error.response.data.error;
        } else {
          this.error = 'Kunne ikke slette krisesituasjon. Vennligst prøv igjen senere.';
        }
        console.error('Error in deleteIncident:', error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Fetch all scenarios
     */
    async fetchScenarios() {
      try {
        this.scenarios = await ScenarioService.getAllScenarios();
      } catch (error) {
        console.error('Kunne ikke hente scenarier:', error);
      }
    },

    /**
     * Set selected scenario ID
     */
    setSelectedScenario(id) {
      this.selectedScenarioId = id;
    },

    /**
     * Update incident coordinates
     */
    updateIncidentCoordinates(lat, lng) {
      this.incidentFormData.latitude = lat;
      this.incidentFormData.longitude = lng;
    },

    /**
     * Update incident radius
     */
    updateIncidentRadius(radius) {
      this.incidentFormData.impactRadius = radius;
    },

    /**
     * Cancel editing/creating
     */
    cancelEdit() {
      this.isEditing = false;
      this.isCreating = false;
      this.error = null;
      this.success = null;
    },

    /**
     * Clear success message
     */
    clearSuccess() {
      this.success = null;
    },

    /**
     * Clear error message
     */
    clearError() {
      this.error = null;
    }
  }
});
