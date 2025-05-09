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
   * Invites an emailadress to become a new Admin in the application.
   *
   * @param {Object} adminData - The data of the admin to be invited.
   * @param {string} adminData.email - The email of the invited Admin
   * @param {string} adminData.fullName - The full name of the invited Admin
   * @returns {Promise<Object>} A promise that resolves to the server's response.
   * @throws {Error} If the invitation fails for any reason
   */
  async inviteAdmin(adminData) {
    if (!adminData.email) {
      throw new Error('[ERROR] Email is required for admin invitation');
    }

    if (!adminData.fullName ) {
      throw new Error('[ERROR] Full name is required for admin invitation');
    }

    try {
      const response = await this.post('invite', adminData);
      return response;
    } catch (error) {
        if (error.status) {

          if (error.status === 400) {
            if (error.message && error.message.includes('already exists')) {
              console.error('[ERROR] User already exists');
              throw new Error('En bruker med denne e-postadressen eksisterer allerede.');
            } else {
              throw new Error(error.message || 'Ugyldig invitasjonsdata. Vennligst sjekk informasjonen og prøv igjen.');
            }
          }

          if (error.status === 401 || error.status === 403) {
            console.error('[ERROR] Unauthorized admin invitation attempt');
            throw new Error('Ugyldig token eller manglende rettigheter for invitasjon.');
          }

          if (error.status === 409) {
            console.error('[ERROR] User already exists');
            throw new Error('En bruker med denne e-postadressen eksisterer allerede.');
          }

          if (error.status === 500) {
            console.error('[ERROR] Server error during admin invitation:', error);
            throw new Error('En serverfeil oppstod. Vennligst prøv igjen senere.');
          }
        }

      console.error('[ERROR] Failed to invite new admin:', error);
      throw new Error('Kunne ikke fullføre invitasjonen. Vennligst sjekk nettverkstilkoblingen og prøv igjen.');
    }
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
