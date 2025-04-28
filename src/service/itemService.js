import apiClient from '@/service/apiClient';

class ItemService {
  /**
   * Fetch all items
   * @returns {Promise} Promise containing response with array of items
   */
  async getAllItems() {
    return apiClient.get('/items');
  }

  /**
   * Fetch items by category
   * @param {string} category - Category name
   * @returns {Promise} Promise containing response with items in the category
   */
  async getItemsByCategory(category) {
    return apiClient.get(`/items/category/${category}`);
  }

  /**
   * Fetch a single item by ID
   * @param {string|number} id - Item ID
   * @returns {Promise} Promise containing response with item data
   */
  async getItemById(id) {
    return apiClient.get(`/items/${id}`);
  }

  /**
   * Create a new item
   * @param {Object} item - Item data
   * @returns {Promise} Promise containing response with created item
   */
  async createItem(item) {
    return apiClient.post('/items', item);
  }

  /**
   * Update an existing item
   * @param {string|number} id - Item ID
   * @param {Object} item - Updated item data
   * @returns {Promise} Promise containing response with updated item
   */
  async updateItem(id, item) {
    return apiClient.put(`/items/${id}`, item);
  }

  /**
   * Delete an item
   * @param {string|number} id - Item ID
   * @returns {Promise} Promise containing response
   */
  async deleteItem(id) {
    return apiClient.delete(`/items/${id}`);
  }

  /**
   * Search items by query
   * @param {string} query - Search query
   * @returns {Promise} Promise containing response with matching items
   */
  async searchItems(query) {
    return apiClient.get(`/items/search?q=${encodeURIComponent(query)}`);
  }
}

export default new ItemService();
