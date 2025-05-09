import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useItemStore } from '@/stores/ItemStore'
import ItemService from '@/service/itemService'

vi.mock('@/service/itemService', () => ({
  default: {
    getPaginatedItems: vi.fn(),
    getItemsByType: vi.fn(),
  }
}))

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('ItemStore', () => {
  let store

  beforeEach(() => {
    store = useItemStore()
  })

  it('fetchItems - resets state and loads items', async () => {
    ItemService.getPaginatedItems.mockResolvedValueOnce({
      items: [{ id: 1 }],
      currentPage: 0,
      totalPages: 2
    })

    const items = await store.fetchItems(true)
    expect(items).toEqual([{ id: 1 }])
    expect(store.items).toEqual([{ id: 1 }])
    expect(store.hasMoreItems).toBe(true)
  })

  it('fetchItems - handles empty response', async () => {
    ItemService.getPaginatedItems.mockResolvedValueOnce({ isEmpty: true })
    const result = await store.fetchItems(true)
    expect(result).toEqual([])
    expect(store.hasMoreItems).toBe(false)
  })

  it('fetchItems - appends to existing items when not resetting', async () => {
    store.items = [{ id: 1 }]
    ItemService.getPaginatedItems.mockResolvedValueOnce({
      items: [{ id: 2 }],
      currentPage: 0,
      totalPages: 2
    })
    const items = await store.fetchItems(false)
    expect(items).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('fetchItems - handles API error', async () => {
    ItemService.getPaginatedItems.mockRejectedValueOnce(new Error('fail'))
    const items = await store.fetchItems()
    expect(items).toEqual([])
    expect(store.error).toBe('fail')
    expect(store.hasMoreItems).toBe(false)
  })

  it('loadMoreItems - loads next page', async () => {
    store.hasMoreItems = true
    store.isLoading = false
    ItemService.getPaginatedItems.mockResolvedValueOnce({
      items: [{ id: 3 }],
      currentPage: 1,
      totalPages: 3
    })
    const result = await store.loadMoreItems()
    expect(result).toEqual([{ id: 3 }])
  })


  it('fetchItemsByType - returns items on success', async () => {
    ItemService.getItemsByType.mockResolvedValueOnce([{ id: 5 }])
    const result = await store.fetchItemsByType('TOOL')
    expect(result).toEqual([{ id: 5 }])
  })

  it('fetchItemsByType - returns empty array on failure', async () => {
    ItemService.getItemsByType.mockRejectedValueOnce(new Error('fail'))
    const result = await store.fetchItemsByType('FOOD')
    expect(result).toEqual([])
    expect(store.error).toBe('fail')
  })

  it('getItemsByCategory - filters correctly by category', () => {
    store.items = [
      { id: 1, name: 'Water', itemType: 'LIQUIDS' },
      { id: 2, name: 'Knife', itemType: 'TOOL' }
    ]
    const result = store.getItemsByCategory('Væske')
    expect(result).toEqual([{ id: 1, name: 'Water', itemType: 'LIQUIDS' }])
  })

  it('getItemsByCategory - returns empty array for unknown category', () => {
    store.items = [{ id: 1, itemType: 'FOOD' }]
    const result = store.getItemsByCategory('Nonexistent')
    expect(result).toEqual([])
  })
  it('searchItems - fetches items based on search term', async () => {
  ItemService.getPaginatedItems.mockResolvedValueOnce({
    items: [{ id: 9 }],
    currentPage: 0,
    totalPages: 1
  })

  const result = await store.searchItems('water')
  expect(result).toEqual([{ id: 9 }])
  expect(store.items).toEqual([{ id: 9 }])
  expect(ItemService.getPaginatedItems).toHaveBeenCalledWith(0, 15, 'water')
})
})
