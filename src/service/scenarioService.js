import BaseService from './baseService'

/**
 * Service class for handling scenario-related API operations
 * @extends BaseService
 */
class ScenarioService extends BaseService {
  /**
   * Creates an instance of ScenarioService with the scenarios API endpoint
   */
  constructor() {
    super('/scenarios')
  }

  /**
   * Retrieves all scenarios from the system
   * @async
   * @returns {Promise<Array>} Promise resolving to an array of scenario objects
   * @throws {Error} If the API request fails
   */
  async getAllScenarios() {
    try {
      return await this.get('')
    } catch (error) {
      console.error('[ScenarioService] Failed to fetch scenarios:', error)
      throw error
    }
  }
  /**
   * Retrieves a specific scenario by its ID
   * @async
   * @param {number} id - The unique identifier of the scenario to retrieve
   * @returns {Promise<Object>} Promise resolving to the scenario object
   * @throws {Error} If the API request fails
   */
  async getScenarioById(id) {
    try {
      return await this.get(`${id}`)
    } catch (error) {
      console.error('[ScenarioService] Failed to fetch scenario by ID:', error)
      throw error
    }
  }

  /**
   * Creates a new scenario in the system
   * @async
   * @param {Object} scenarioData - The data for the new scenario
   * @returns {Promise<Object>} Promise resolving to the API response with a success message
   * @throws {Error} If the scenario creation request fails
   */
  async createScenario(scenarioData) {
    try {
      return await this.post('', scenarioData)
    } catch (error) {
      console.error('[ScenarioService] Failed to create scenario:', error)
      throw error
    }
  }

  /**
   * Updates an existing scenario in the system
   * @async
   * @param {number} id - The unique identifier of the scenario to update
   * @param {Object} scenarioData - The updated scenario data
   * @returns {Promise<Object>} Promise resolving to the API response with a success message
   * @throws {Error} If the scenario update request fails
   */
  async updateScenario(id, scenarioData) {
    try {
      return await this.put(`${id}`, scenarioData)
    } catch (error) {
      console.error('[ScenarioService] Failed to update scenario:', error)
      throw error
    }
  }
}

export default new ScenarioService()