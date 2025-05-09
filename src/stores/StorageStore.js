import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import StorageService from '@/service/storageService';
import { ItemType } from '@/types/ItemType';

/**
 * Helper function to format a date string to 'DD.MM.YYYY' format.
 * If input is 'N/A', it is returned as is.
 *
 * @param {string} dateString The input date string.
 * @returns {string} The formatted date string or 'N/A'.
 */
function formatDate(dateString) {
  if (!dateString || dateString === 'N/A') return 'N/A';

  try {
    let date;

    const parts = dateString.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
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

/**
 * Store for managing household storage items.
 */
export const useStorageStore = defineStore('storage', () => {
  /** @type {import('vue').Ref<Array<Object>>} */
  const items = ref([]);

  /** @type {import('vue').Ref<boolean>} */
  const isLoading = ref(false);

  /** @type {import('vue').Ref<string|null>} */
  const error = ref(null);

  /** @type {import('vue').Ref<string|null>} */
  const currentHouseholdId = ref(null);

  /**
   * Indicates if the storage list is empty.
   * @type {import('vue').ComputedRef<boolean>}
   */
  const isEmpty = computed(() => items.value.length === 0);

  /**
   * Groups items by category (itemType) for UI display.
   * @type {import('vue').ComputedRef<Object<string, Array<Object>>>}
   */
  const groupedItems = computed(() => {
    const groups = {
      'Væske': [],
      'Mat': [],
      'Medisiner': [],
      'Redskap': [],
      'Diverse': []
    };

    if (Array.isArray(items.value)) {
      items.value.forEach(item => {
        if (!item || !item.item || !item.item.itemType) {
          console.warn('Skipping invalid item:', item);
          return;
        }


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

  /**
   * Sets the current household ID for storage operations.
   * @param {string} id - Household ID.
   */
  function setCurrentHouseholdId(id) {
    currentHouseholdId.value = id;
  }

  /**
   * Fetches all items for the current household.
   * @returns {Promise<Array<Object>>} A promise resolving to the item list.
   */
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

          }
          return item;
        });
      } else {
        items.value = Array.isArray(response) ? response : [];
      }

      return items.value;
    } catch (err) {
      error.value = err.message || 'Failed to fetch items';
      items.value = [];
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Filters items by item type.
   * @param {ItemType} itemType  The item type to filter by.
   * @returns {Array<Object>} Filtered items.
   */
  function getItemsByType(itemType) {
    if (!itemType) return items.value;

    return items.value.filter(item => item.item && item.item.itemType === itemType);
  }

  /**
   * Fetches items by type (same as getItemsByType).
   * @param {ItemType} itemType  The item type to fetch.
   * @returns {Array<Object>} Filtered items.
   */
  function fetchItemsByType(itemType) {
    return getItemsByType(itemType);
  }

   /**
   * Fetches items expiring before a given date.
   * @param {string} beforeDate  Date string in ISO format.
   * @returns {Promise<Array<Object>>} Expiring items.
   */
  async function fetchExpiringItems(beforeDate) {
    if (!currentHouseholdId.value) {
      return [];
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await StorageService.getExpiringItems(beforeDate);
      return response;
    } catch (err) {
      console.error('Error fetching expiring items:', err);
      error.value = err.message || 'Failed to fetch expiring items';
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Adds a new item to storage.
   * @param {string} itemId  ID of the item.
   * @param {Object} data  Item details.
   * @returns {Promise<Object|null>} The response from API or null on failure.
   */
  async function addItem(itemId, data) {
    if (!currentHouseholdId.value) {
      console.error('No household ID set');
      return null;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await StorageService.addItemToStorage(itemId, data);

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

  /**
   * Updates an item in storage.
   * @param {string|Object} itemId  ID of the item or item object with `id`.
   * @param {Object} data Updated item data.
   * @returns {Promise<Object>} Response from API.
   */
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


      const itemIndex = items.value.findIndex(i => i.id === actualItemId);

      if (itemIndex === -1) {
        console.error("Item not found in items array. Available IDs:",
          items.value.map(item => item.id));
        throw new Error('Item not found');
      }


      const originalItem = items.value[itemIndex];


      const originalExpiration = originalItem.item.expiration;


      let formattedExpirationDate = null;

      if (data.expiryDate) {

        if (data.expiryDate.includes('T')) {
          formattedExpirationDate = data.expiryDate;
        } else {

          const [day, month, year] = data.expiryDate.split('.');
          if (day && month && year) {

            formattedExpirationDate = `${year}-${month}-${day}T00:00:00`;
          }
        }
      }

      const payload = {
        unit: originalItem.unit,
        amount: data.quantity || originalItem.amount,
        expirationDate: formattedExpirationDate
      };

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

  /**
   * Deletes an item from storage.
   * @param {string} itemId  ID of the item to delete.
   * @returns {Promise<Object>} Response from API.
   */
  async function deleteItem(itemId) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await StorageService.removeItemFromStorage(itemId);

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
