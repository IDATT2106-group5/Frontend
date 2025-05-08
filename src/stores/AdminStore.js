import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/UserStore'
import AdminService from '@/service/adminService'
import RegisterAdminService from '@/service/admin/registerAdminService'
import IncidentService from '@/service/incidentService'
import adminService from '@/service/adminService'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    admins: [],
    incidents: [],
    isLoading: false,
    error: null
  }),

  actions: {

    /**
     * Fetches the list of admins from the server.
     *
     * This method retrieves all admin users and sorts them based on their roles and email addresses.
     * Only users with the "SUPERADMIN" role are authorized to perform this action.
     *
     * Sorting logic:
     * - Admins with the "SUPERADMIN" role are prioritized at the top.
     * - Admins are then sorted alphabetically by their email addresses.
     *
     * @async
     * @function fetchAdmins
     * @throws {Error} Logs an error message if the fetch operation fails.
     * @returns {void}
     */
    async fetchAdmins() {
      const userStore = useUserStore()
      if (!userStore.isSuperAdmin) {
        console.warn('[AdminStore] Access denied: only SUPERADMIN can fetch admins.')
        return
      }

      try {
        this.isLoading = true
        const data = await AdminService.getAllAdmins()

        this.admins = data.sort((a, b) => {
          if (a.role === 'SUPERADMIN' && b.role !== 'SUPERADMIN') return -1
          if (b.role === 'SUPERADMIN' && a.role !== 'SUPERADMIN') return 1
          return a.email.localeCompare(b.email)
        })
      } catch (err) {
        console.error('[AdminStore] Failed to fetch admins:', err)
        this.error = err.message || 'Noe gikk galt ved henting av admins'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetches all incidents from the IncidentService and updates the store.
     * Only accessible to users with ADMIN or SUPERADMIN roles.
     *
     * @async
     * @function fetchIncidents
     * @throws {Error} Throws an error if the fetch operation fails.
     * @returns {void}
     */
    async fetchIncidents() {
      const userStore = useUserStore()
      if (!userStore.isAdmin) {
        console.warn('[AdminStore] Access denied: only ADMIN or SUPERADMIN can fetch incidents.')
        return
      }
      try {
        this.isLoading = true
        const data = await IncidentService.getAllIncidents()
        this.incidents = data
      } catch (err) {
        console.error('[AdminStore] Failed to fetch incidents:', err)
        this.error = err.message || 'Noe gikk galt ved henting av hendelser'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Sends an invitation to a new admin using the provided admin data.
     *
     * @async
     * @param {Object} adminData - The data of the admin to be invited.
     * @param {string} adminData.email - The email address of the admin.
     * @param {string} adminData.name - The name of the admin.
     * @returns {Promise<Object|null>} The response from the invite service if successful, or null if no response.
     * @throws {Error} Throws an error if the invitation process fails.
     */
    async inviteNewAdmin(adminData) {
      this.isLoading = true
      this.error = null
      try {
        const response = await RegisterAdminService.inviteAdmin(adminData)

        if (response) {
          console.log("[Response from Invite] ", response)
          return response
        }
        return null
      } catch (error) {
        console.error('[AdminStore] Failed to invite new admin:', error)
        this.error = error.message || 'Noe gikk galt ved invitasjon av ny admin'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Resets the password for an admin user by sending a request to the admin service.
     *
     * @async
     * @function
     * @param {string} email - The email address of the admin user whose password needs to be reset.
     * @returns {Promise<Object|null>} A promise that resolves to the response object if the deletion is successful, or null if no response is received.
     * @throws {Error} Throws an error if the deletion fails.
     */
    async resetPasswordAdmin(email) {
      this.isLoading = true
      this.error = null
      try {
        const response = await adminService.resetPassword(email)

        if (response) {
          console.log("[Response from password reset] ", response)
          return response
        }
        return null
      } catch (error) {
        console.error('[AdminStore] Failed to reset password:', error)
        this.error = error.message || 'Noe gikk galt ved tilbakestilling av passord'
        throw error
      } finally {
        this.isLoading = false
      }
    },


    /**
     * Deletes an admin user by their ID.
     *
     * @async
     * @function deleteAdmin
     * @param {string} adminId - The unique identifier of the admin user to be deleted.
     * @returns {Promise<Object|null>} A promise that resolves to the response object if the deletion is successful, or null if no response is received.
     * @throws {Error} Throws an error if the deletion fails, with the error message stored in `this.error`.
     */
    async deleteAdmin(adminId) {
      this.isLoading = true
      this.error = null
      try {
        const response = await adminService.deleteAdmin(adminId)

        if (response) {
          console.log("[Response from delete admin] ", response)
          return response
        }
        return null
      } catch (error) {
        console.error('[AdminStore] Failed to delete Admin user:', error)
        this.error = error.message || 'Noe gikk galt ved sletting av admin bruker'
        throw error
      } finally {
        this.isLoading = false
      }
    },
  }
})
