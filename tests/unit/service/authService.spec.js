import { describe, it, expect, vi, beforeEach } from 'vitest'
import authService from '@/service/authService.js'
import apiClient from '@/service/apiClient.js'

// Mock the apiClient module
vi.mock('@/service/apiClient', () => ({
  default: {
    post: vi.fn()
  }
}))

describe('AuthService', () => {
  beforeEach(() => {
    // Clear mock calls between tests
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('calls API with correct endpoint and data', async () => {
      // Setup
      const userData = { email: 'test@example.com', password: 'password123', name: 'Test User' }
      const expectedResponse = { success: true, userId: '123' }

      // Mock the API response
      apiClient.post.mockResolvedValueOnce({ data: expectedResponse })

      // Execute
      const result = await authService.register(userData)

      // Verify
      expect(apiClient.post).toHaveBeenCalledWith('auth/register', userData)
      expect(apiClient.post).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ data: expectedResponse })
    })

    it('handles API errors during registration', async () => {
      // Setup
      const userData = { email: 'test@example.com', password: 'password123' }
      const error = new Error('Registration failed')

      // Mock the API error
      apiClient.post.mockRejectedValueOnce(error)

      // Execute and verify
      await expect(authService.register(userData)).rejects.toThrow(error)
      expect(apiClient.post).toHaveBeenCalledWith('auth/register', userData)
      expect(apiClient.post).toHaveBeenCalledTimes(1)
    })
  })
})
