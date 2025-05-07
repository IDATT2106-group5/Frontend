import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/UserStore'
import AdminService from '@/service/adminService'
import RegisterAdminService from '@/service/admin/registerAdminService'
import IncidentService from '@/service/incidentService'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    admins: [],
    incidents: [],
    isLoading: false,
    error: null
  }),

  actions: {
    async fetchAdmins() {
      const userStore = useUserStore()
      if (!userStore.isSuperAdmin) {
        console.warn('[AdminStore] Access denied: only SUPERADMIN can fetch admins.')
        return
      }

      try {
        this.isLoading = true
        const data = await AdminService.getAllAdmins()
        this.admins = data
      } catch (err) {
        console.error('[AdminStore] Failed to fetch admins:', err)
        this.error = err.message || 'Noe gikk galt ved henting av admins'
      } finally {
        this.isLoading = false
      }
    },

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

    async inviteNewAdmin(adminData) {
      this.userStore.isLoading = true
      this.userStore.error = null
      try {
        const response = await RegisterAdminService.inviteAdmin(adminData)

        if (response) {
          console.log("[Response from Invite] ", response);
          return true
        }
        return false
      } catch (error) {
        console.error('[AdminStore] Failed to invite new admin:', err)
        this.error = err.message || 'Noe gikk galt ved invitasjon av ny admin'
        return false;
      } finally {
        this.userStore.isLoading = false
      }
    }
  }
})
