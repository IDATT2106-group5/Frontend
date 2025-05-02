import BaseService from './baseService';

class ItemService extends BaseService {
  constructor() {
    super('/items');
  }

  // Fetch all catalog items
  async getAllItems() {
    try {
      // Remove the /getAll part
      return await this.get('');
    } catch (error) {
      console.error("Error fetching items:", error);
      throw error;
    }
  }

  // Fetch items by type
  async getItemsByType(type) {
    try {
      return await this.get(`/type/${type}`);
    } catch (error) {
      console.error("Error fetching items by type:", error);
      throw error;
    }
  }

  // Fetch a single item by ID
  async getItemById(id) {
    try {
      return await this.get(`/${id}`);
    } catch (error) {
      console.error("Error fetching item by ID:", error);
      throw error;
    }
  }
}

export default new ItemService();