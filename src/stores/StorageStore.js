import { defineStore } from 'pinia';
import StorageService from '@/service/storageService';

export const useStorageStore = defineStore('storage', {
  state: () => ({
    householdId: null,
    items: [],
    isLoading: false,
    error: null,
    filters: {
      searchQuery: '',
      selectedType: null
    }
  }),

  getters: {
    // Check if there are no items
    isEmpty: (state) => state.items.length === 0,

    // Filter items based on search query
    filteredItems: (state) => {
      if (!state.filters.searchQuery) {
        return state.items;
      }

      const query = state.filters.searchQuery.toLowerCase();
      return state.items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    },

    // Group items by their type
    groupedItems: (state) => {
      const groups = {
        'Væske': [],
        'Mat': [],
        'Medisiner': [],
        'Diverse': []
      };

      // Filter items first if there's a search query
      const itemsToGroup = state.filters.searchQuery ?
        state.filteredItems : state.items;

      // Group items by type
      itemsToGroup.forEach(item => {
        const type = item.type || 'Diverse';
        if (groups[type]) {
          groups[type].push(item);
        } else {
          groups['Diverse'].push(item);
        }
      });

      return groups;
    },

    // Get items expiring within 30 days
    expiringItems: (state) => {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      return state.items.filter(item => {
        if (!item.expirationDate) return false;

        const expDate = new Date(item.expirationDate);
        return expDate <= thirtyDaysFromNow && expDate >= today;
      });
    }
  },

  actions: {
    // Set the current household ID
    setHouseholdId(id) {
      this.householdId = id;
    },

    // Set search filters
    setSearchQuery(query) {
      this.filters.searchQuery = query;
    },

    setSelectedType(type) {
      this.filters.selectedType = type;
    },

    // Reset state
    resetState() {
      this.items = [];
      this.isLoading = false;
      this.error = null;
      this.filters = {
        searchQuery: '',
        selectedType: null
      };
    },

    // Fetch all items for the current household
    async fetchAllItems() {
      if (!this.householdId) {
        this.error = 'No household ID provided';
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const response = await StorageService.getStorageItemsByHousehold(this.householdId);
        this.items = response.data;
      } catch (error) {
        this.error = error.message || 'Failed to fetch storage items';
        console.error('Error in fetchAllItems:', error);
      } finally {
        this.isLoading = false;
      }
    },

    // Fetch items by type
    async fetchItemsByType(type) {
      if (!this.householdId) {
        this.error = 'No household ID provided';
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const response = await StorageService.getStorageItemsByType(this.householdId, type);
        // Update only items of this type
        this.items = this.items.filter(item => item.type !== type).concat(response.data);
        this.setSelectedType(type);
      } catch (error) {
        this.error = error.message || `Failed to fetch ${type} items`;
        console.error('Error in fetchItemsByType:', error);
      } finally {
        this.isLoading = false;
      }
    },

    // Fetch expiring items
    async fetchExpiringItems(beforeDate = null) {
      if (!this.householdId) {
        this.error = 'No household ID provided';
        return;
      }

      // Default to 30 days from now if no date provided
      const date = beforeDate || new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));

      this.isLoading = true;
      this.error = null;

      try {
        const response = await StorageService.getExpiringItems(this.householdId, date);
        return response.data; // Return without updating state to allow for separate display
      } catch (error) {
        this.error = error.message || 'Failed to fetch expiring items';
        console.error('Error in fetchExpiringItems:', error);
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    // Add a new item to storage
    async addItemToStorage(itemId, data) {
      if (!this.householdId) {
        this.error = 'No household ID provided';
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const response = await StorageService.addItemToStorage(this.householdId, itemId, data);
        // Add the new item to the local state
        this.items.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message || 'Failed to add item to storage';
        console.error('Error in addItemToStorage:', error);
      } finally {
        this.isLoading = false;
      }
    },

    // Remove an item from storage
    async removeItemFromStorage(storageItemId) {
      this.isLoading = true;
      this.error = null;

      try {
        await StorageService.removeItemFromStorage(storageItemId);
        // Remove the item from local state
        this.items = this.items.filter(item => item.id !== storageItemId);
      } catch (error) {
        this.error = error.message || 'Failed to remove item from storage';
        console.error('Error in removeItemFromStorage:', error);
      } finally {
        this.isLoading = false;
      }
    },

    // Update a storage item
    async updateStorageItem(storageItemId, data) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await StorageService.updateStorageItem(storageItemId, data);
        // Update the item in local state
        const index = this.items.findIndex(item => item.id === storageItemId);
        if (index !== -1) {
          this.items[index] = { ...this.items[index], ...response.data };
        }
        return response.data;
      } catch (error) {
        this.error = error.message || 'Failed to update storage item';
        console.error('Error in updateStorageItem:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }
});
