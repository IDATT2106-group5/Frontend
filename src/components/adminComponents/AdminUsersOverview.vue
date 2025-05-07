<script>
import { useAdminStore } from '@/stores/AdminStore'
import { useUserStore } from '@/stores/UserStore'
import AdminService from '@/service/adminService'

export default {
  /**
   * Setup function for the component
   * @returns {Object} Properties and stores accessible in the template
   */
  setup() {
    /**
     * Initializes the admin store and user store
     */

    const adminStore = useAdminStore()
    const userStore = useUserStore()

    if (userStore.isSuperAdmin) {
      adminStore.fetchAdmins()
    }

    return {
      adminStore,
      userStore
    }
  },

  methods: {
    /**
     * Sends a password reset request for an administrator
     * @async
     * @param {string} email - The email address of the administrator
     * @returns {Promise<void>}
     */
    async sendNewPassword(email) {
      try {
        await AdminService.resetPassword(email)
        alert(`Nytt passord sendt til: ${email}`)
      } catch (error) {
        console.error('Failed to reset password:', error)
        alert('Kunne ikke sende nytt passord: ' + (error.message || 'Ukjent feil'))
      }
    },

    /**
     * Deletes an administrator from the system after confirmation
     * @async
     * @param {Object} admin - The administrator object to delete
     * @param {number} admin.id - The unique identifier of the administrator
     * @param {string} admin.email - The email address of the administrator
     * @returns {Promise<void>}
     */
    async deleteAdmin(admin) {
      if (!confirm(`Er du sikker på at du vil slette ${admin.email}?`)) {
        return
      }

      try {
        await AdminService.deleteAdmin(admin.id)
        await this.adminStore.fetchAdmins()
      } catch (error) {
        console.error('Failed to delete admin:', error)
        alert('Kunne ikke slette administrator: ' + (error.message || 'Ukjent feil'))
      }
    }
  }
}
</script>

<template>
  <div class="bg-white rounded shadow">
    <div v-if="adminStore.isLoading" class="text-center py-4">
      <p class="text-gray-600">Laster administratorer...</p>
    </div>

    <div v-else-if="adminStore.error" class="bg-red-50 text-red-700 p-4 rounded mb-4">
      {{ adminStore.error }}
    </div>

    <div v-else>
      <div v-for="admin in adminStore.admins" :key="admin.email"
           class="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0">
        <div class="text-black">{{ admin.email }}</div>

        <div class="flex items-center">
          <div v-if="admin.role === 'SUPERADMIN'" class="text-black mr-4">Super Admin</div>

          <template v-if="admin.role !== 'SUPERADMIN'">
            <button @click="sendNewPassword(admin.email)"
                    class="text-blue-600 hover:text-blue-800 mr-4 font-medium">
              Send nytt passord
            </button>

            <button @click="deleteAdmin(admin)"
                    class="text-red-600 hover:text-red-800 font-medium">
              Slett
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

