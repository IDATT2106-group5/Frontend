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
      throw error;
    }
  }

  async checkEmail(email) {
    try {
      const response = await this.post('check-mail', { email });
      return response.userId; 
    } catch (error) {
      throw error;
    }
  }
  
}

export default new UserService();
