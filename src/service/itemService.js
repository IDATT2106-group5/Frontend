import BaseService from './baseService';

class ItemService extends BaseService {
  constructor() {
    super('/items');
  }

  // Fetch all catalog items
  async getAllItems() {
    try {
      return await this.get('/');
    } catch (error) {
      console.error("Error fetching items:", error);
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
