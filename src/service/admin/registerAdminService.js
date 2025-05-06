import BaseService from '../baseService';

/**
 * Service for registering a new admin.
 *
 * This service provides a method to send admin registration data to the server.
 *
 * @class RegisterAdminService
 */
class RegisterAdminService extends BaseService {
  constructor() {
    super('/admin');
  }

  /**
   * Registers a new admin by sending the provided admin data to the server.
   *
   * @param {Object} adminData - The data of the admin to be registered.
   * @param {string} adminData.token - The verification token for the admin account.
   * @param {string} adminData.password - The password of the admin account.
   * @returns {Promise<Object>} A promise that resolves to the server's response.
   * @throws {Error} If registration fails for any reason
   */
  async registerAdmin(adminData) {
    if (!adminData.token) {
      throw new Error('[ERROR] Token is required for admin registration');
    }

    if (!adminData.password || adminData.password.length < 8) {
      throw new Error('[ERROR] Valid password is required for admin registration (min 8 characters)');
    }

    try {
      const response = await this.post('setup', adminData);
      console.log('[RESPONSE] Admin registration successful');
      return response;
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          console.error('[ERROR] Invalid admin registration data:', data.message || 'Validation failed');
          throw new Error(data.message || 'Ugyldig registreringsdata. Vennligst sjekk informasjonen og prøv igjen.');
        }

        if (status === 401 || status === 403) {
          console.error('[ERROR] Unauthorized admin registration attempt');
          throw new Error('Ugyldig token eller manglende rettigheter for registrering.');
        }

        if (status === 409) {
          console.error('[ERROR] Admin already exists');
          throw new Error('En bruker med denne e-postadressen eksisterer allerede.');
        }

        if (status === 500) {
          console.error('[ERROR] Server error during admin registration:', error);
          throw new Error('En serverfeil oppstod. Vennligst prøv igjen senere.');
        }
      }

      console.error('[ERROR] Failed to register admin:', error);
      throw new Error('Kunne ikke fullføre registreringen. Vennligst sjekk nettverkstilkoblingen og prøv igjen.');
    }
  }
}

export default new RegisterAdminService();
