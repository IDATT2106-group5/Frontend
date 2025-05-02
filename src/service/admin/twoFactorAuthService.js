import apiClient from '@/service/apiClient';

/**
 * Service for handling Two-Factor Authentication (2FA) operations for admin users.
 *
 * This service provides methods to generate and verify 2FA codes for enhanced security during the login process.
 *
 * @class TwoFactorAuthService
 */
class TwoFactorAuthService {

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

  /**
   * Verifies the two-factor authentication (2FA) credentials for an admin user.
   *
   * @param {Object} credentials       - The 2FA credentials to verify.
   * @param {string} credentials.email - The users email that the 2FA code has been sent to.
   * @param {string} credentials.otp   - The 6 digit code that the user typed in.
   * @returns {Promise<Object>} A promise that resolves to the server's response.
   */
  async verify2FA(credentials) {
    return apiClient.post("/admin/login/2fa/verify", credentials);
  }

}

export default new TwoFactorAuthService();
