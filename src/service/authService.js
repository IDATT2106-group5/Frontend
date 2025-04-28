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
}

export default new AuthService();
