import { defineStore } from 'pinia';
import ItemService from '@/service/itemService';

export const useItemStore = defineStore('item', {
  state: () => ({
    items: [],
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
      return state.items.find(item => item.id === id);
    },

    itemsByCategory: (state) => (category) => {
      return state.items.filter(item => item.category === category);
    },

    isEmpty: (state) => {
      return state.items.length === 0;
    }
  },

  actions: {
    async fetchAllItems() {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await ItemService.getAllItems();
        this.items = response.data;
        this.groupItemsByCategory();
        return this.items;
      } catch (err) {
        this.error = err.message || "Kunne ikke hente lagringsartikler.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchItemsByCategory(category) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await ItemService.getItemsByCategory(category);
        // Update only the specified category in groupedItems
        this.groupedItems[category] = response.data;

        // Update the main items array as well
        const itemsInOtherCategories = this.items.filter(item => item.category !== category);
        this.items = [...itemsInOtherCategories, ...response.data];

        return response.data;
      } catch (err) {
        this.error = err.message || `Kunne ikke hente ${category} artikler.`;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchItemById(id) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await ItemService.getItemById(id);
        this.currentItem = response.data;

        // Update item in the main array if it exists
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
          this.items[index] = response.data;
        } else {
          this.items.push(response.data);
        }

        // Update item in the grouped items
        const category = response.data.category;
        if (category && this.groupedItems[category]) {
          const catIndex = this.groupedItems[category].findIndex(item => item.id === id);
          if (catIndex !== -1) {
            this.groupedItems[category][catIndex] = response.data;
          } else {
            this.groupedItems[category].push(response.data);
          }
        }

        return response.data;
      } catch (err) {
        this.error = err.message || `Kunne ikke hente artikkelen med ID ${id}.`;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async createItem(item) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await ItemService.createItem(item);
        const newItem = response.data;

        // Add to items array
        this.items.push(newItem);

        // Add to appropriate category in groupedItems
        if (newItem.category && this.groupedItems[newItem.category]) {
          this.groupedItems[newItem.category].push(newItem);
        }

        return newItem;
      } catch (err) {
        this.error = err.message || "Kunne ikke opprette ny artikkel.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateItem(id, updatedData) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await ItemService.updateItem(id, updatedData);
        const updatedItem = response.data;

        // Update in items array
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
          this.items[index] = updatedItem;
        }

        // Handle category change
        const oldItem = this.items.find(item => item.id === id);
        const oldCategory = oldItem?.category;
        const newCategory = updatedItem.category;

        if (oldCategory && oldCategory !== newCategory) {
          // Remove from old category
          if (this.groupedItems[oldCategory]) {
            this.groupedItems[oldCategory] = this.groupedItems[oldCategory].filter(item => item.id !== id);
          }
        }

        // Update or add to new category
        if (newCategory && this.groupedItems[newCategory]) {
          const catIndex = this.groupedItems[newCategory].findIndex(item => item.id === id);
          if (catIndex !== -1) {
            this.groupedItems[newCategory][catIndex] = updatedItem;
          } else {
            this.groupedItems[newCategory].push(updatedItem);
          }
        }

        // Update currentItem if it's the same item
        if (this.currentItem && this.currentItem.id === id) {
          this.currentItem = updatedItem;
        }

        return updatedItem;
      } catch (err) {
        this.error = err.message || `Kunne ikke oppdatere artikkelen med ID ${id}.`;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteItem(id) {
      this.isLoading = true;
      this.error = null;

      try {
        await ItemService.deleteItem(id);

        // Find category of the item before removing it
        const item = this.items.find(item => item.id === id);
        const category = item?.category;

        // Remove from items array
        this.items = this.items.filter(item => item.id !== id);

        // Remove from grouped items
        if (category && this.groupedItems[category]) {
          this.groupedItems[category] = this.groupedItems[category].filter(item => item.id !== id);
        }

        // Clear currentItem if it's the deleted item
        if (this.currentItem && this.currentItem.id === id) {
          this.currentItem = null;
        }

        return true;
      } catch (err) {
        this.error = err.message || `Kunne ikke slette artikkelen med ID ${id}.`;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async searchItems(query) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await ItemService.searchItems(query);
        return response.data;
      } catch (err) {
        this.error = err.message || "Søket mislyktes.";
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

      // Group items by their category
      this.items.forEach(item => {
        const category = item.category;
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
      this.items = [];
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
