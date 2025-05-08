// src/service/admin/incidentAdminService.js
import BaseService from '@/service/baseService';

/**
 * Service for incident administration
 */
class IncidentAdminService extends BaseService {
  constructor() {
    super('incidents');
  }

  /**
   * Fetch all incidents for admin without restrictions
   * @returns {Promise<Array>} Array of incident objects
   */
  async fetchAllIncidentsForAdmin() {
    try {
      return await this.get();
    } catch (error) {
      console.error('Error fetching all incidents for admin:', error);
      throw error;
    }
  }

  /**
   * Create a new incident
   * @param {Object} incidentData - Incident data
   * @returns {Promise<Object>} Response with status message
   */
  async createIncident(incidentData) {
    try {
      return await this.post('', incidentData);
    } catch (error) {
      console.error('Error creating incident:', error);
      throw error;
    }
  }

  /**
   * Update an existing incident
   * @param {number} id - Incident ID
   * @param {Object} incidentData - Updated incident data
   * @returns {Promise<Object>} Response with status message
   */
  async updateIncident(id, incidentData) {
    try {
      return await this.put(`${id}`, incidentData);
    } catch (error) {
      console.error(`Error updating incident ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an incident
   * @param {number} id - Incident ID
   * @returns {Promise<Object>} Response with status message
   */
  async deleteIncident(id) {
    try {
      return await this.deleteItem(`${id}`);
    } catch (error) {
      console.error(`Error deleting incident ${id}:`, error);
      throw error;
    }
  }
}

export default new IncidentAdminService();
