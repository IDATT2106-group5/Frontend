import BaseService from './baseService'

/**
 * Service for retrieving item catalog data from the backend.
 * Supports paginated, filtered, and individual item queries.
 */
class ItemService extends BaseService {
  /**
   * Initializes the ItemService with the '/items' endpoint.
   */
  constructor() {
    super('/items')
  }

  /**
   * Fetches a paginated list of items, optionally filtered by a search term.
   *
   * @param {number} [page=0] - The page number to fetch.
   * @param {number} [size=5] - The number of items per page.
   * @param {string} [searchTerm=''] - Optional search term to filter results.
   * @returns {Promise<Object>} An object containing paginated items and `isEmpty` flag.
   */
async getPaginatedItems(page = 0, size = 5, searchTerm = '') {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });

    if (searchTerm) {
      queryParams.append('search', encodeURIComponent(searchTerm));
    }

    const response = await this.get(`paginated?${queryParams.toString()}`);

    if (!response ||
        (Array.isArray(response) && response.length === 0) ||
        (response.content && Array.isArray(response.content) && response.content.length === 0)) {
      return {
        content: [],
        isEmpty: true
      };
    }

    return response;
  } catch (error) {
    console.error(`Error fetching paginated items:`, error);
    return {
      content: [],
      isEmpty: true
    };
  }
}

  /**
   * Fetches all available catalog items.
   *
   * @returns {Promise<Array<Object>>} List of all items.
   * @throws {Error} If the request fails.
   */
  async getAllItems() {
    try {
      const response = await this.get('')

      return response
    } catch (error) {
      console.error('Error in getAllItems:', error)
      throw error
    }
  }

  /**
   * Fetches items filtered by a specific item type.
   *
   * @param {string} type - The type/category of items.
   * @returns {Promise<Array<Object>>} List of items of the given type.
   * @throws {Error} If the request fails.
   */
  async getItemsByType(type) {
    try {
      const response = await this.get(`/type/${type}`)
      return response
    } catch (error) {
      console.error(`Error in getItemsByType for ${type}:`, error)
      throw error
    }
  }

  /**
   * Fetches a single item by its ID.
   *
   * @param {string|number} id - The ID of the item to retrieve.
   * @returns {Promise<Object>} The item object.
   * @throws {Error} If the request fails.
   */
  async getItemById(id) {
    try {
      const response = await this.get(`/${id}`)
      return response
    } catch (error) {
      console.error(`Error in getItemById for ${id}:`, error)
      throw error
    }
  }
}

export default new ItemService()
