import { defineStore } from 'pinia';
import StorageService from '@/service/StorageService';

// Map backend item types to frontend categories
const typeToCategory = {
  'LIQUID': 'Væske',
  'FOOD': 'Mat',
  'MEDICINE': 'Medisiner',
  'MISC': 'Diverse'
};

// Map frontend categories to backend item types
const categoryToType = {
  'Væske': 'LIQUID',
  'Mat': 'FOOD',
  'Medisiner': 'MEDICINE',
  'Diverse': 'MISC'
};

export const useStorageStore = defineStore('storage', {
  state: () => ({
    householdId: null, // Current household ID
    storageItems: [],
    groupedItems: {
      Væske: [],
      Mat: [],
      Medisiner: [],
      Diverse: []
    },
    currentItem: null,
    isLoading: false,
    error: null
  }),

  getters: {
    getItemById: (state) => (id) => {
      return state.storageItems.find(item => item.id === id);
    },

    itemsByCategory: (state) => (category) => {
      return state.storageItems.filter(item => {
        // Map backend item type to frontend category
        const itemCategory = typeToCategory[item.item.type] || 'Diverse';
        return itemCategory === category;
      });
    },

    isEmpty: (state) => {
      return state.storageItems.length === 0;
    }
  },

  actions: {
    // Set the current household ID
    setHouseholdId(id) {
      this.householdId = id;
    },

    async fetchAllItems() {
      if (!this.householdId) {
        this.error = "Ingen husholdning valgt.";
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const response = await StorageService.getAllItems(this.householdId);
        this.storageItems = response.data;
        this.groupItemsByCategory();
        return this.storageItems;
      } catch (err) {
        this.error = err.message || "Kunne ikke hente lagringsartikler.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchItemsByCategory(category) {
      if (!this.householdId) {
        this.error = "Ingen husholdning valgt.";
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        // Convert frontend category to backend type
        const itemType = categoryToType[category];
        if (!itemType) {
          throw new Error(`Ugyldig kategori: ${category}`);
        }

        const response = await StorageService.getItemsByType(this.householdId, itemType);

        // Update only the specified category in groupedItems
        this.groupedItems[category] = response.data;

        // Update the main items array as well
        const itemsInOtherCategories = this.storageItems.filter(item => {
          const itemCategory = typeToCategory[item.item.type] || 'Diverse';
          return itemCategory !== category;
        });
        this.storageItems = [...itemsInOtherCategories, ...response.data];

        return response.data;
      } catch (err) {
        this.error = err.message || `Kunne ikke hente ${category} artikler.`;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchExpiringItems(beforeDate) {
      if (!this.householdId) {
        this.error = "Ingen husholdning valgt.";
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const response = await StorageService.getExpiringItems(this.householdId, beforeDate);
        return response.data;
      } catch (err) {
        this.error = err.message || "Kunne ikke hente utgående artikler.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async addItemToStorage(itemId, data) {
      if (!this.householdId) {
        this.error = "Ingen husholdning valgt.";
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const response = await StorageService.addItemToStorage(this.householdId, itemId, data);
        const newItem = response.data;

        // Add to storageItems array
        this.storageItems.push(newItem);

        // Add to appropriate category in groupedItems
        const category = typeToCategory[newItem.item.type] || 'Diverse';
        if (this.groupedItems[category]) {
          this.groupedItems[category].push(newItem);
        }

        return newItem;
      } catch (err) {
        this.error = err.message || "Kunne ikke legge til artikkel i lageret.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateStorageItem(storageItemId, updatedData) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await StorageService.updateStorageItem(storageItemId, updatedData);
        const updatedItem = response.data;

        // Find the item to update
        const index = this.storageItems.findIndex(item => item.id === storageItemId);
        if (index !== -1) {
          this.storageItems[index] = updatedItem;
        }

        // Update in grouped items
        this.groupItemsByCategory();

        // Update currentItem if it's the same item
        if (this.currentItem && this.currentItem.id === storageItemId) {
          this.currentItem = updatedItem;
        }

        return updatedItem;
      } catch (err) {
        this.error = err.message || `Kunne ikke oppdatere lagervaren med ID ${storageItemId}.`;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async removeItemFromStorage(storageItemId) {
      this.isLoading = true;
      this.error = null;

      try {
        await StorageService.removeItemFromStorage(storageItemId);

        // Remove from storageItems array
        this.storageItems = this.storageItems.filter(item => item.id !== storageItemId);

        // Update grouped items
        this.groupItemsByCategory();

        // Clear currentItem if it's the deleted item
        if (this.currentItem && this.currentItem.id === storageItemId) {
          this.currentItem = null;
        }

        return true;
      } catch (err) {
        this.error = err.message || `Kunne ikke slette lagervaren med ID ${storageItemId}.`;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // Helper method to group items by category
    groupItemsByCategory() {
      // Initialize empty categories
      const grouped = {
        Væske: [],
        Mat: [],
        Medisiner: [],
        Diverse: []
      };

      // Group items by their type
      this.storageItems.forEach(item => {
        const category = typeToCategory[item.item.type] || 'Diverse';
        if (grouped[category]) {
          grouped[category].push(item);
        } else {
          // For any items with unknown categories, put in Diverse
          grouped.Diverse.push(item);
        }
      });

      this.groupedItems = grouped;
    },

    // Reset the store state
    resetState() {
      this.householdId = null;
      this.storageItems = [];
      this.groupedItems = {
        Væske: [],
        Mat: [],
        Medisiner: [],
        Diverse: []
      };
      this.currentItem = null;
      this.isLoading = false;
      this.error = null;
    }
  }
});
