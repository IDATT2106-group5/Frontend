import { defineStore } from 'pinia'
import { ref } from 'vue'
import ItemService from '@/service/itemService'

export const useItemStore = defineStore('item', () => {
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const currentPage = ref(0)
  const hasMoreItems = ref(true)
  const pageSize = ref(5)
  const searchQuery = ref('')

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

      hasMoreItems.value = response.currentPage < response.totalPages - 1

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

  async function loadMoreItems() {
    if (hasMoreItems.value && !isLoading.value) {
      currentPage.value++
      return fetchItems(false)
    }
    return items.value
  }

  async function searchItems(term) {
    searchQuery.value = term
    return fetchItems(true)
  }

  async function fetchItemsByType(type) {
    isLoading.value = true
    error.value = null

    try {
      const response = await ItemService.getItemsByType(type)
      console.log(`Fetched items by type ${type}:`, response)
      return response || []
    } catch (err) {
      console.error(`Error fetching items by type ${type}:`, err)
      error.value = err.message || `Failed to load ${type} items`
      return []
    } finally {
      isLoading.value = false
    }
  }

  function getItemsByCategory(category) {
    console.log('Getting items by category:', category)
    console.log('Current items in store:', items.value)

    const categoryMapping = {
      Væske: 'LIQUIDS',
      Mat: 'FOOD',
      Medisiner: 'FIRST_AID',
      Redskap: 'TOOL',
      Diverse: 'OTHER',
    }

    const itemType = categoryMapping[category]
    if (!itemType) {
      console.log('No matching item type for category:', category)
      return []
    }

    console.log('Looking for item type:', itemType)

    const filteredItems = items.value.filter((item) => {
      console.log('Checking item:', item.name, 'Type:', item.itemType)
      return item.itemType === itemType
    })

    console.log('Filtered items:', filteredItems)
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
