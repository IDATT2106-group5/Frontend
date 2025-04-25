import BaseService from './baseService';

class AuthService extends BaseService {
  constructor() {
    super('auth');
  }

  login(credentials) {
    return this.post('login', credentials); 
  }

  register(data) {
    return this.post('register', data);
  }

  logout() {
    return this.post('logout');
  }
}

export default new AuthService();
