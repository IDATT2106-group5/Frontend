import { defineStore } from 'pinia'
import { ref } from 'vue'
import ItemService from '@/service/itemService'

/**
 * Pinia store for managing catalog items, including pagination, search, and category filtering.
 */
export const useItemStore = defineStore('item', () => {
  /** @type {import('vue').Ref<Array<Object>>} */
  const items = ref([])

  /** @type {import('vue').Ref<boolean>} */
  const isLoading = ref(false)

  /** @type {import('vue').Ref<string|null>} */
  const error = ref(null)

  /** @type {import('vue').Ref<number>} */
  const currentPage = ref(0)

  /** @type {import('vue').Ref<boolean>} */
  const hasMoreItems = ref(true)

  /** @type {import('vue').Ref<number>} */
  const pageSize = ref(15)

  /** @type {import('vue').Ref<string>} */
  const searchQuery = ref('')

   /**
   * Fetches paginated items from the backend. Resets pagination if specified.
   * @param {boolean} [reset=true] - Whether to reset the pagination state.
   * @returns {Promise<Array<Object>>} The list of fetched items.
   */
  async function fetchItems(reset = true) {
    if (reset) {
      currentPage.value = 0
      hasMoreItems.value = true
    }

    if (!hasMoreItems.value) return items.value

    isLoading.value = true
    error.value = null

    try {
      const response = await ItemService.getPaginatedItems(
        currentPage.value,
        pageSize.value,
        searchQuery.value,
      )

      if (response.isEmpty) {
        hasMoreItems.value = false
        return items.value
      }

      const responseItems = response.items || []

      if (reset) {
        items.value = responseItems
      } else {
        items.value = [...items.value, ...responseItems]
      }

      hasMoreItems.value = response.currentPage < response.totalPages

      if (!reset) {
        currentPage.value++
      }

      return items.value
    } catch (err) {
      console.error('Error fetching items:', err)
      error.value = err.message || 'Failed to load items'
      hasMoreItems.value = false
      return items.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Loads the next page of items if available.
   * @returns {Promise<Array<Object>>} The updated list of items.
   */
  async function loadMoreItems() {
    if (hasMoreItems.value && !isLoading.value) {
      currentPage.value++
      return fetchItems(false)
    }
    return items.value
  }

   /**
   * Searches items using a term and resets pagination.
   * @param {string} term - Search query.
   * @returns {Promise<Array<Object>>} The filtered list of items.
   */
  async function searchItems(term) {
    searchQuery.value = term
    return fetchItems(true)
  }

  /**
   * Fetches items by their type.
   * @param {string} type - The item type to fetch.
   * @returns {Promise<Array<Object>>} List of items of the specified type.
   */
  async function fetchItemsByType(type) {
    isLoading.value = true
    error.value = null

    try {
      const response = await ItemService.getItemsByType(type)
      return response || []
    } catch (err) {
      console.error(`Error fetching items by type ${type}:`, err)
      error.value = err.message || `Failed to load ${type} items`
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Filters currently loaded items by category name.
   * @param {string} category - UI label for the category.
   * @returns {Array<Object>} Filtered list of items.
   */
  function getItemsByCategory(category) {

    const categoryMapping = {
      Væske: 'LIQUIDS',
      Mat: 'FOOD',
      Medisiner: 'FIRST_AID',
      Redskap: 'TOOL',
      Diverse: 'OTHER',
    }

    const itemType = categoryMapping[category]
    if (!itemType) {
      return []
    }

    const filteredItems = items.value.filter((item) => {
      return item.itemType === itemType
    })

    return filteredItems
  }

  return {
    items,
    isLoading,
    error,
    hasMoreItems,
    fetchItems,
    loadMoreItems,
    searchItems,
    fetchItemsByType,
    getItemsByCategory,
  }
})
