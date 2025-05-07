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

import RequestService from '@/service/requestService';

describe('RequestService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sendInvitation posts invitation data', async () => {
    const data = { email: 'test@example.com', householdId: 'h1' };
    mockMethods.post.mockResolvedValue({ success: true });

    const result = await RequestService.sendInvitation(data);
    expect(mockMethods.post).toHaveBeenCalledWith('send-invitation', data);
    expect(result.success).toBe(true);
  });

  describe('getSentInvitationsByHousehold', () => {
    it('returns array if response is array', async () => {
      const response = [{ id: 1 }];
      mockMethods.post.mockResolvedValue(response);

      const result = await RequestService.getSentInvitationsByHousehold('h1');
      expect(result).toEqual(response);
    });

    it('returns response.data if response has data field', async () => {
      const response = { data: [{ id: 2 }] };
      mockMethods.post.mockResolvedValue(response);

      const result = await RequestService.getSentInvitationsByHousehold('h1');
      expect(result).toEqual(response.data);
    });

    it('returns empty array if response is invalid', async () => {
      mockMethods.post.mockResolvedValue('unexpected');
      const result = await RequestService.getSentInvitationsByHousehold('h1');
      expect(result).toEqual([]);
    });

    it('throws error if request fails', async () => {
      const error = new Error('fail');
      mockMethods.post.mockRejectedValue(error);
      await expect(RequestService.getSentInvitationsByHousehold('h1')).rejects.toThrow('fail');
    });
  });

  describe('getReceivedJoinRequests', () => {
    it('returns join request data', async () => {
      const mockData = [{ id: 123 }];
      mockMethods.post.mockResolvedValue(mockData);

      const result = await RequestService.getReceivedJoinRequests('h1');
      expect(mockMethods.post).toHaveBeenCalledWith('join-requests/received', { householdId: 'h1' });
      expect(result).toEqual(mockData);
    });

    it('handles error with response data', async () => {
      const error = {
        response: {
          data: 'some data',
          status: 400,
          headers: {}
        }
      };
      mockMethods.post.mockRejectedValue(error);
      await expect(RequestService.getReceivedJoinRequests('h1')).rejects.toThrow();
    });

    it('handles error with request object', async () => {
      const error = { request: 'request info' };
      mockMethods.post.mockRejectedValue(error);
      await expect(RequestService.getReceivedJoinRequests('h1')).rejects.toThrow();
    });

    it('handles error with message', async () => {
      const error = { message: 'something went wrong' };
      mockMethods.post.mockRejectedValue(error);
      await expect(RequestService.getReceivedJoinRequests('h1')).rejects.toThrow();
    });
  });

  describe('getReceivedInvitationsByUser', () => {
    it('returns array if response is array', async () => {
      const response = [{ id: 1 }];
      mockMethods.post.mockResolvedValue(response);

      const result = await RequestService.getReceivedInvitationsByUser('user1');
      expect(result).toEqual(response);
    });

    it('returns response.data if response has data field', async () => {
      const response = { data: [{ id: 2 }] };
      mockMethods.post.mockResolvedValue(response);

      const result = await RequestService.getReceivedInvitationsByUser('user1');
      expect(result).toEqual(response.data);
    });

    it('returns empty array if response is invalid', async () => {
      mockMethods.post.mockResolvedValue('something unexpected');
      const result = await RequestService.getReceivedInvitationsByUser('user1');
      expect(result).toEqual([]);
    });

    it('throws error if request fails', async () => {
      const error = new Error('fail');
      mockMethods.post.mockRejectedValue(error);
      await expect(RequestService.getReceivedInvitationsByUser('user1')).rejects.toThrow('fail');
    });
  });

  it('sendJoinRequest posts request data', async () => {
    const data = { userId: 'u1', householdId: 'h1' };
    mockMethods.post.mockResolvedValue({ sent: true });

    const result = await RequestService.sendJoinRequest(data);
    expect(mockMethods.post).toHaveBeenCalledWith('send-join-request', data);
    expect(result.sent).toBe(true);
  });
  
  it('acceptJoinRequest posts with requestId', async () => {
    mockMethods.post.mockResolvedValue({ accepted: true });
    const result = await RequestService.acceptJoinRequest('req123');
  
    expect(mockMethods.post).toHaveBeenCalledWith('accept-join-request', { requestId: 'req123' });
    expect(result.accepted).toBe(true);
  });
  it('acceptInvitationRequest posts with requestId', async () => {
    mockMethods.post.mockResolvedValue({ accepted: true });
    const result = await RequestService.acceptInvitationRequest('req456');
  
    expect(mockMethods.post).toHaveBeenCalledWith('accept-invitation-request', { requestId: 'req456' });
    expect(result.accepted).toBe(true);
  });
  it('declineJoinRequest throws on error', async () => {
    const error = new Error('decline error');
    mockMethods.post.mockRejectedValue(error);
  
    await expect(RequestService.declineJoinRequest('req789')).rejects.toThrow('decline error');
  });
  it('declineJoinRequest posts with requestId', async () => {
    mockMethods.post.mockResolvedValue({ declined: true });
    const result = await RequestService.declineJoinRequest('req456');

    expect(mockMethods.post).toHaveBeenCalledWith('decline', { requestId: 'req456' });
    expect(result.declined).toBe(true);
  });  
});
