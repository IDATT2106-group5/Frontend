import BaseService from '@/service/baseService'

/**
 * Service class for handling news-related API operations
 * @extends BaseService
 */
class NewsService extends BaseService {
  /**
   * Creates an instance of NewsService with the news API endpoint
   */
  constructor() {
    super('/news')
  }

  /**
   * Retrieves paginated news from the system
   * @async
   * @param {number} page - The page number to retrieve
   * @param {number} size - The number of items per page
   * @returns {Promise<Object>} Promise resolving to an object containing news array and pagination info
   */
  async fetchPaginatedNews(page, size) {
    const response = await this.get(`get/?page=${page}&size=${size}`)
    const data = response
    
    return {
      news: data.news || [],
      totalPages: data.totalPages || 1,
      totalElements: data.totalElements || 0,
    }
  }

  /**
   * Retrieves a specific news item by its ID
   * @async
   * @param {number} id - The unique identifier of the news to retrieve
   * @returns {Promise<Object>} Promise resolving to the news object
   */
  async getNewsById(id) {
    return await this.get(`${id}`)
  }

  /**
   * Creates a new news item in the system
   * @async
   * @param {Object} newsData - The data for the new news item
   * @returns {Promise<Object>} Promise resolving to the API response
   */
  async createNews(newsData) {
    return await this.post('create', newsData)
  }

  /**
   * Deletes a news item from the system
   * @async
   * @param {number} id - The unique identifier of the news item to delete
   * @returns {Promise<Object>} Promise resolving to the API response
   */
  async deleteNews(id) {
    return await this.post(`delete/${id}`)
  }

  /**
   * Updates an existing news item in the system
   * @async
   * @param {number} id - The unique identifier of the news item to update
   * @param {Object} newsData - The updated news data
   * @returns {Promise<Object>} Promise resolving to the API response
   */
  async updateNews(id, newsData) {
    return await this.post(`edit/${id}`, newsData)
  }
}

export default new NewsService()