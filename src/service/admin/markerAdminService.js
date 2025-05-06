// src/service/admin/markerAdminService.js
import BaseService from '@/service/baseService';

/**
 * Service for marker administration
 */
class MarkerAdminService extends BaseService {
  constructor() {
    super('map-icons');
  }

  /**
   * Fetch all markers for admin without location restrictions
   * @returns {Promise<Array>} Array of marker objects
   */
  async fetchAllMarkersForAdmin() {
    try {
      // Since the API requires lat/long/radius, we'll use a large radius from Trondheim
      // to effectively get all markers
      return await this.get('', {
        params: {
          latitude: 63.4305,
          longitude: 10.3951,
          radiusKm: 100 // Large radius to get all markers
        }
      });
    } catch (error) {
      console.error('Error fetching all markers for admin:', error);
      throw error;
    }
  }

  /**
   * Create a new marker
   * @param {Object} markerData - Marker data
   * @returns {Promise<Object>} Response with status message
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
   * @param {number} id - Marker ID
   * @param {Object} markerData - Updated marker data
   * @returns {Promise<Object>} Response with status message
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
   * @param {number} id - Marker ID
   * @returns {Promise<Object>} Response with status message
   */
  async deleteMarker(id) {
    try {
      return await this.deleteItem(`${id}`);
    } catch (error) {
      console.error(`Error deleting marker ${id}:`, error);
      throw error;
    }
  }
}

export default new MarkerAdminService();
