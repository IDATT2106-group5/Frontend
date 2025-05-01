import BaseService from '@/service/baseService';

class StorageService extends BaseService {
  constructor() {
    super('/storage');
  }

  // Get all storage items for a household
  async getStorageItemsByHousehold(householdId) {
    try {
      const response = await this.get(`/household/${householdId}`);
      return response;
    } catch (error) {
      console.error("Error fetching storage items:", error);
      throw error;
    }
  }

  // Get storage items by household and type
  async getStorageItemsByType(householdId, itemType) {
    try {
      const response = await this.get(`/household/${householdId}/type/${itemType}`);
      return response;
    } catch (error) {
      console.error(`Error fetching ${itemType} items:`, error);
      throw error;
    }
  }

  // Get items that are expiring soon
  async getExpiringItems(householdId, beforeDate) {
    try {
      // Format date as ISO string for the API
      const formattedDate = beforeDate.toISOString();
      const response = await this.get(`/household/${householdId}/expiring?before=${formattedDate}`);
      return response;
    } catch (error) {
      console.error("Error fetching expiring items:", error);
      throw error;
    }
  }

  // Add a new item to storage
  async addItemToStorage(householdId, itemId, data) {
    try {
      const response = await this.post(`/household/${householdId}/item/${itemId}`, {
        unit: data.unit,
        amount: data.amount,
        expirationDate: data.expirationDate ? data.expirationDate.toISOString() : null
      });
      return response;
    } catch (error) {
      console.error("Error adding item to storage:", error);
      throw error;
    }
  }

  // Remove an item from storage
  async removeItemFromStorage(storageItemId) {
    try {
      const response = await this.delete(`/${storageItemId}`);
      return response;
    } catch (error) {
      console.error("Error removing item from storage:", error);
      throw error;
    }
  }

  // Update a storage item
  async updateStorageItem(storageItemId, data) {
    try {
      const payload = {
        unit: data.unit,
        amount: data.amount,
        expirationDate: data.expirationDate ? data.expirationDate.toISOString() : null
      };

      const response = await this.put(`/${storageItemId}`, payload);
      return response;
    } catch (error) {
      console.error("Error updating storage item:", error);
      throw error;
    }
  }
}

export default new StorageService();
