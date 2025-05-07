import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockMethods = {
  post: vi.fn()
};

vi.mock('@/service/baseService', () => {
  return {
    default: class BaseService {
      constructor() {}
      post(...args) {
        return mockMethods.post(...args);
      }
    }
  };
});

import HouseholdService from '@/service/householdService';

describe('HouseholdService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getHouseholdDetailsByUserId', () => {
    it('should call post with userId', async () => {
      const mockResponse = { name: 'My Household' };
      mockMethods.post.mockResolvedValue(mockResponse);

      const result = await HouseholdService.getHouseholdDetailsByUserId('user1');
      expect(mockMethods.post).toHaveBeenCalledWith('details', { userId: 'user1' });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when userId is missing', async () => {
      await expect(HouseholdService.getHouseholdDetailsByUserId(null)).rejects.toThrow();
    });

    it('should suppress 400 error logs', async () => {
      const error = { response: { status: 400 } };
      mockMethods.post.mockRejectedValue(error);
      await expect(HouseholdService.getHouseholdDetailsByUserId('user')).rejects.toThrow();
    });
  });

  describe('addMember', () => {
    it('should call add-user and return registered member object', async () => {
      mockMethods.post.mockResolvedValue({});
      const data = { email: 'test@example.com', fullName: 'Test User' };

      const result = await HouseholdService.addMember('house123', data);
      expect(mockMethods.post).toHaveBeenCalledWith('add-user', {
        email: 'test@example.com',
        householdId: 'house123'
      });
      expect(result).toMatchObject({ fullName: 'Test User', email: 'test@example.com', isRegistered: true });
    });

    it('should call add-unregistered-member and return unregistered member object', async () => {
      mockMethods.post.mockResolvedValue({});
      const data = { fullName: 'Guest User' };

      const result = await HouseholdService.addMember('house123', data);
      expect(mockMethods.post).toHaveBeenCalledWith('add-unregistered-member', {
        fullName: 'Guest User',
        householdId: 'house123'
      });
      expect(result).toMatchObject({ fullName: 'Guest User', isRegistered: false });
    });
  });

  it('addUserToHousehold posts with userId and householdId', async () => {
    mockMethods.post.mockResolvedValue({ success: true });
    const result = await HouseholdService.addUserToHousehold('user1', 'house1');
    expect(mockMethods.post).toHaveBeenCalledWith('add-user', { userId: 'user1', householdId: 'house1' });
    expect(result.success).toBe(true);
  });

  it('updateHousehold sends name, address and householdId', async () => {
    mockMethods.post.mockResolvedValue({ success: true });
    const data = { householdId: 1, name: 'New Name', address: 'New Address' };
    const result = await HouseholdService.updateHousehold(data);
    expect(mockMethods.post).toHaveBeenCalledWith('edit', data);
    expect(result.success).toBe(true);
  });

  describe('updateUnregisteredMember', () => {
    it('should throw if member is registered', async () => {
      const data = { name: 'Test', isRegistered: true };
      await expect(HouseholdService.updateUnregisteredMember('h1', 'm1', data)).rejects.toThrow();
    });

    it('should call post if member is unregistered', async () => {
      mockMethods.post.mockResolvedValue({ success: true });
      const data = { name: 'Guest', isRegistered: false };
      const result = await HouseholdService.updateUnregisteredMember('h1', 'm1', data);
      expect(mockMethods.post).toHaveBeenCalledWith('edit-unregistered-member', {
        memberId: 'm1',
        newFullName: 'Guest',
        householdId: 'h1'
      });
      expect(result.success).toBe(true);
    });
  });

  it('removeRegisteredMember posts with userId and householdId', async () => {
    mockMethods.post.mockResolvedValue({ success: true });
    const result = await HouseholdService.removeRegisteredMember('u1', 'h1');
    expect(mockMethods.post).toHaveBeenCalledWith('remove-user', { userId: 'u1', householdId: 'h1' });
    expect(result.success).toBe(true);
  });

  it('removeUnregisteredMember posts with memberId', async () => {
    mockMethods.post.mockResolvedValue({ success: true });
    const result = await HouseholdService.removeUnregisteredMember('m1');
    expect(mockMethods.post).toHaveBeenCalledWith('delete-unregistered-member', { memberId: 'm1' });
    expect(result.success).toBe(true);
  });

  it('inviteMember posts with email and householdId', async () => {
    mockMethods.post.mockResolvedValue({ invited: true });
    const result = await HouseholdService.inviteMember('h1', 'invite@example.com');
    expect(mockMethods.post).toHaveBeenCalledWith('invite-user', {
      email: 'invite@example.com',
      householdId: 'h1'
    });
    expect(result.invited).toBe(true);
  });

  it('createHousehold returns new household object', async () => {
    mockMethods.post.mockResolvedValue({ id: 42 });
    const data = { name: 'New Home', address: '123 St', ownerId: 'u1' };
    const result = await HouseholdService.createHousehold(data);
    expect(mockMethods.post).toHaveBeenCalledWith('create', data);
    expect(result.id).toBe(42);
    expect(result.name).toBe('New Home');
  });

  it('deleteHousehold calls post with householdId and ownerId', async () => {
    mockMethods.post.mockResolvedValue({ deleted: true });
    const result = await HouseholdService.deleteHousehold('h1', 'owner1');
    expect(mockMethods.post).toHaveBeenCalledWith('delete', {
      householdId: 'h1',
      ownerId: 'owner1'
    });
    expect(result.deleted).toBe(true);
  });

  it('transferOwnership posts correct payload', async () => {
    mockMethods.post.mockResolvedValue({ changed: true });
    const result = await HouseholdService.transferOwnership('h1', 'u1');
    expect(mockMethods.post).toHaveBeenCalledWith('change-owner', {
      householdId: 'h1',
      userId: 'u1'
    });
    expect(result.changed).toBe(true);
  });

  it('leaveHousehold posts to leave', async () => {
    mockMethods.post.mockResolvedValue({ left: true });
    const result = await HouseholdService.leaveHousehold();
    expect(mockMethods.post).toHaveBeenCalledWith('leave');
    expect(result.left).toBe(true);
  });

  describe('searchHouseholdById', () => {
    it('should return null on invalid householdId', async () => {
      const result = await HouseholdService.searchHouseholdById({ householdId: 'abc' });
      expect(result).toBeNull(); 
    });
  
    it('should call post if ID is valid', async () => {
      mockMethods.post.mockResolvedValue({ id: 1, name: 'TestHouse' }); 
      const result = await HouseholdService.searchHouseholdById({ householdId: 123 });
      expect(mockMethods.post).toHaveBeenCalledWith('search', { householdId: 123 });
      expect(result.id).toBe(1);
    });
  });  
});
