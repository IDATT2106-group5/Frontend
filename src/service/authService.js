import apiClient from '@/service/apiClient'; 

class AuthService {
  async register(userData) {
    console.log("📤 Sending register data:", userData);
    return apiClient.post('auth/register', userData);
  }

  async login(credentials) {
    console.log("📤 Sending login credentials:", credentials);
    return apiClient.post('auth/login', credentials);
  }

  async confirmEmail(token) {
    return apiClient.get(`auth/confirm?token=${token}`);
  }
}

export default new AuthService();
