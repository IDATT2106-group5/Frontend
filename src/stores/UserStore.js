import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    user: null,
    isLoading: false,
    error: null
  }),
  actions: {
    async login(credentials) {
      this.isLoading = true;
      try {
        const { token } = await AuthService.login(credentials);
        this.token = token;
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('jwt', token);
        await this.fetchUser();
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async register(data) {
      this.isLoading = true;
      try {
        const { token } = await AuthService.register(data);
        this.token = token;
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('jwt', token);
        await this.fetchUser();
      }
        catch (err) {
          if (err.response?.status === 409) {
            this.error = "E-postadresse er allerede registrert";
          } else {
            this.error = err.message || "Noe gikk galt";
          }
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUser() {
      this.user = await UserService.get('me');
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
