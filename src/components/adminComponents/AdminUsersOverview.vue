<script>
import { useAdminStore } from '@/stores/AdminStore'
import { useUserStore } from '@/stores/UserStore'
import AdminService from '@/service/adminService'
import ConfirmModal from '@/components/householdMainView/modals/ConfirmModal.vue'
import { ref } from 'vue'

export default {
  components: {
    ConfirmModal
  },

  /**
   * Setup function for the component
   * @returns {Object} Properties and stores accessible in the template
   */
  setup() {
    const adminStore = useAdminStore()
    const userStore = useUserStore()

    // Add state for the modal
    const showDeleteModal = ref(false)
    const adminToDelete = ref(null)
    const errorMessage = ref('')
    const isDeleting = ref(false)

    if (userStore.isSuperAdmin) {
      adminStore.fetchAdmins()
    }

    return {
      adminStore,
      userStore,
      showDeleteModal,
      adminToDelete,
      errorMessage,
      isDeleting
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
        console.error('Kunne ikke tilbakestille passord:', error)
        alert('Kunne ikke sende nytt passord: ' + (error.message || 'Ukjent feil'))
      }
    },

    /**
     * Opens the confirmation modal for deleting an administrator
     * @param {Object} admin - The administrator to delete
     */
    openDeleteModal(admin) {
      this.adminToDelete = admin
      this.showDeleteModal = true
      this.errorMessage = ''
    },

    /**
     * Cancel the delete operation and close the modal
     */
    cancelDelete() {
      this.showDeleteModal = false
      this.adminToDelete = null
    },

    /**
     * Confirm and execute the delete operation
     * @async
     */
    async confirmDelete() {
      if (!this.adminToDelete) return

      this.isDeleting = true
      this.errorMessage = ''
      this.showDeleteModal = false

      try {
        await AdminService.deleteAdmin(this.adminToDelete.id)
        await this.adminStore.fetchAdmins()
        this.adminToDelete = null
      } catch (error) {
        console.error('Failed to delete admin:', error)
        this.errorMessage = error.message || 'Ukjent feil'
      } finally {
        this.isDeleting = false
      }
    }
  }
}
</script>

<template>
  <div class="bg-white rounded shadow">
    <div v-if="adminStore.isLoading" class="text-center py-4">
      <p class="text-gray-600">Loading administrators...</p>
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

            <button @click="openDeleteModal(admin)"
                    class="text-red-600 hover:text-red-800 font-medium">
              Slett
            </button>
          </template>
        </div>
      </div>
    </div>

    <ConfirmModal
      v-if="showDeleteModal && adminToDelete"
      title="Confirm deletion"
      :description="`Er du sikker på at du vil slette ${adminToDelete.email}?`"
      confirmText="Slett"
      cancelText="Tilbake"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <div v-if="errorMessage" class="p-3 bg-red-100 text-red-700 rounded m-4">
      Kunne ikke slette administrator: {{ errorMessage }}
    </div>
  </div>
</template>

