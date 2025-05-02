import { defineStore } from 'pinia';
import { ref,  computed } from 'vue';
import ItemService from '@/service/ItemService';
import { ItemType } from '@/types/ItemType';

export const useItemStore = defineStore('item', () => {
  const items = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchItems() {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await ItemService.getAllItems();

      // Log the raw response
      console.log("Raw response from ItemService.getAllItems:", response);

      // Ensure we have an array, even if empty
      items.value = Array.isArray(response) ? response : [];

      console.log("Items array in store after fetch:", items.value);
      return items.value;
    } catch (err) {
      console.error("Error fetching items:", err);
      error.value = err.message || 'Failed to load items';
      items.value = [];
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchItemsByType(type) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await ItemService.getItemsByType(type);
      console.log(`Fetched items by type ${type}:`, response);
      return response || [];
    } catch (err) {
      console.error(`Error fetching items by type ${type}:`, err);
      error.value = err.message || `Failed to load ${type} items`;
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  // Filter items by category (client-side)
  function getItemsByCategory(category) {
    console.log("Getting items by category:", category);
    console.log("Current items in store:", items.value);

    const categoryMapping = {
      'Væske': 'LIQUIDS',
      'Mat': 'FOOD',
      'Medisiner': 'FIRST_AID',
      'Redskap': 'TOOL',
      'Diverse': 'OTHER'
    };

    const itemType = categoryMapping[category];
    if (!itemType) {
      console.log("No matching item type for category:", category);
      return [];
    }

    console.log("Looking for item type:", itemType);

    const filteredItems = items.value.filter(item => {
      console.log("Checking item:", item.name, "Type:", item.itemType);
      return item.itemType === itemType;
    });

    console.log("Filtered items:", filteredItems);
    return filteredItems;
  }

  return {
    items,
    isLoading,
    error,
    fetchItems,
    fetchItemsByType,
    getItemsByCategory
  };
});
