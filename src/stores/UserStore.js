import { defineStore } from 'pinia';
import AuthService from '@/service/authService';
import apiClient from '@/service/apiClient';

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
        const { token } = response.data;
        this.token = token;
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('jwt', token);
        await this.fetchUser();
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
