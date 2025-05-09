import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockMethods = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn()
};

vi.mock('@/service/baseService', () => {
  return {
    default: class BaseService {
      constructor() {
      }

      get(...args) {
        return mockMethods.get(...args);
      }

      post(...args) {
        return mockMethods.post(...args);
      }

      put(...args) {
        return mockMethods.put(...args);
      }
    }
  };
});

import StorageService from '@/service/storageService';

describe('StorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStorageItemsByHousehold', () => {
    it('should call get with the correct path and return the response', async () => {
      const mockResponse = [{ id: 1, name: 'Apple' }, { id: 2, name: 'Banana' }];
      mockMethods.get.mockResolvedValue(mockResponse);

      const result = await StorageService.getStorageItemsByHousehold();

      expect(mockMethods.get).toHaveBeenCalledWith(`household`);
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if the API call fails', async () => {
      const mockError = new Error('API Error');
      mockMethods.get.mockRejectedValue(mockError);

      await expect(StorageService.getStorageItemsByHousehold()).rejects.toThrow(mockError);
      expect(mockMethods.get).toHaveBeenCalledWith(`household`);
    });
  });

  describe('getStorageItemsByType', () => {
    it('should call get with the correct path and return the response', async () => {
      const mockResponse = [{ id: 1, name: 'Apple', type: 'fruit' }];
      mockMethods.get.mockResolvedValue(mockResponse);
      const itemType = 'fruit';

      const result = await StorageService.getStorageItemsByType(itemType);


      expect(mockMethods.get).toHaveBeenCalledWith(`household/type/${itemType}`);
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if the API call fails', async () => {
      const mockError = new Error('API Error');
      mockMethods.get.mockRejectedValue(mockError);
      const itemType = 'fruit';

      await expect(StorageService.getStorageItemsByType(itemType)).rejects.toThrow(mockError);
      expect(mockMethods.get).toHaveBeenCalledWith(`household/type/${itemType}`);
    });
  });

  describe('getExpiringItems', () => {
    it('should call get with the correct path including formatted date', async () => {
      const mockResponse = [{ id: 1, name: 'Milk', expirationDate: '2023-06-01' }];
      mockMethods.get.mockResolvedValue(mockResponse);
      const beforeDate = new Date('2023-06-01');
      const expectedFormattedDate = beforeDate.toISOString();

      const result = await StorageService.getExpiringItems(beforeDate);

      expect(mockMethods.get).toHaveBeenCalledWith(
        `household/expiring?before=${expectedFormattedDate}`
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if the API call fails', async () => {
      const mockError = new Error('API Error');
      mockMethods.get.mockRejectedValue(mockError);
      const beforeDate = new Date('2023-06-01');

      await expect(StorageService.getExpiringItems(beforeDate)).rejects.toThrow(mockError);
    });
  });

  describe('addItemToStorage', () => {
    it('should format expiration date correctly and call post with proper payload', async () => {
      const mockResponse = { id: 1, status: 'success' };
      mockMethods.post.mockResolvedValue(mockResponse);
      const itemId = '456';
      const data = {
        unit: 'kg',
        amount: 2,
        expirationDate: '2023-06-01'
      };

      const expectedPayload = {
        unit: 'kg',
        amount: 2,
        expirationDate: '2023-06-01T00:00:00'
      };

      const result = await StorageService.addItemToStorage(itemId, data);

      expect(mockMethods.post).toHaveBeenCalledWith(
        `household/item/${itemId}`,
        expectedPayload
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle null expiration date', async () => {
      const mockResponse = { id: 1, status: 'success' };
      mockMethods.post.mockResolvedValue(mockResponse);
      const itemId = '456';
      const data = {
        unit: 'kg',
        amount: 2,
        expirationDate: null
      };

      const expectedPayload = {
        unit: 'kg',
        amount: 2,
        expirationDate: null
      };

      const result = await StorageService.addItemToStorage(itemId, data);

      expect(mockMethods.post).toHaveBeenCalledWith(
        `household/item/${itemId}`,
        expectedPayload
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if the API call fails', async () => {
      const mockError = new Error('API Error');
      mockMethods.post.mockRejectedValue(mockError);
      const itemId = '456';
      const data = {
        unit: 'kg',
        amount: 2,
        expirationDate: '2023-06-01'
      };

      await expect(StorageService.addItemToStorage(itemId, data)).rejects.toThrow(mockError);
    });
  });

  describe('removeItemFromStorage', () => {
    it('should call post with the correct storageItemId', async () => {
      const mockResponse = { status: 'success' };
      mockMethods.post.mockResolvedValue(mockResponse);
      const storageItemId = '789';

      const result = await StorageService.removeItemFromStorage(storageItemId);

      expect(mockMethods.post).toHaveBeenCalledWith(`${storageItemId}`);
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if the API call fails', async () => {
      const mockError = new Error('API Error');
      mockMethods.post.mockRejectedValue(mockError);
      const storageItemId = '789';

      await expect(StorageService.removeItemFromStorage(storageItemId)).rejects.toThrow(mockError);
    });
  });

  describe('updateStorageItem', () => {
    it('should call put with the correct storageItemId and payload', async () => {
      const mockResponse = { status: 'success' };
      mockMethods.put.mockResolvedValue(mockResponse);
      const storageItemId = '789';
      const data = {
        unit: 'l',
        amount: 1.5,
        expirationDate: '2023-07-15'
      };

      const result = await StorageService.updateStorageItem(storageItemId, data);

      expect(mockMethods.put).toHaveBeenCalledWith(`${storageItemId}`, data);
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if the API call fails', async () => {
      const mockError = new Error('API Error');
      mockMethods.put.mockRejectedValue(mockError);
      const storageItemId = '789';
      const data = {
        unit: 'l',
        amount: 1.5,
        expirationDate: '2023-07-15'
      };

      await expect(StorageService.updateStorageItem(storageItemId, data)).rejects.toThrow(mockError);
    });
  });
});
