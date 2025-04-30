import apiClient from '@/service/apiClient';

const handleErrors = (error) => {
  if (error.response) {
    console.error("Backend returned code", error.response.status, "body was:", error.response.data);
    return Promise.reject({
      status: error.response.status,
      message: error.response.data || 'Unknown error occurred',
    });
  } else if (error.request) {
    console.error("No response received");
    return Promise.reject({
      status: 0,
      message: 'No response from server'
    });
  } else {
    console.error('Error', error.message);
    return Promise.reject({
      status: 0,
      message: error.message
    });
  }
};

export default class BaseService {
  constructor(endpoint) {
    this.endpoint = endpoint || '';
  }

  async get(path = '', options = {}) {
    try {
      const url = this.buildUrl(path);
      const response = await apiClient.get(url, this.mergeOptions(options));
      return response.data;
    } catch (error) {
      return handleErrors(error);
    }
  }

  async post(path = '', data, options = {}) {
    try {
      const url = this.buildUrl(path);
      const fullOptions = this.mergeOptions(options);
      const response = await apiClient.post(url, data, fullOptions);
      return response.data;
    } catch (error) {
      return handleErrors(error);
    }
  }

  async put(path = '', data, options = {}) {
    try {
      const url = this.buildUrl(path);
      const response = await apiClient.put(url, data, this.mergeOptions(options));
      return response.data;
    } catch (error) {
      return handleErrors(error);
    }
  }

  async deleteItem(path = '', options = {}) {
    try {
      const url = this.buildUrl(path);
      const response = await apiClient.delete(url, this.mergeOptions(options));
      return response.data;
    } catch (error) {
      return handleErrors(error);
    }
  }

  async deleteReq(path = '', data, options = {}) {
    try {
      const url = this.buildUrl(path);
      const config = {
        ...this.mergeOptions(options),
        data
      };
      const response = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      return handleErrors(error);
    }
  }

  async patch(path = '', data, options = {}) {
    try {
      const url = this.buildUrl(path);
      const response = await apiClient.patch(url, data, this.mergeOptions(options));
      return response.data;
    } catch (error) {
      return handleErrors(error);
    }
  }

  buildUrl(path) {
    if (!path) {
      return this.endpoint;
    }
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    return path.startsWith('http') ? path : this.endpoint ? `${this.endpoint}/${path}` : path;
  }

  mergeOptions(options) {
    return {
      ...options,
      headers: {
        ...apiClient.defaults.headers.common,
        ...options.headers
      }
    };
  }
}