import apiClient from '@/service/apiClient';


/**
 * Service for registering a new admin.
 *
 * This service provides a method to send admin registration data to the server.
 *
 * @class RegisterAdminService
 */
class RegisterAdminService {

  /**
   * Registers a new admin by sending the provided admin data to the server.
   *
   * @param {Object} adminData - The data of the admin to be registered.
   * @param {string} adminData.email - The email address of the admin.
   * @param {string} adminData.token - The verification token for the admin account.
   * @returns {Promise<Object>} A promise that resolves to the server's response.
   */
  async registerAdmin(adminData) {
    return await apiClient.post('/admin/setup', adminData);
  }
}

export default RegisterAdminService;
