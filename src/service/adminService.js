import apiClient from '@/service/apiClient';

class AdminService {

  /**
   * Generates a Two-Factor Authentication (2FA) code for the given email.
   *
   * Sends a POST request to the server to generate a 2FA code associated with the provided email address.
   *
   * @param {string} email - The email address for which to generate the 2FA code.
   * @returns {Promise<Object>} A promise that resolves to the server's response.
   */
  async generate2FA(email) {
    return apiClient.post("/admin/login/2fa/generate", { email });
  }

}

export default new AdminService();
