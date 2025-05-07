import { defineStore } from 'pinia' // Assuming you're using Pinia for state management
import ScenarioService from '@/service/scenarioService'

/**
 * Store for managing scenario data and state
 */
export const useScenarioStore = defineStore('scenario', {
  state: () => ({
    scenarios: [],
    loading: false,
    error: null,
    selectedScenario: null,
  }),

  getters: {
    /**
     * Returns all scenarios from the store
     * @returns {Array} Array of scenario objects
     */
    getAllScenarios: (state) => state.scenarios,

    /**
     * Returns the currently selected scenario
     * @returns {Object|null} The selected scenario or null if none selected
     */
    getSelectedScenario: (state) => state.selectedScenario,

    /**
     * Returns the loading state
     * @returns {boolean} True if scenarios are being loaded, false otherwise
     */
    isLoading: (state) => state.loading,

    /**
     * Returns any error that occurred during scenario operations
     * @returns {Error|null} The error or null if no error occurred
     */
    getError: (state) => state.error,
  },

  actions: {
    /**
     * Fetches all scenarios from the API and updates the store
     * @async
     */
    async fetchAllScenarios() {
      this.loading = true
      this.error = null

      try {
        this.scenarios = await ScenarioService.getAllScenarios()
      } catch (error) {
        console.error('[ScenarioStore] Failed to fetch scenarios:', error)
        this.error = error
      } finally {
        this.loading = false
      }
    },
    /**
     * Fetches a single scenario by its ID from the API
     * @async
     * @param {number} id - The ID of the scenario to fetch
     * @returns {Promise<Object>} The fetched scenario
     */
    async fetchScenarioById(id) {
      this.loading = true;
      this.error = null;

      try {
        const scenario = await ScenarioService.getScenarioById(id);
        // Update the selected scenario with the fetched data
        this.selectedScenario = scenario;
        return scenario;
      } catch (error) {
        console.error('[ScenarioStore] Failed to fetch scenario by ID:', error);
        this.error = error;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Selects a scenario by its ID
     * @param {number} id - The ID of the scenario to select
     */
    selectScenario(id) {
      this.selectedScenario = this.scenarios.find((scenario) => scenario.id === id) || null
    },

    /**
     * Creates a new scenario and updates the store
     * @async
     * @param {Object} scenarioData - The data for the new scenario
     * @returns {Promise<Object>} The result of the operation
     */
    async createScenario(scenarioData) {
      this.loading = true
      this.error = null

      try {
        const result = await ScenarioService.createScenario(scenarioData)
        // Refresh scenarios to get the newly created one with its server-assigned ID
        await this.fetchAllScenarios()
        return result
      } catch (error) {
        console.error('[ScenarioStore] Failed to create scenario:', error)
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Updates an existing scenario and refreshes the store
     * @async
     * @param {number} id - The ID of the scenario to update
     * @param {Object} scenarioData - The updated scenario data
     * @returns {Promise<Object>} The result of the operation
     */
    async updateScenario(id, scenarioData) {
      this.loading = true
      this.error = null

      try {
        const result = await ScenarioService.updateScenario(id, scenarioData)
        // Refresh scenarios to get the updated data
        await this.fetchAllScenarios()
        // If this was the selected scenario, update it
        if (this.selectedScenario && this.selectedScenario.id === id) {
          this.selectScenario(id)
        }
        return result
      } catch (error) {
        console.error('[ScenarioStore] Failed to update scenario:', error)
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Resets the store state
     */
    resetState() {
      this.scenarios = []
      this.loading = false
      this.error = null
      this.selectedScenario = null
    },
  },
})