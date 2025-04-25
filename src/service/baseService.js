import axios from 'axios';


//const API_BASE_URL = 'http://localhost:8080/api';
const API_BASE_URL = 'https://375473ec-973d-40ea-ac59-f12d252f142b.mock.pstmn.io'; //to mock test the API calls


/**
 @type {axios.AxiosInstance}
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});


/**
 * @param error
 * @returns {Promise<never>}
 */
const handleErrors = (error) => {
  if (error.response) {
    console.error("Backend returned code", error.response.status, "body was:", error.response.data);
    return Promise.reject({
      status: error.response.status,
      message: error.response.data.message || 'Unknown error occurred',
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
    this.url = endpoint ? `${API_BASE_URL}/${endpoint}` : API_BASE_URL;
  }

  async get(params = '', options = {}) {
    try {
      const response = await apiClient.get(params ? `${this.url}/${params}` : this.url, this.mergeOptions(options));
      return response.data;
    } catch (error) {
      return handleErrors(error);
    }
  }

  async post(endpoint = '', data, options = {}) {
    try {
      const fullOptions = this.mergeOptions(options);
      const response = await apiClient.post(endpoint ? `${this.url}/${endpoint}` : this.url, data, fullOptions);
      return response.data;
    } catch (error) {
      return handleErrors(error);
    }
  }

  async put(endpoint = '', data, options = {}) {
    try {
      const response = await apiClient.put(endpoint ? `${this.url}/${endpoint}` : this.url, data, this.mergeOptions(options));
      return response.data;
    } catch (error) {
      return handleErrors(error);
    }
  }

  async deleteItem(endpoint = '', options = {}) {
    try {
      const response = await apiClient.delete(endpoint ? `${this.url}/${endpoint}` : this.url, this.mergeOptions(options));
      return response.data;
    } catch (error) {
      return handleErrors(error);
    }
  }

  async patch(endpoint = '', data, options = {}) {
    try {
      const response = await apiClient.patch(endpoint ? `${this.url}/${endpoint}` : this.url, data, this.mergeOptions(options));
      return response.data;
    } catch (error) {
      return handleErrors(error);
    }
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

