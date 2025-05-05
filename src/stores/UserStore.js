import { defineStore } from 'pinia';
import AuthService from '@/service/authService';
import TwoFactorAuthService from '@/service/twoFactorAuthService';
import apiClient from '@/service/apiClient';
import router from '@/router';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    user: null,
    isLoading: false,
    error: null
  }),
  actions: {

    /**
     * Registers a new user with the provided user data.
     *
     * @async
     * @param {Object} userData               - The data of the user to register.
     * @param {string} userData.email         - The email address of the user.
     * @param {string} userData.fullName      - The full name of the user.
     * @param {string} userData.password      - The password for the user account.
     * @param {string} [userData.tlf]         - The phone number of the user (optional, spaces removed).
     * @param {string} userData.hCaptchaToken - The hCaptcha token for verification.
     * @returns {Promise<boolean>} A promise that resolves to `true` if registration is successful,
     *                             or `false` if an error occurs.
     * @throws {Error} Throws an error if the registration process fails unexpectedly.
     */
    async register(userData) {
      this.isLoading = true;
      this.error = null;
      try {        
        const response = await AuthService.register(userData);
        return true;
      } catch (err) {        
        if (err.response && err.response.data && err.response.data.error === "Email already in use") {
          this.error = "E-postadressen er allerede registrert.";
        } else {
          this.error = err.message || "Noe gikk galt under registrering.";
        }
        return false; 
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Logs in a user using the provided credentials.
     * Handles two-factor authentication (2FA) if required.
     *
     * @async
     * @function
     * @param {Object} credentials       - The login credentials.
     * @param {string} credentials.email - The user's email address.
     * @param {string} credentials.password - The user's password.
     * @returns {Promise<boolean>}       - Resolves to `true` if login is successful,
     *                                    `false` if 2FA is required.
     * @throws {Error} - Throws an error if the login process fails.
     */
    async login(credentials) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await AuthService.login(credentials);

        const requires2FA = response.data.requires2FA;

        if (requires2FA) {
          await TwoFactorAuthService.generate2FA(credentials.email);
          router.push({
            name: "2FA",
            query: { email: credentials.email }
          });
          return false;
        } else {
          const { token } = response.data;
          this.token = token;
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          localStorage.setItem('jwt', token);
          await this.fetchUser();
          return true;
        }
      } catch (err) {
        this.error = err.message || "Innlogging feilet.";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUser() {
      try {
        const response = await apiClient.get('user/me')
        console.log("Fetch user called - implement UserService");
      } catch (err) {
        console.error("Error fetching user:", err);
        this.logout()
      }
    },


    /**
     * Verifies the user's two-factor authentication (2FA) credentials.
     *
     * @async
     * @param {Object} credentials - The 2FA credentials provided by the user.
     * @param {string} credentials.email - The users email.
     * @param {string} credentials.otp - The 2FA code entered by the user.
     * @returns {Promise<boolean>} A promise that resolves to `true` if verification is successful,
     *                             or `false` if it fails.
     * @throws {Error} If an unexpected error occurs during the verification process.
     */
    async verify2FA(credentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await TwoFactorAuthService.verify2FA(credentials);

        const { token } = response.data;
        this.token = token;
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('jwt', token);
        await this.fetchUser();
        return true;
      } catch (err) {
        this.error = err.message || "Verifisering av 2FA feilet.";
        return false;
      } finally {
        this.isLoading = false;
      }

    },


    /**
     * Resends a 2FA (Two-Factor Authentication) code to the specified email address.
     * Sets the loading state while the operation is in progress and handles errors if they occur.
     *
     * @async
     * @param {string} email - The email address to which the 2FA code should be sent.
     * @returns {Promise<void>} A promise that resolves when the operation is complete.
     */
    async resend2FACode(email) {
      this.isLoading = true;
      this.error = null;
      try {
        await TwoFactorAuthService.generate2FA(email);
      } catch(err) {
        this.error = err.message || "Sending av ny 2FA-kode feilet.";
      } finally {
        this.isLoading = false;
      }
    },


    /**
     * Logs the user out by clearing the authentication token, user data,
     * and removing the authorization header from the API client.
     */
    logout() {
      this.token = null;
      this.user = null;
      delete apiClient.defaults.headers.common['Authorization'];
      localStorage.removeItem('jwt');
    },


    /**
     * Automatically logs in the user if a valid JWT token is found in local storage.
     * Sets the token for the current session and updates the API client with the
     * appropriate authorization header. Fetches the user data after setting the token.
     */
    autoLogin() {
      const token = localStorage.getItem('jwt');
      if (token) {
        this.token = token;
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        this.fetchUser();
      }
    }
  }
});