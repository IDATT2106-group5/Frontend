import BaseService from '@/service/baseService';

class UserService extends BaseService {
  constructor() {
    super('/user');
  }

  async getCurrentHouseholdByUserId(userId) {
    try {
      const response = await this.get(`me/household/${userId}`);
      return response;
    } catch (error) {
      console.error("Household not found:", error);
      throw error;
    }
  }

  async checkEmail(email) {
    try {
      const response = await this.post('check-mail', { email });
      return response.userId; 
    } catch (error) {
      console.error('[ERROR] Checking email existence:', error);
      throw error;
    }
  }
  
}

export default new UserService();
