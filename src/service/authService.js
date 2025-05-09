import apiClient from '@/service/apiClient'; 

 /**
 * Service for handling user authentication and account recovery operations.
 */
class AuthService {
  /**
   * Registers a new user.
   *
   * @param {Object} userData - User registration data (e.g. name, email, password).
   * @returns {Promise<import('axios').AxiosResponse>} Axios response from the server.
   */
  async register(userData) {
    return apiClient.post('auth/register', userData);
  }
  /**
   * Logs in a user with credentials.
   *
   * @param {Object} credentials - User login data (email and password).
   * @returns {Promise<import('axios').AxiosResponse>} Axios response with authentication token.
   */
  async login(credentials) {
    return apiClient.post('auth/login', credentials);
  }

  /**
   * Confirms a user's email using a token.
   *
   * @param {string} token - Email confirmation token.
   * @returns {Promise<import('axios').AxiosResponse>} Axios response indicating confirmation status.
   */
  async confirmEmail(token) {
    return apiClient.get(`auth/confirm?token=${token}`);
  }

  /**
   * Sends a password reset request email.
   *
   * @param {string} email - Email address to send the reset link to.
   * @returns {Promise<import('axios').AxiosResponse>} Axios response indicating request status.
   */
  async requestPasswordReset(email) { 
    return apiClient.post('auth/request-password-reset', { email });
  }

  /**
   * Resets the password using a reset token and a new password.
   *
   * @param {string} token - The reset token sent via email.
   * @param {string} newPassword - The new password to set.
   * @returns {Promise<import('axios').AxiosResponse>} Axios response indicating success or failure.
   */
  async resetPassword(token, newPassword) {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  }

  /**
   * Validates a password reset token.
   *
   * @param {string} token - The token to validate.
   * @returns {Promise<import('axios').AxiosResponse>} Axios response indicating if the token is valid.
   */
  async validateResetToken(token) {
    return apiClient.post('/auth/validate-reset-token', { token });
  }
  
}

export default new AuthService();
