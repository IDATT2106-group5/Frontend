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

    console.log(`Fetching paginated items: page=${page}, size=${size}, search=${searchTerm}`);
    const response = await this.get(`paginated?${queryParams.toString()}`);
    console.log(`Paginated items response:`, response);

    if (!response ||
        (Array.isArray(response) && response.length === 0) ||
        (response.content && Array.isArray(response.content) && response.content.length === 0)) {
      console.log('Response is empty, no more items to fetch');
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
      console.log('Calling getAllItems API endpoint')
      const response = await this.get('')
      console.log('getAllItems response:', response)
      return response
    } catch (error) {
      console.error('Error in getAllItems:', error)
      throw error
    }
  }

  // Fetch items by type
  async getItemsByType(type) {
    try {
      console.log(`Calling getItemsByType API endpoint for type: ${type}`)
      const response = await this.get(`/type/${type}`)
      console.log(`getItemsByType response for ${type}:`, response)
      return response
    } catch (error) {
      console.error(`Error in getItemsByType for ${type}:`, error)
      throw error
    }
  }

  // Fetch a single item by ID
  async getItemById(id) {
    try {
      console.log(`Calling getItemById API endpoint for ID: ${id}`)
      const response = await this.get(`/${id}`)
      console.log(`getItemById response for ${id}:`, response)
      return response
    } catch (error) {
      console.error(`Error in getItemById for ${id}:`, error)
      throw error
    }
  }
}

export default new ItemService()
