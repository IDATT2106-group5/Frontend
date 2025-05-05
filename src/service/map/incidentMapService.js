// src/service/map/incidentMapService.js
import BaseService from '@/service/baseService';

/**
 * Service to handle incidents data
 */
class IncidentMapService extends BaseService {
  constructor() {
    // Pass the endpoint to the BaseService constructor
    super('incidents');
  }

  /**
   * Fetch incidents from API
   * @returns {Promise<Array>} Array of incident objects
   */
  async fetchIncidents() {
    try {
      // Use the BaseService's get method instead of fetch
      return await this.get();
    } catch (error) {
      console.error('Error fetching incidents:', error);
      throw new Error(`Failed to fetch incidents: ${error.message}`);
    }
  }
}

export default new IncidentMapService();
