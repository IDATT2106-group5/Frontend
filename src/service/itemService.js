import apiClient from './apiClient';

/**
 * Service for managing storage items through API calls
 */
export const itemService = {
  /**
   * Fetch all items
   * @returns {Promise<Array>} Promise containing array of items
   */
  getAllItems() {
    return apiClient.get('/items')
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching all items:', error);
        throw error;
      });
  },

  /**
   * Fetch items by category
   * @param {string} category - Category name
   * @returns {Promise<Array>} Promise containing array of items in the category
   */
  getItemsByCategory(category) {
    return apiClient.get(`/items/category/${category}`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error fetching items for category ${category}:`, error);
        throw error;
      });
  },

  /**
   * Fetch a single item by ID
   * @param {string|number} id - Item ID
   * @returns {Promise<Object>} Promise containing the item object
   */
  getItemById(id) {
    return apiClient.get(`/items/${id}`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error fetching item with ID ${id}:`, error);
        throw error;
      });
  },

  /**
   * Create a new item
   * @param {Object} item - Item data
   * @returns {Promise<Object>} Promise containing the created item
   */
  createItem(item) {
    return apiClient.post('/items', item)
      .then(response => response.data)
      .catch(error => {
        console.error('Error creating item:', error);
        throw error;
      });
  },

  /**
   * Update an existing item
   * @param {string|number} id - Item ID
   * @param {Object} item - Updated item data
   * @returns {Promise<Object>} Promise containing the updated item
   */
  updateItem(id, item) {
    return apiClient.put(`/items/${id}`, item)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error updating item with ID ${id}:`, error);
        throw error;
      });
  },

  /**
   * Delete an item
   * @param {string|number} id - Item ID
   * @returns {Promise} Promise indicating success/failure
   */
  deleteItem(id) {
    return apiClient.delete(`/items/${id}`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error deleting item with ID ${id}:`, error);
        throw error;
      });
  },

  /**
   * Search items by query
   * @param {string} query - Search query
   * @returns {Promise<Array>} Promise containing array of matching items
   */
  searchItems(query) {
    return apiClient.get(`/items/search?q=${encodeURIComponent(query)}`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error searching items with query "${query}":`, error);
        throw error;
      });
  },

  /**
   * Fetch grouped items by category
   * @returns {Promise<Object>} Promise containing object with items grouped by categories
   */
  getGroupedItems() {
    return apiClient.get('/items')
      .then(response => {
        // Group items by category
        const items = response.data;
        return items.reduce((groups, item) => {
          const { category } = item;
          if (!groups[category]) {
            groups[category] = [];
          }
          groups[category].push(item);
          return groups;
        }, {
          Væske: [],
          Mat: [],
          Medisiner: [],
          Diverse: []
        });
      })
      .catch(error => {
        console.error('Error fetching grouped items:', error);
        throw error;
      });
  }
};

export default itemService;
