// src/service/admin/markerAdminService.js
import BaseService from '@/service/baseService';

/**
 * Service for marker administration
 */
class MarkerAdminService extends BaseService {
  constructor() {
    super('admin/map-icons');
  }

  /**
   * Fetch all markers for admin without location restrictions
   * @returns {Promise<Array>} Array of marker objects
   */
  async fetchAllMarkersForAdmin() {
    try {
      return await this.get();
    } catch (error) {
      console.error('Error fetching all markers for admin:', error);
      throw error;
    }
  }

  /**
   * Create a new marker
   * @param {Object} markerData - Marker data
   * @returns {Promise<Object>} Created marker
   */
  async createMarker(markerData) {
    try {
      return await this.post('', markerData);
    } catch (error) {
      console.error('Error creating marker:', error);
      throw error;
    }
  }

  /**
   * Update an existing marker
   * @param {string|number} id - Marker ID
   * @param {Object} markerData - Updated marker data
   * @returns {Promise<Object>} Updated marker
   */
  async updateMarker(id, markerData) {
    try {
      return await this.put(`/${id}`, markerData);
    } catch (error) {
      console.error(`Error updating marker ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a marker
   * @param {string|number} id - Marker ID
   * @returns {Promise<void>}
   */
  async deleteMarker(id) {
    try {
      return await this.delete(`/${id}`);
    } catch (error) {
      console.error(`Error deleting marker ${id}:`, error);
      throw error;
    }
  }
}

export default new MarkerAdminService();
