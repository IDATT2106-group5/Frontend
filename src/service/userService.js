import BaseService from '@/service/baseService';

/**
 * Service for user related API operations such as retrieving user household info
 * and verifying email existence.
 */
class UserService extends BaseService {
  /**
   * Initializes the UserService with the `/user` base endpoint.
   */
  constructor() {
    super('/user');
  }

  async getCurrentHouseholdByUserId() {
    try {
      const response = await this.get(`me/household`);
      return response;
    } catch (error) {
      console.error("Household not found:", error);
      throw error;
    }
  }
  
  /**
   * Checks if an email is associated with a registered user.
   *
   * @param {string} email - The email address to check.
   * @returns {Promise<string>} The user ID associated with the email, if found.
   * @throws {Error} If the request fails.
   */
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