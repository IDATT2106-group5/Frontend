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
}

export default new UserService();
