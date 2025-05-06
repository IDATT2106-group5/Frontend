import { defineStore } from 'pinia'
import AdminService from '@/service/adminService'
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
    }
  }
})
