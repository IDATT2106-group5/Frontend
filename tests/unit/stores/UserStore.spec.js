import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useUserStore } from '@/stores/UserStore';
import AuthService from '@/service/authService';
import TwoFactorAuthService from '@/service/admin/twoFactorAuthService';
import RegisterAdminService from '@/service/admin/registerAdminService';
import apiClient from '@/service/apiClient';
import router from '@/router';

vi.mock('@/service/authService', () => ({
  default: {
    register: vi.fn(),
    login: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    validateResetToken: vi.fn()
  }
}));

vi.mock('@/service/admin/twoFactorAuthService', () => ({
  default: {
    generate2FA: vi.fn(),
    verify2FA: vi.fn()
  }
}));

vi.mock('@/service/admin/registerAdminService', () => ({
  default: {
    registerAdmin: vi.fn()
  }
}));

vi.mock('@/service/apiClient', () => ({
  default: {
    get: vi.fn(),
    defaults: {
      headers: {
        common: {}
      }
    }
  }
}));

vi.mock('@/router', () => ({
  default: {
    push: vi.fn()
  }
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('UserStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useUserStore();
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => localStorageMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('initializes with default state', () => {
    expect(store.token).toBe(null);
    expect(store.user).toBe(null);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBe(null);
  });

  it('isLoggedIn getter returns correct boolean value', () => {
    expect(store.isLoggedIn).toBe(false);
    store.token = 'fake-token';
    expect(store.isLoggedIn).toBe(true);
  });

  it('isAdmin getter returns correct boolean based on user role', () => {
    expect(store.isAdmin).toBe(false);
    store.user = { role: 'USER' };
    expect(store.isAdmin).toBe(false);
    store.user = { role: 'ADMIN' };
    expect(store.isAdmin).toBe(true);
    store.user = { role: 'SUPERADMIN' };
    expect(store.isAdmin).toBe(true);
  });

  it('isSuperAdmin getter returns correct boolean based on user role', () => {
    expect(store.isSuperAdmin).toBe(false);
    store.user = { role: 'ADMIN' };
    expect(store.isSuperAdmin).toBe(false);
    store.user = { role: 'SUPERADMIN' };
    expect(store.isSuperAdmin).toBe(true);
  });

  it('setUser updates the user state', () => {
    const testUser = { id: '123', email: 'test@example.com', role: 'USER' };
    store.setUser(testUser);
    expect(store.user).toEqual(testUser);
  });

  describe('register', () => {
    it('registers a user successfully', async () => {
      AuthService.register.mockResolvedValue(true);
      
      const userData = {
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
        hCaptchaToken: 'token123'
      };
      
      const result = await store.register(userData);
      
      expect(result).toBe(true);
      expect(AuthService.register).toHaveBeenCalledWith(userData);
      expect(store.error).toBe(null);
    });

    it('handles registration failure with email already in use', async () => {
      AuthService.register.mockRejectedValue({
        response: {
          data: {
            error: 'Email already in use'
          }
        }
      });
      
      const result = await store.register({
        email: 'existing@example.com',
        fullName: 'Test User',
        password: 'password123'
      });
      
      expect(result).toBe(false);
      expect(store.error).toBe('E-postadressen er allerede registrert.');
    });

    it('handles general registration failure', async () => {
      AuthService.register.mockRejectedValue(new Error('Network error'));
      
      const result = await store.register({
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123'
      });
      
      expect(result).toBe(false);
      expect(store.error).toBe('Network error');
    });
  });

  describe('login', () => {
    it('logs in user successfully when 2FA is not required', async () => {
      const mockToken = 'fake-jwt-token';
      AuthService.login.mockResolvedValue({
        data: {
          requires2FA: false,
          token: mockToken
        }
      });
      
      apiClient.get.mockResolvedValue({
        data: { id: 'user1', email: 'test@example.com', role: 'USER' }
      });
      
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const result = await store.login(credentials);
      
      expect(result).toBe(true);
      expect(store.token).toBe(mockToken);
      expect(apiClient.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
      expect(localStorage.setItem).toHaveBeenCalledWith('jwt', mockToken);
      expect(apiClient.get).toHaveBeenCalledWith('user/me');
    });

    it('redirects to 2FA when required', async () => {
      AuthService.login.mockResolvedValue({
        data: {
          requires2FA: true
        }
      });
      
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const result = await store.login(credentials);
      
      expect(result).toBe(false);
      expect(TwoFactorAuthService.generate2FA).toHaveBeenCalledWith(credentials.email);
      expect(router.push).toHaveBeenCalledWith({
        name: '2FA',
        query: { email: credentials.email }
      });
    });

    it('handles login failure', async () => {
      AuthService.login.mockRejectedValue(new Error('Invalid credentials'));
      
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      await expect(store.login(credentials)).rejects.toThrow('Invalid credentials');
      expect(store.error).toBe('Invalid credentials');
    });
  });

  describe('fetchUser', () => {
    it('fetches user data successfully', async () => {
      const userData = { id: 'user1', email: 'test@example.com', role: 'USER' };
      apiClient.get.mockResolvedValue({ data: userData });
      
      await store.fetchUser();
      
      expect(store.user).toEqual(userData);
      expect(apiClient.get).toHaveBeenCalledWith('user/me');
    });

    it('calls logout when fetch user fails', async () => {
      apiClient.get.mockRejectedValue(new Error('Unauthorized'));
      vi.spyOn(store, 'logout');
      
      await store.fetchUser();
      
      expect(store.logout).toHaveBeenCalled();
    });
  });

  describe('verify2FA', () => {
    it('verifies 2FA successfully', async () => {
      const mockToken = 'fake-2fa-verified-token';
      TwoFactorAuthService.verify2FA.mockResolvedValue({ token: mockToken });
      apiClient.get.mockResolvedValue({
        data: { id: 'user1', email: 'test@example.com', role: 'USER' }
      });
      
      const credentials = {
        email: 'test@example.com',
        otp: '123456'
      };
      
      const result = await store.verify2FA(credentials);
      
      expect(result).toBe(true);
      expect(store.token).toBe(mockToken);
      expect(apiClient.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
      expect(localStorage.setItem).toHaveBeenCalledWith('jwt', mockToken);
    });

    it('handles 2FA verification failure', async () => {
      TwoFactorAuthService.verify2FA.mockRejectedValue(new Error('Invalid OTP'));
      
      const credentials = {
        email: 'test@example.com',
        otp: 'wrong-otp'
      };
      
      const result = await store.verify2FA(credentials);
      
      expect(result).toBe(false);
      expect(store.error).toBe('Invalid OTP');
    });
  });

  describe('resend2FACode', () => {
    it('resends 2FA code successfully', async () => {
      TwoFactorAuthService.generate2FA.mockResolvedValue({});
      
      await store.resend2FACode('test@example.com');
      
      expect(TwoFactorAuthService.generate2FA).toHaveBeenCalledWith('test@example.com');
      expect(store.error).toBe(null);
    });

    it('handles resend 2FA code failure', async () => {
      TwoFactorAuthService.generate2FA.mockRejectedValue(new Error('Failed to send'));
      
      await store.resend2FACode('test@example.com');
      
      expect(store.error).toBe('Failed to send');
    });
  });

  describe('registerAdmin', () => {
    it('registers admin successfully', async () => {
      RegisterAdminService.registerAdmin.mockResolvedValue({ success: true });
      
      const adminData = {
        token: 'admin-invite-token',
        password: 'admin-password'
      };
      
      const result = await store.registerAdmin(adminData);
      
      expect(result).toBe(true);
      expect(RegisterAdminService.registerAdmin).toHaveBeenCalledWith(adminData);
    });

    it('handles admin registration failure', async () => {
      RegisterAdminService.registerAdmin.mockRejectedValue(new Error('Invalid token'));
      
      const result = await store.registerAdmin({
        token: 'invalid-token',
        password: 'password'
      });
      
      expect(result).toBe(false);
      expect(store.error).toBe('Invalid token');
    });
  });

  describe('logout', () => {
    it('clears user data and token', () => {
      store.token = 'some-token';
      store.user = { id: 'user1' };
      apiClient.defaults.headers.common['Authorization'] = 'Bearer some-token';
      localStorage.setItem('jwt', 'some-token');
      
      store.logout();
      
      expect(store.token).toBe(null);
      expect(store.user).toBe(null);
      expect(apiClient.defaults.headers.common['Authorization']).toBeUndefined();
      expect(localStorage.removeItem).toHaveBeenCalledWith('jwt');
    });
  });

  describe('autoLogin', () => {
    it('auto-logs in with valid token from localStorage', async () => {
      const mockToken = 'saved-token';
      localStorage.getItem.mockReturnValue(mockToken);
      vi.spyOn(store, 'fetchUser').mockResolvedValue({});
      
      // Mock window.location
      const originalLocation = window.location;
      delete window.location;
      window.location = { pathname: '/dashboard' };
      
      await store.autoLogin();
      
      expect(store.token).toBe(mockToken);
      expect(apiClient.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
      expect(store.fetchUser).toHaveBeenCalled();
      
      // Restore window.location
      window.location = originalLocation;
    });

    it('does not fetch user on public routes', async () => {
      const mockToken = 'saved-token';
      localStorage.getItem.mockReturnValue(mockToken);
      vi.spyOn(store, 'fetchUser');
      
      // Mock window.location
      const originalLocation = window.location;
      delete window.location;
      window.location = { pathname: '/login' };
      
      await store.autoLogin();
      
      expect(store.token).toBe(mockToken);
      expect(apiClient.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);
      expect(store.fetchUser).not.toHaveBeenCalled();
      
      // Restore window.location
      window.location = originalLocation;
    });

    it('does nothing when no token exists', async () => {
      localStorage.getItem.mockReturnValue(null);
      vi.spyOn(store, 'fetchUser');
      
      await store.autoLogin();
      
      expect(store.token).toBe(null);
      expect(store.fetchUser).not.toHaveBeenCalled();
    });
  });

  describe('requestPasswordReset', () => {
    it('requests password reset successfully', async () => {
      AuthService.requestPasswordReset.mockResolvedValue({
        data: { message: 'Reset link sent to your email' }
      });
      
      const result = await store.requestPasswordReset('test@example.com');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Reset link sent to your email');
      expect(AuthService.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    });

    it('handles password reset request failure', async () => {
      AuthService.requestPasswordReset.mockRejectedValue({
        response: { data: { error: 'Email not found' } }
      });
      
      const result = await store.requestPasswordReset('nonexistent@example.com');
      
      expect(result.success).toBe(false);
      expect(store.error).toBe('Email not found');
    });
  });

  describe('resetPassword', () => {
    it('resets password successfully', async () => {
      AuthService.resetPassword.mockResolvedValue({
        data: { message: 'Password has been reset' }
      });
      
      const result = await store.resetPassword('valid-token', 'new-password');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Password has been reset');
      expect(AuthService.resetPassword).toHaveBeenCalledWith('valid-token', 'new-password');
    });

    it('handles password reset failure', async () => {
      AuthService.resetPassword.mockRejectedValue({
        response: { data: { error: 'Invalid or expired token' } }
      });
      
      const result = await store.resetPassword('expired-token', 'new-password');
      
      expect(result.success).toBe(false);
      expect(store.error).toBe('Invalid or expired token');
    });
  });

  describe('validateResetToken', () => {
    it('validates token successfully', async () => {
      AuthService.validateResetToken.mockResolvedValue({
        data: { message: 'Token is valid' }
      });
      
      const result = await store.validateResetToken('valid-token');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Token is valid');
      expect(AuthService.validateResetToken).toHaveBeenCalledWith('valid-token');
    });

    it('handles token validation failure', async () => {
      AuthService.validateResetToken.mockRejectedValue({
        response: { data: { error: 'Token expired' } }
      });
      
      const result = await store.validateResetToken('expired-token');
      
      expect(result.success).toBe(false);
      expect(store.error).toBe('Token expired');
    });
  });
});