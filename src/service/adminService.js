import BaseService from './baseService'

/**
 * Service class for handling admin-related API operations
 * @extends BaseService
 */
class AdminService extends BaseService {
  /**
   * Creates an instance of AdminService with the admin API endpoint
   */
  constructor() {
    super('/admin')
  }

  /**
   * Retrieves all administrators from the system
   * @async
   * @returns {Promise<Array>} Promise resolving to an array of admin objects
   * @throws {Error} If the API request fails
   */
  async getAllAdmins() {
    try {
      return await this.get('')
    } catch (error) {
      console.error('[AdminService] Failed to fetch admins:', error)
      throw error
    }
  }

  /**
   * Initiates a password reset process for an administrator
   * @async
   * @param {string} email - The email address of the administrator
   * @returns {Promise<Object>} Promise resolving to the API response
   * @throws {Error} If the password reset request fails
   */
  async resetPassword(email) {
    try {
      return await this.post('reset-password/initiate', { email })
    } catch (error) {
      console.error('[AdminService] Failed to reset password:', error)
      throw error
    }
  }

  /**
   * Deletes an administrator from the system
   * @async
   * @param {number} adminId - The unique identifier of the administrator to delete
   * @returns {Promise<Object>} Promise resolving to the API response with a success message
   * @throws {Error} If the admin deletion request fails
   */
  async deleteAdmin(adminId) {
    try {
      return await this.post('delete', { adminId })
    } catch (error) {
      console.error('[AdminService] Failed to delete admin:', error)
      throw error
    }
  }
}

export default new AdminService()