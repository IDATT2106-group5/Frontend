import apiClient from '@/service/apiClient';

class StorageService {
  /**
   * Fetch all storage items for a household
   * @param {number} householdId - ID of the household
   * @returns {Promise} Promise containing response with array of storage items
   */
  async getAllItems(householdId) {
    return apiClient.get(`/storage/household/${householdId}`);
  }

  /**
   * Fetch storage items by household and type
   * @param {number} householdId - ID of the household
   * @param {string} itemType - Type of items (LIQUID, FOOD, MEDICINE, MISC)
   * @returns {Promise} Promise containing response with items of the specified type
   */
  async getItemsByType(householdId, itemType) {
    return apiClient.get(`/storage/household/${householdId}/type/${itemType}`);
  }

  /**
   * Fetch expiring items for a household
   * @param {number} householdId - ID of the household
   * @param {Date} beforeDate - Date before which items are considered expiring
   * @returns {Promise} Promise containing response with expiring items
   */
  async getExpiringItems(householdId, beforeDate) {
    const formattedDate = beforeDate.toISOString();
    return apiClient.get(`/storage/household/${householdId}/expiring?before=${formattedDate}`);
  }

  /**
   * Add an item to storage
   * @param {number} householdId - ID of the household
   * @param {number} itemId - ID of the item to add to storage
   * @param {Object} data - Item data including unit, amount, and optionally expirationDate
   * @returns {Promise} Promise containing response with stored item
   */
  async addItemToStorage(householdId, itemId, data) {
    return apiClient.post(`/storage/household/${householdId}/item/${itemId}`, data);
  }

  /**
   * Update a storage item
   * @param {number} storageItemId - ID of the storage item
   * @param {Object} data - Updated storage item data
   * @returns {Promise} Promise containing response with updated storage item
   */
  async updateStorageItem(storageItemId, data) {
    return apiClient.put(`/storage/${storageItemId}`, data);
  }

  /**
   * Delete a storage item
   * @param {number} storageItemId - ID of the storage item
   * @returns {Promise} Promise containing response
   */
  async removeItemFromStorage(storageItemId) {
    return apiClient.delete(`/storage/${storageItemId}`);
  }
}

export default new StorageService();
