// storageStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import StorageService from '@/service/StorageService';
import { ItemType } from '@/types/ItemType';

// Helper function to format date for backend in ISO string format with time component
function formatDateForBackend(dateString) {
  if (!dateString) return null;

  // Create a Date object from the date string (which is YYYY-MM-DD)
  const date = new Date(dateString);

  // Format as ISO string that LocalDateTime.parse can handle
  // Format: YYYY-MM-DDT00:00:00
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}T00:00:00`;
}

export const useStorageStore = defineStore('storage', () => {
  const items = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // Store the current household ID
  const currentHouseholdId = ref(null);

  // Computed property to check if items array is empty
  const isEmpty = computed(() => items.value.length === 0);

  // Group items by category for UI display
  const groupedItems = computed(() => {
    const groups = {
      'Væske': [],      // Liquids
      'Mat': [],        // Food
      'Medisiner': [],  // Medicine
      'Diverse': []     // Miscellaneous/Other
    };

    // Make sure items.value is an array before calling forEach
    if (Array.isArray(items.value)) {
      items.value.forEach(item => {
        if (!item || !item.item || !item.item.itemType) {
          // Skip invalid items
          console.warn('Skipping invalid item:', item);
          return;
        }

        // Create a transformed item with structure expected by components
        // Make sure id is set properly
        const transformedItem = {
          id: item.id,
          name: item.item.name,
          expiryDate: item.expiration ? new Date(item.expiration).toISOString().split('T')[0] : null,
          quantity: item.amount,
          unit: item.unit,
          duration: null, // Calculate if needed
          itemType: item.item.itemType
        };

        switch(item.item.itemType) {
          case "LIQUIDS":
          case "WATER":
            groups['Væske'].push(transformedItem);
            break;
          case "FOOD":
            groups['Mat'].push(transformedItem);
            break;
          case "MEDICINE":
          case "FIRST_AID":
            groups['Medisiner'].push(transformedItem);
            break;
          case "TOOL":
          case "OTHER":
          default:
            groups['Diverse'].push(transformedItem);
            break;
        }
      });
    } else {
      console.warn('items.value is not an array:', items.value);
    }

    return groups;
  });

  // Set current household ID
  function setCurrentHouseholdId(id) {
    currentHouseholdId.value = id;
  }

  // Fetch all items for the household
  async function fetchItems() {
    if (!currentHouseholdId.value) {
      console.error('No household ID set');
      return [];
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await StorageService.getStorageItemsByHousehold(currentHouseholdId.value);

      console.log("Storage response:", response);

      // Ensure we're setting items.value to an array
      if (response && Array.isArray(response)) {
        // Make sure each item has an 'id' property
        items.value = response.map(item => {
          if (!item.id && item.itemId) {
            // If there's no id but itemId exists, use that
            return { ...item, id: item.itemId };
          } else if (!item.id) {
            // If there's no id at all, log a warning
            console.warn('Item missing ID:', item);
          }
          return item;
        });
      } else {
        console.warn('Response is not an array:', response);
        items.value = Array.isArray(response) ? response : [];
      }

      return items.value;
    } catch (err) {
      console.error('Error fetching storage items:', err);
      error.value = err.message || 'Failed to fetch items';
      items.value = []; // Ensure items is always an array even on error
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  // Filter items by type (client-side filtering)
  function getItemsByType(itemType) {
    if (!itemType) return items.value;

    return items.value.filter(item => item.item && item.item.itemType === itemType);
  }

  // Fetch items by type - a convenience method that matches what your component was using
  function fetchItemsByType(itemType) {
    return getItemsByType(itemType);
  }

  // Get items expiring soon
  async function fetchExpiringItems(beforeDate) {
    if (!currentHouseholdId.value) {
      console.error('No household ID set');
      return [];
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await StorageService.getExpiringItems(currentHouseholdId.value, beforeDate);
      return response;
    } catch (err) {
      console.error('Error fetching expiring items:', err);
      error.value = err.message || 'Failed to fetch expiring items';
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  // Add item
  async function addItem(itemId, data) {
    if (!currentHouseholdId.value) {
      console.error('No household ID set');
      return null;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await StorageService.addItemToStorage(currentHouseholdId.value, itemId, data);
      // Refresh the items list after adding
      await fetchItems();
      return response;
    } catch (err) {
      console.error('Error adding storage item:', err);
      error.value = err.message || 'Failed to add item';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Update item - fixed to handle id parameter properly
  // Update item - fixed to handle id parameter properly
  // Update item - fixed to handle id parameter properly
  async function updateItem(itemId, data) {
    isLoading.value = true;
    error.value = null;

    try {
      console.log("Updating item with ID:", itemId);
      console.log("Current items:", items.value);
      console.log("Update data:", data);

      let actualItemId;

      if (typeof itemId === 'object' && itemId !== null) {
        console.warn("Received object instead of ID. Extracting ID from object.");
        actualItemId = itemId.id;

        if (!actualItemId) {
          throw new Error('Invalid item ID: ID not found in object');
        }
      } else {
        actualItemId = itemId;
      }

      // Find item by ID
      const itemIndex = items.value.findIndex(i => i.id === actualItemId);
      console.log("Found item at index:", itemIndex);

      if (itemIndex === -1) {
        console.error("Item not found in items array. Available IDs:",
          items.value.map(item => item.id));
        throw new Error('Item not found');
      }

      // Get the original item
      const originalItem = items.value[itemIndex];

      // Create payload in the format expected by the API
      const payload = {
        unit: originalItem.unit,
        amount: data.quantity || originalItem.amount,
        expirationDate: data.expiryDate ? new Date(data.expiryDate) : null
      };

      console.log("Sending payload to API:", payload);

      if (data.name && data.name !== originalItem.item.name) {
        console.warn('Name updates are not supported by the backend API');
      }

      const response = await StorageService.updateStorageItem(actualItemId, payload);
      await fetchItems();

      return response;
    } catch (err) {
      console.error('Error updating storage item:', err);
      error.value = err.message || 'Failed to update item';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Delete item
  async function deleteItem(storageItemId) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await StorageService.removeItemFromStorage(storageItemId);
      // Remove the item from the local array
      items.value = items.value.filter(i => i.id !== storageItemId);
      return response;
    } catch (err) {
      console.error('Error deleting storage item:', err);
      error.value = err.message || 'Failed to delete item';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    items,
    isLoading,
    error,
    isEmpty,
    groupedItems,
    currentHouseholdId,
    setCurrentHouseholdId,
    fetchItems,
    getItemsByType,
    fetchItemsByType,
    fetchExpiringItems,
    addItem,
    updateItem,
    deleteItem
  };
});
