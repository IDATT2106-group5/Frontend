import apiClient from '@/service/apiClient'; 

class AuthService {
  async register(userData) {
    return apiClient.post('auth/register', userData);
  }

  async login(credentials) {
    return apiClient.post('auth/login', credentials);
  }

  async confirmEmail(token) {
    return apiClient.get(`auth/confirm?token=${token}`);
  }

  async requestPasswordReset(email) { 
    return apiClient.post('auth/request-password-reset', { email });
  }

  async resetPassword(token, newPassword) {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  }

  async validateResetToken(token) {
    return apiClient.post('/auth/validate-reset-token', { token });
  }
  
}

export default new AuthService();
