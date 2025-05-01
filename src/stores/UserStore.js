import { defineStore } from 'pinia';
import AuthService from '@/service/authService';
import TwoFactorAuthService from '@/service/adminService';
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

    async login(credentials) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await AuthService.login(credentials);

        const { requires2Fa } = response.data;

        if (requires2Fa) {
          await TwoFactorAuthService.generate2FA(credentials.email);
          router.push({
            name: "2FA",
            query: { email: credentials.email }
          });
        } else {
          const { token } = response.data;
          this.token = token;
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          localStorage.setItem('jwt', token);
          await this.fetchUser();
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
        console.log("Fetch user called - implement UserService");
      } catch (err) {
        console.error("Error fetching user:", err);
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

    logout() {
      this.token = null;
      this.user = null;
      delete apiClient.defaults.headers.common['Authorization'];
      localStorage.removeItem('jwt');
    },

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
