import BaseService from './baseService'

class ItemService extends BaseService {
  constructor() {
    super('/items')
  }

// Fetch paginated items
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

  // Fetch all catalog items
  async getAllItems() {
    try {
      const response = await this.get('')

      return response
    } catch (error) {
      console.error('Error in getAllItems:', error)
      throw error
    }
  }

  // Fetch items by type
  async getItemsByType(type) {
    try {
      const response = await this.get(`/type/${type}`)
      return response
    } catch (error) {
      console.error(`Error in getItemsByType for ${type}:`, error)
      throw error
    }
  }

  // Fetch a single item by ID
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
