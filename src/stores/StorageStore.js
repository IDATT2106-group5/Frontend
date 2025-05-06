// storageStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import StorageService from '@/service/storageService';
import { ItemType } from '@/types/ItemType';

// Helper function to format date for backend in ISO string format with time component
function formatDate(dateString) {
  if (!dateString || dateString === 'N/A') return 'N/A';

  try {
    let date;

    const parts = dateString.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS
      const year = parseInt(parts[2], 10);
      date = new Date(year, month, day);
      date.setHours(12, 0, 0, 0);
    } else {
      date = new Date(dateString);
      date.setHours(12, 0, 0, 0);
    }

    if (isNaN(date.getTime())) {
      console.error('Invalid date in formatDate:', dateString);
      return dateString;
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString;
  }
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
      'Medisiner': [], // Medicine
      'Redskap': [],   // Tools
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
          expiryDate: formatDate(item.expiration),
          quantity: item.amount,
          unit: item.unit,
          caloricAmount: item.item.caloricAmount || 0,
          itemType: item.item.itemType
        };

        switch(item.item.itemType) {
          case "LIQUIDS":
            groups['Væske'].push(transformedItem);
            break;
          case "FOOD":
            groups['Mat'].push(transformedItem);
            break;
          case "FIRST_AID":
            groups['Medisiner'].push(transformedItem);
            break;
          case "TOOL":
            groups['Redskap'].push(transformedItem);
            break;
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

      if (response && Array.isArray(response)) {
        items.value = response.map(item => {
          if (!item.id && item.itemId) {
            return { ...item, id: item.itemId };
          } else if (!item.id) {
            // If there's no id at all, log a warning
            console.warn('Item missing ID:', item);
          }
          return item;
        });
      } else {
        items.value = Array.isArray(response) ? response : [];
      }

      return items.value;
    } catch (err) {
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
  async function updateItem(itemId, data) {
    isLoading.value = true;
    error.value = null;

    try {
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

      if (itemIndex === -1) {
        console.error("Item not found in items array. Available IDs:",
          items.value.map(item => item.id));
        throw new Error('Item not found');
      }

      // Get the original item
      const originalItem = items.value[itemIndex];

      // Store the original expiration date
      const originalExpiration = originalItem.item.expiration;

      console.log("Original item before update:", originalItem);
      console.log('Original expiration date: ', originalExpiration);

      // Format the date correctly for the backend
      let formattedExpirationDate = null;
      if (data.expiryDate) {
        // Parse the date from DD.MM.YYYY format
        const [day, month, year] = data.expiryDate.split('.');
        // Format to ISO string which is what LocalDateTime.parse expects
        formattedExpirationDate = `${year}-${month}-${day}T00:00:00`;
      }

      // Create payload in the format expected by the API
      const payload = {
        unit: originalItem.unit,
        amount: data.quantity || originalItem.amount,
        expirationDate: formattedExpirationDate
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
  async function deleteItem(itemId) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await StorageService.removeItemFromStorage(itemId);
      // Remove the item from the local array
      items.value = items.value.filter(i => i.id !== itemId);
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
