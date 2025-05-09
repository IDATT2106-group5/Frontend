import apiClient from '@/service/apiClient';

/**
 * Handles and formats errors from API responses.
 *
 * @param {any} error - The error object from the failed HTTP request.
 * @returns {Promise<never>} A rejected promise with a structured error object.
 */
const handleErrors = (error) => {
  if (error.response) {
    console.error("Backend returned code", error.response.status, "body was:", error.response.data);
    return Promise.reject({
      status: error.response.status,
      message: error.response.data.error || error.response.data.message || 'Unknown error occurred',
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


/**
 * BaseService provides a wrapper around HTTP methods (GET, POST, PUT, DELETE, PATCH)
 * using a configured Axios instance (apiClient). Subclasses should define the base endpoint.
 */
export default class BaseService {
  /**
   * Creates an instance of BaseService.
   * @param {string} endpoint - Base URL path for the service (e.g., '/user', '/storage').
   */
  constructor(endpoint) {
    this.endpoint = endpoint || '';
  }

  /**
   * Sends a GET request.
   *
   * @param {string} [path=''] - Optional path to append to the base endpoint.
   * @param {object} [options={}] - Optional Axios config.
   * @returns {Promise<any>} Response data.
   */
  async get(path = '', options = {}) {
    try {
      const url = this.buildUrl(path);
      const response = await apiClient.get(url, this.mergeOptions(options));
      return response.data;
    } catch (error) {
      return handleErrors(error);
    }
  }

  /**
   * Sends a POST request.
   *
   * @param {string} [path=''] - Optional path to append to the base endpoint.
   * @param {any} data - Data to send in the request body.
   * @param {object} [options={}] - Optional Axios config.
   * @returns {Promise<any>} Response data.
   */
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

  /**
   * Sends a PUT request.
   *
   * @param {string} [path=''] - Optional path to append to the base endpoint.
   * @param {any} data - Data to update.
   * @param {object} [options={}] - Optional Axios config.
   * @returns {Promise<any>} Response data.
   */
  async put(path = '', data, options = {}) {
    try {
      const url = this.buildUrl(path);
      const response = await apiClient.put(url, data, this.mergeOptions(options));
      return response.data;
    } catch (error) {
      return handleErrors(error);
    }
  }

  /**
   * Sends a DELETE request.
   *
   * @param {string} [path=''] - Optional path to append to the base endpoint.
   * @param {object} [options={}] - Optional Axios config.
   * @returns {Promise<any>} Response data.
   */
  async deleteItem(path = '', options = {}) {
    try {
      const url = this.buildUrl(path);
      const response = await apiClient.delete(url, this.mergeOptions(options));
      return response.data;
    } catch (error) {
      return handleErrors(error);
    }
  }

  /**
   * Sends a PATCH request.
   *
   * @param {string} [path=''] - Optional path to append to the base endpoint.
   * @param {any} data - Partial data to update.
   * @param {object} [options={}] - Optional Axios config.
   * @returns {Promise<any>} Response data.
   */
  async patch(path = '', data, options = {}) {
    try {
      const url = this.buildUrl(path);
      const response = await apiClient.patch(url, data, this.mergeOptions(options));
      return response.data;
    } catch (error) {
      return handleErrors(error);
    }
  }

  /**
   * Constructs the full API endpoint URL.
   *
   * @param {string} path - The path to append to the base endpoint.
   * @returns {string} The full URL.
   */
  buildUrl(path) {
    if (!path) {
      return this.endpoint;
    }
    return this.endpoint ? `${this.endpoint}/${path}` : path;
  }

  /**
   * Merges default Axios headers with any custom headers passed.
   *
   * @param {object} options - Axios config options.
   * @returns {object} Merged config with headers.
   */ 
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
