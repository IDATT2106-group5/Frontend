import { describe, it, expect, vi, beforeEach } from 'vitest'
import authService from '@/service/authService.js'
import apiClient from '@/service/apiClient.js'

vi.mock('@/service/apiClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn()
  }
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AuthService', () => {
  describe('register', () => {
    it('calls API with correct endpoint and data', async () => {
      const userData = { email: 'test@example.com', password: 'password123', name: 'Test User' }
      const expectedResponse = { success: true, userId: '123' }

      apiClient.post.mockResolvedValueOnce({ data: expectedResponse })

      const result = await authService.register(userData)

      expect(apiClient.post).toHaveBeenCalledWith('auth/register', userData)
      expect(apiClient.post).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ data: expectedResponse })
    })

    it('handles API errors during registration', async () => {
      const userData = { email: 'test@example.com', password: 'password123' }
      const error = new Error('Registration failed')

      apiClient.post.mockRejectedValueOnce(error)

      await expect(authService.register(userData)).rejects.toThrow(error)
      expect(apiClient.post).toHaveBeenCalledWith('auth/register', userData)
      expect(apiClient.post).toHaveBeenCalledTimes(1)
    })
  })
})

describe('requestPasswordReset', () => {
  it('calls API with correct endpoint and email payload', async () => {
    const email = 'user@example.com';
    const expectedResponse = { message: 'Reset email sent' };

    apiClient.post.mockResolvedValueOnce({ data: expectedResponse });

    const result = await authService.requestPasswordReset(email);

    expect(apiClient.post).toHaveBeenCalledWith('auth/request-password-reset', { email });
    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ data: expectedResponse });
  });

  it('handles API errors during password reset request', async () => {
    const email = 'user@example.com';
    const error = new Error('Reset request failed');

    apiClient.post.mockRejectedValueOnce(error);

    await expect(authService.requestPasswordReset(email)).rejects.toThrow(error);
    expect(apiClient.post).toHaveBeenCalledWith('auth/request-password-reset', { email });
    expect(apiClient.post).toHaveBeenCalledTimes(1);
  });
});
