import { defineStore } from 'pinia';
import { ref } from 'vue';
import ItemService from '@/service/ItemService';

export const useItemStore = defineStore('item', () => {
  const items = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchItems() {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await ItemService.getAllItems();
      items.value = response || [];
    } catch (err) {
      error.value = err.message || 'Failed to load items';
      items.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  return {
    items,
    isLoading,
    error,
    fetchItems,
  };
});
