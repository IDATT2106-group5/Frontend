// src/service/incidentService.js
import BaseService from './baseService'

class IncidentService extends BaseService {
  constructor() {
    super('/incidents')
  }

  async getAllIncidents() {
    try {
      console.log('[IncidentService] Sending request to /incident')
      const response = await this.get('')
      console.log('[IncidentService] Received response:', response)
      return response
    } catch (error) {
      console.error('[IncidentService] Failed to fetch incidents:', error)
      throw error
    }
  }
}

export default new IncidentService()
