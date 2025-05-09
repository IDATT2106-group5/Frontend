import BaseService from '@/service/baseService'

/**
 * Service class for handling scenario-related API operations
 * @extends BaseService
 */
class NewsService extends BaseService {
  /**
   * Creates an instance of ScenarioService with the scenarios API endpoint
   */
  constructor() {
    super('/news')
  }

  /**
   * Retrieves all scenarios from the system
   * @async
   * @returns {Promise<Array>} Promise resolving to an array of scenario objects
   * @throws {Error} If the API request fails
   */
  async fetchPaginatedNews(page, size) {
    try {
      const response = await this.get(`get/?page=${page}&size=${size}`)
      const data = response

      console.log(data)

      return {
        news: data.news || [],
        totalPages: data.totalPages || 1,
        totalElements: data.totalElements || 0,
      }
    } catch (error) {
      console.error('[ScenarioService] Failed to fetch scenarios:', error)
    }
  }

  /**
   * Retrieves a specific scenario by its ID
   * @async
   * @param {number} id - The unique identifier of the scenario to retrieve
   * @returns {Promise<Object>} Promise resolving to the scenario object
   * @throws {Error} If the API request fails
   */
  async getNewsById(id) {
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
   * @param {Object} newsData - The data for the new scenario
   * @returns {Promise<Object>} Promise resolving to the API response with a success message
   * @throws {Error} If the scenario creation request fails
   */
  async createNews(NewsData) {
    try {
      return await this.post('create', NewsData)
    } catch (error) {
      console.error('[ScenarioService] Failed to create scenario:', error)
      throw error
    }
  }

  async deleteNews(id) {
    try {
      return await this.post(`delete/${id}`)
    } catch (error) {
      console.error('[ScenarioService] Failed to delete scenario:', error)
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
  async updateNews(id, newsData) {
    try {
      return await this.post(`edit/${id}`, newsData)
    } catch (error) {
      console.error('[ScenarioService] Failed to update scenario:', error)
      throw error
    }
  }
}

export default new NewsService()
