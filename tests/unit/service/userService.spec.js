import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockMethods = {
  get: vi.fn(),
  post: vi.fn()
};

vi.mock('@/service/baseService', () => {
  return {
    default: class BaseService {
      constructor() {}
      get(...args) {
        return mockMethods.get(...args);
      }
      post(...args) {
        return mockMethods.post(...args);
      }
    }
  };
});

import UserService from '@/service/userService';

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentHouseholdByUserId', () => {
    it('should return data if request succeeds', async () => {
      const mockResponse = { id: 'household1', name: 'Home' };
      mockMethods.get.mockResolvedValue(mockResponse);

      const result = await UserService.getCurrentHouseholdByUserId('user123');

      expect(mockMethods.get).toHaveBeenCalledWith('me/household');
      expect(result).toEqual(mockResponse);
    });

    it('should throw if request fails', async () => {
      const mockError = new Error('Not found');
      mockMethods.get.mockRejectedValue(mockError);

      await expect(UserService.getCurrentHouseholdByUserId('user123')).rejects.toThrow('Not found');
    });
  });

  describe('checkEmail', () => {
    it('should return userId if email exists', async () => {
      mockMethods.post.mockResolvedValue({ userId: 'user456' });

      const result = await UserService.checkEmail('test@example.com');

      expect(mockMethods.post).toHaveBeenCalledWith('check-mail', { email: 'test@example.com' });
      expect(result).toBe('user456');
    });

    it('should throw if request fails', async () => {
      const mockError = new Error('Email check failed');
      mockMethods.post.mockRejectedValue(mockError);

      await expect(UserService.checkEmail('test@example.com')).rejects.toThrow('Email check failed');
    });
  });
});