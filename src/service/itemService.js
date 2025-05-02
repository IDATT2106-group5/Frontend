import BaseService from './baseService';

class ItemService extends BaseService {
  constructor() {
    super('/items');
  }

  // Fetch all catalog items
  async getAllItems() {
    try {
      console.log("Calling getAllItems API endpoint");
      const response = await this.get('');
      console.log("getAllItems response:", response);
      return response;
    } catch (error) {
      console.error("Error in getAllItems:", error);
      throw error;
    }
  }

  // Fetch items by type
  async getItemsByType(type) {
    try {
      console.log(`Calling getItemsByType API endpoint for type: ${type}`);
      const response = await this.get(`/type/${type}`);
      console.log(`getItemsByType response for ${type}:`, response);
      return response;
    } catch (error) {
      console.error(`Error in getItemsByType for ${type}:`, error);
      throw error;
    }
  }

  // Fetch a single item by ID
  async getItemById(id) {
    try {
      console.log(`Calling getItemById API endpoint for ID: ${id}`);
      const response = await this.get(`/${id}`);
      console.log(`getItemById response for ${id}:`, response);
      return response;
    } catch (error) {
      console.error(`Error in getItemById for ${id}:`, error);
      throw error;
    }
  }
}

export default new ItemService();
