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

  describe('login', () => {
    it('calls API with correct endpoint and data', async () => {
      const credentials = { email: 'test@example.com', password: '123456' }
      const expectedResponse = { token: 'abc123' }
      apiClient.post.mockResolvedValueOnce({ data: expectedResponse })
      const result = await authService.login(credentials)
      expect(apiClient.post).toHaveBeenCalledWith('auth/login', credentials)
      expect(result).toEqual({ data: expectedResponse })
    })

    it('handles API errors during login', async () => {
      const credentials = { email: 'test@example.com', password: '123456' }
      const error = new Error('Login failed')
      apiClient.post.mockRejectedValueOnce(error)
      await expect(authService.login(credentials)).rejects.toThrow(error)
    })
  })

  describe('confirmEmail', () => {
    it('calls API with correct token', async () => {
      const token = 'abc123'
      const expectedResponse = { message: 'Email confirmed' }
      apiClient.get.mockResolvedValueOnce({ data: expectedResponse })
      const result = await authService.confirmEmail(token)
      expect(apiClient.get).toHaveBeenCalledWith(`auth/confirm?token=${token}`)
      expect(result).toEqual({ data: expectedResponse })
    })

    it('handles API errors during confirmation', async () => {
      const token = 'abc123'
      const error = new Error('Confirmation failed')
      apiClient.get.mockRejectedValueOnce(error)
      await expect(authService.confirmEmail(token)).rejects.toThrow(error)
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
  })

  describe('resetPassword', () => {
    it('calls API with correct token and new password', async () => {
      const token = 'abc123', newPassword = 'newpass';
      const expectedResponse = { message: 'Password reset successful' };
      apiClient.post.mockResolvedValueOnce({ data: expectedResponse });
      const result = await authService.resetPassword(token, newPassword);
      expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', { token, newPassword });
      expect(result).toEqual({ data: expectedResponse });
    });

    it('handles API errors during password reset', async () => {
      const error = new Error('Reset failed');
      apiClient.post.mockRejectedValueOnce(error);
      await expect(authService.resetPassword('abc123', 'newpass')).rejects.toThrow(error);
    });
  });

  describe('validateResetToken', () => {
    it('calls API with correct token', async () => {
      const token = 'abc123';
      const expectedResponse = { valid: true };
      apiClient.post.mockResolvedValueOnce({ data: expectedResponse });
      const result = await authService.validateResetToken(token);
      expect(apiClient.post).toHaveBeenCalledWith('/auth/validate-reset-token', { token });
      expect(result).toEqual({ data: expectedResponse });
    });

    it('handles API errors during token validation', async () => {
      const error = new Error('Token invalid');
      apiClient.post.mockRejectedValueOnce(error);
      await expect(authService.validateResetToken('abc123')).rejects.toThrow(error);
    });
  });
});
