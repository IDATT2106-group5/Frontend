import BaseService from '@/service/baseService';

/**
 * Service for handling storage related API operations such as
 * fetching, adding, updating, and deleting household storage items.
 * Extends the BaseService class to use pre defined HTTP methods.
 */
class StorageService extends BaseService {
  /**
   * Initializes the storage service with the '/storage' base path.
   */
  constructor() {
    super('/storage');
  }

  /**
   * Fetches all storage items for a specific household.
   *
   * @param {string} householdId  The ID of the household.
   * @returns {Promise<Array<Object>>} Promise resolving to list of storage items.
   * @throws {Error} If the request fails.
   */
  async getStorageItemsByHousehold() {
    try {
      const response = await this.get(`household`);
      return response;
    } catch (error) {
      console.error("Error fetching storage items:", error);
      throw error;
    }
  }

  /**
   * Fetches storage items for a household filtered by item type.
   *
   * @param {string} householdId  The ID of the household.
   * @param {string} itemType  The type of items to fetch (e.g. FOOD, LIQUIDS).
   * @returns {Promise<Array<Object>>} Promise resolving to filtered storage items.
   * @throws {Error} If the request fails.
   */
  async getStorageItemsByType(itemType) {
    try {
      const response = await this.get(`household/type/${itemType}`);
      return response;
    } catch (error) {
      console.error(`Error fetching ${itemType} items:`, error);
      throw error;
    }
  }

  /**
   * Fetches items that expire before a specified date.
   *
   * @param {string} householdId  The ID of the household.
   * @param {Date} beforeDate  Date before which items expire.
   * @returns {Promise<Array<Object>>} Promise resolving to expiring items.
   * @throws {Error} If the request fails.
   */
  async getExpiringItems(beforeDate) {
    try {

      const formattedDate = beforeDate.toISOString();
      const response = await this.get(`household/expiring?before=${formattedDate}`);
      return response;
    } catch (error) {
      console.error("Error fetching expiring items:", error);
      throw error;
    }
  }

  /**
   * Adds a new item to the household's storage.
   *
   * @param {string} householdId  The ID of the household.
   * @param {string} itemId  The ID of the item to add.
   * @param {{ unit: string, amount: number, expirationDate?: string }} data  Item data.
   * @returns {Promise<Object>} Promise resolving to the added item response.
   * @throws {Error} If the request fails.
   */
  async addItemToStorage(itemId, data) {
    try {

      let formattedDate = null;
      if (data.expirationDate) {
        const date = new Date(data.expirationDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}T00:00:00`;
      }

      const payload = {
        unit: data.unit,
        amount: data.amount,
        expirationDate: formattedDate
      };

      const response = await this.post(`household/item/${itemId}`, payload);
      return response;
    } catch (error) {
      console.error("Error adding item to storage:", error);
      throw error;
    }
  }

  /**
   * Removes an item from storage.
   *
   * @param {string} storageItemId  ID of the storage item to remove.
   * @returns {Promise<Object>} Promise resolving to the delete response.
   * @throws {Error} If the request fails.
   */
  async removeItemFromStorage(storageItemId) {
    try {
      const response = await this.post(`${storageItemId}`);
      return response;
    } catch (error) {
      console.error("Error removing item from storage:", error);
      throw error;
    }
  }

    /**
   * Updates an existing storage item with new data.
   *
   * @param {string} storageItemId  ID of the storage item to update.
   * @param {{ unit: string, amount: number, expirationDate: string }} data  Updated item data.
   * @returns {Promise<Object>} Promise resolving to the updated item response.
   * @throws {Error} If the request fails.
   */
  async updateStorageItem(storageItemId, data) {
    try {
      const payload = {
        unit: data.unit,
        amount: data.amount,
        expirationDate: data.expirationDate
      };

      const response = await this.put(`${storageItemId}`, payload);
      return response;
    } catch (error) {
      console.error("Error updating storage item:", error);
      throw error;
    }
  }
}

export default new StorageService();
