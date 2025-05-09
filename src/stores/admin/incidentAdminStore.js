import { defineStore } from 'pinia';
import IncidentAdminService from '@/service/admin/incidentAdminService';
import IncidentConfigService from '@/service/map/incidentConfigService';
import ScenarioService from '@/service/scenarioService';
import { useMapStore } from '@/stores/map/mapStore';
import { toast } from '@/components/ui/toast/index.js'

/**
 * @function useIncidentAdminStore
 * @description Pinia store for managing incidents in the admin interface
 * @returns {Object} Store instance with state, getters, and actions
 */
export const useIncidentAdminStore = defineStore('incidentAdmin', {
  /**
   * @property {Function} state
   * @description Initial state of the store
   * @returns {Object} State object containing incidents, form data, and UI state
   */
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
    editingIncidentId: null,

    /**
     * @type {Incident} Form data for creating or editing an incident
     */
    incidentFormData: {
      id: null,
      name: '',
      description: '',
      severity: 'RED',
      latitude: 63.4305,
      longitude: 10.3951,
      impactRadius: 7,
      startedAt: new Date().toISOString(),
      endedAt: null,
      scenarioId: null
    },

    /** @type {boolean} Flag indicating if an incident is being edited */
    isEditing: false,

    /** @type {boolean} Flag indicating if a new incident is being created */
    isCreating: false
  }),


  getters: {
    /**
     * @function severityLevels
     * @description Get severity levels for the dropdown
     * @returns {Array<SeverityLevel>} Array of severity level objects with id and name
     */
    severityLevels() {
      const configs = IncidentConfigService.getSeverityLevels();
      return Object.entries(configs).map(([id, config]) => ({
        id,
        name: config.name
      }));
    },

    /**
     * @function hasIncidents
     * @description Check if there are incidents in the store
     * @returns {boolean} True if incidents exist, false otherwise
     */
    hasIncidents() {
      return this.incidents.length > 0;
    }
  },

  actions: {
    /**
     * @async
     * @function fetchIncidents
     * @description Fetch all incidents for admin interface
     * @returns {Promise<void>}
     */
    async fetchIncidents() {
      this.isLoading = true;
      this.error = null;

      try {
        const incidents = await IncidentAdminService.fetchAllIncidentsForAdmin();
        this.incidents = incidents.map(incident => ({
          id: incident.id,
          scenarioId: incident.scenarioId || null,
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
     * @function applyFilters
     * @description Apply search and filters to incidents
     * @returns {void}
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

    setEditingIncidentId(incidentId) {
      this.editingIncidentId = incidentId;
      // Force a redraw of incidents on the map
      useMapStore().updateIncidentsOnMap();
    },

    /**
     * @function setSearchTerm
     * @description Set search term and apply filters
     * @param {string} term - The search term to set
     * @returns {void}
     */
    setSearchTerm(term) {
      this.searchTerm = term;
      this.applyFilters();
    },

    /**
     * @function setFilterSeverity
     * @description Set filter severity and apply filters
     * @param {string} severity - The severity level to filter by
     * @returns {void}
     */
    setFilterSeverity(severity) {
      this.filterSeverity = severity;
      this.applyFilters();
    },

    /**
     * @function initNewIncident
     * @description Reset form data for creating a new incident
     * @returns {void}
     */
    initNewIncident() {
      this.incidentFormData = {
        id: null,
        scenarioId: null,
        name: '',
        description: '',
        severity: 'RED',
        latitude: 63.4305,
        longitude: 10.3951,
        impactRadius: 1,
        startedAt: new Date().toISOString(),
        endedAt: null
      };
      this.isCreating = true;
      this.isEditing = false;
      this.error = null;
      this.success = null;
    },

    /**
     * @function editIncident
     * @description Load incident data into form for editing
     * @param {Incident} incident - The incident to edit
     * @returns {void}
     */
    editIncident(incident) {
      this.setEditingIncidentId(incident.id);
      const scenarioId = incident.scenarioId || null;

      this.incidentFormData = {
        id: incident.id,
        scenarioId: scenarioId,
        name: incident.name || '',
        description: incident.description || '',
        severity: incident.severity,
        latitude: incident.latitude,
        longitude: incident.longitude,
        impactRadius: incident.impactRadius || 1,
        startedAt: incident.startedAt,
        endedAt: incident.endedAt
      };

      this.isEditing = true;
      this.isCreating = false;
      this.error = null;
      this.success = null;
    },

    /**
     * @async
     * @function createIncident
     * @description Create a new incident
     * @returns {Promise<boolean>} True if creation was successful, false otherwise
     */
    async createIncident() {
      this.isLoading = true;
      this.error = null;

      try {
        await IncidentAdminService.createIncident(this.incidentFormData);
        toast({
          title: 'Krise ble opprettet',
          description: 'Du har opprettet en ny krise.',
          variant: 'success',
        })
        await this.fetchIncidents();
        this.isCreating = false;
        return true;
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
          this.error = error.response.data.error;
        } else {
          console.error('Error in createIncident:', error);
          toast({
            title: 'Feil',
            description: 'Klarte ikke opprettet krise.',
            variant: 'destructive',
          })
        }
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * @async
     * @function updateIncident
     * @description Update an existing incident
     * @returns {Promise<boolean>} True if update was successful, false otherwise
     */
    async updateIncident() {
      this.isLoading = true;
      this.error = null;

      try {
        await IncidentAdminService.updateIncident(this.incidentFormData.id, this.incidentFormData);
        toast({
          title: 'Krise ble oppdatert',
          description: 'Du har oppdatert en krise.',
          variant: 'success',
        })
        this.editingIncidentId = null;
        await this.fetchIncidents();
        this.isEditing = false;
        return true;
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
          this.editingIncidentId = null;
          this.error = error.response.data.error;
        } else {
          this.error = 'Kunne ikke oppdatere krisesituasjon. Vennligst prøv igjen senere.';
          toast({
            title: 'Feil',
            description: 'Klarte ikke oppdatere krise.',
            variant: 'destructive',
          })
        }
        console.error('Error in updateIncident:', error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * @async
     * @function saveIncident
     * @description Save incident (create or update based on current mode)
     * @returns {Promise<boolean>} True if save was successful, false otherwise
     */
    async saveIncident() {
      if (this.isCreating) {
        const success = await this.createIncident();
        if (success) {
          await useMapStore().refreshIncidents();
        }
        return success;
      } else if (this.isEditing) {
        const success = await this.updateIncident();
        if (success) {
          await useMapStore().refreshIncidents();
        }
        return success;
      }
      return false;
    },

    /**
     * @async
     * @function deleteIncident
     * @description Delete an incident
     * @param {string} id - ID of the incident to delete
     * @returns {Promise<boolean>} True if deletion was successful, false otherwise
     */
    async deleteIncident(id) {
      this.isLoading = true;
      this.error = null;

      try {
        await IncidentAdminService.deleteIncident(parseInt(id));
        toast({
          title: 'Slettet en krise',
          description: 'Du har selttet en krise.',
          variant: 'success',
        })
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
        toast({
          title: 'Feil',
          description: 'Klarte ikke seltte krise.',
          variant: 'destructive',
        })
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * @async
     * @function fetchScenarios
     * @description Fetch all scenarios
     * @returns {Promise<void>}
     */
    async fetchScenarios() {
      try {
        this.scenarios = await ScenarioService.getAllScenarios();
      } catch (error) {
        console.error('Kunne ikke hente scenarier:', error);
      }
    },

    /**
     * @function setSelectedScenario
     * @description Set selected scenario ID
     * @param {string} id - ID of the selected scenario
     * @returns {void}
     */
    setSelectedScenario(id) {
      this.selectedScenarioId = id;
      if (this.incidentFormData) {
        this.incidentFormData.scenarioId = id;
      }
    },

    /**
     * @function updateIncidentCoordinates
     * @description Update incident coordinates
     * @param {number} lat - Latitude value
     * @param {number} lng - Longitude value
     * @returns {void}
     */
    updateIncidentCoordinates(lat, lng) {
      this.incidentFormData.latitude = lat;
      this.incidentFormData.longitude = lng;
    },

    /**
     * @function updateIncidentRadius
     * @description Update incident radius
     * @param {number} radius - Radius value in kilometers
     * @returns {void}
     */
    updateIncidentRadius(radius) {
      this.incidentFormData.impactRadius = radius;
    },

    /**
     * @function cancelEdit
     * @description Cancel editing/creating
     * @returns {void}
     */
    async cancelEdit() {
      this.isEditing = false;
      this.isCreating = false;
      this.error = null;
      this.success = null;

      // Important: Set editingIncidentId to null to display the original incident again
      this.editingIncidentId = null;

      // Update the map display to show the original incident
      useMapStore().updateIncidentsOnMap();
    },

    /**
     * @function clearSuccess
     * @description Clear success message
     * @returns {void}
     */
    clearSuccess() {
      this.success = null;
    },

    /**
     * @function clearError
     * @description Clear error message
     * @returns {void}
     */
    clearError() {
      this.error = null;
    }
  }
});
