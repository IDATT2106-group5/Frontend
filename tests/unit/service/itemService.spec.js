import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/service/baseService', () => {
  return {
    default: class {
      constructor() {
        this.get = vi.fn()
      }
    }
  }
})

import ItemService from '@/service/itemService.js'

describe('ItemService', () => {
  let service

  beforeEach(() => {
    service = new ItemService.constructor()
  })

  describe('getPaginatedItems', () => {
    it('returns fallback when response is falsy', async () => {
      service.get.mockResolvedValueOnce(null)
      const result = await service.getPaginatedItems()
      expect(result).toEqual({ content: [], isEmpty: true })
    })

    it('returns fallback when response is empty array', async () => {
      service.get.mockResolvedValueOnce([])
      const result = await service.getPaginatedItems()
      expect(result).toEqual({ content: [], isEmpty: true })
    })

    it('returns fallback when response.content is empty array', async () => {
      service.get.mockResolvedValueOnce({ content: [] })
      const result = await service.getPaginatedItems()
      expect(result).toEqual({ content: [], isEmpty: true })
    })

    it('returns response when content exists', async () => {
      const data = { content: [{ id: 1 }], totalPages: 1 }
      service.get.mockResolvedValueOnce(data)
      const result = await service.getPaginatedItems()
      expect(result).toEqual(data)
    })

    it('includes search term in query when provided', async () => {
      const data = { content: [{ id: 1 }] }
      service.get.mockResolvedValueOnce(data)
      await service.getPaginatedItems(1, 5, 'apple')
      expect(service.get).toHaveBeenCalledWith(expect.stringContaining('search=apple'))
    })

    it('returns fallback when get throws (search term case)', async () => {
      service.get.mockRejectedValueOnce(new Error('fail'))
      const result = await service.getPaginatedItems(0, 5, 'query')
      expect(result).toEqual({ content: [], isEmpty: true })
    })

    it('returns response if content is not an array', async () => {
      const data = { content: 'not-an-array' }
      service.get.mockResolvedValueOnce(data)
      const result = await service.getPaginatedItems()
      expect(result).toEqual(data)
    })
  })

  describe('getAllItems', () => {
    it('returns items when request succeeds', async () => {
      const mockData = [{ id: 1 }, { id: 2 }]
      service.get.mockResolvedValueOnce(mockData)
      const result = await service.getAllItems()
      expect(result).toEqual(mockData)
    })

    it('throws error when getAllItems fails', async () => {
      const err = new Error('fail')
      service.get.mockRejectedValueOnce(err)
      await expect(service.getAllItems()).rejects.toThrow('fail')
    })
  })

  describe('getItemsByType', () => {
    it('returns items of given type', async () => {
      const mockItems = [{ id: 1 }]
      service.get.mockResolvedValueOnce(mockItems)
      const result = await service.getItemsByType('food')
      expect(service.get).toHaveBeenCalledWith('/type/food')
      expect(result).toEqual(mockItems)
    })

    it('throws error when getItemsByType fails', async () => {
      const err = new Error('fail')
      service.get.mockRejectedValueOnce(err)
      await expect(service.getItemsByType('tools')).rejects.toThrow('fail')
    })
  })

  describe('getItemById', () => {
    it('returns item for given id', async () => {
      const mockItem = { id: 1 }
      service.get.mockResolvedValueOnce(mockItem)
      const result = await service.getItemById(1)
      expect(service.get).toHaveBeenCalledWith('/1')
      expect(result).toEqual(mockItem)
    })

    it('throws error when getItemById fails', async () => {
      const err = new Error('fail')
      service.get.mockRejectedValueOnce(err)
      await expect(service.getItemById(999)).rejects.toThrow('fail')
    })
  })
})