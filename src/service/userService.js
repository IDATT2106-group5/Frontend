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

  /**
   * Fetches the current household associated with the specified user ID.
   *
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Object>} The household data associated with the user.
   * @throws {Error} If the request fails or household is not found.
   */
  async getCurrentHouseholdByUserId(userId) {
    try {
      const response = await this.get(`me/household/${userId}`);
      return response;
    } catch (error) {
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
      throw error;
    }
  }
  
}

export default new UserService();
