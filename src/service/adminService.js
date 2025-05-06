// src/service/adminService.js
import BaseService from './baseService'

class AdminService extends BaseService {
  constructor() {
    super('/admin')
  }

  async getAllAdmins() {
    try {
      console.log('[AdminService] Sending request to /admin')
      const response = await this.get('')
      console.log('[AdminService] Received response:', response)
      return response
    } catch (error) {
      console.error('[AdminService] Failed to fetch admins:', error)
      throw error
    }
  }
}

export default new AdminService()
