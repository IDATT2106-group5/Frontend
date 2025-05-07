<script>
import { useAdminStore } from '@/stores/AdminStore'
import { useUserStore } from '@/stores/UserStore'
import AdminService from '@/service/adminService'
import ConfirmModal from '@/components/householdMainView/modals/ConfirmModal.vue'
import { ref, reactive } from 'vue'

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

    const showDeleteModal = ref(false)
    const adminToDelete = ref(null)
    const showPasswordModal = ref(false)
    const adminEmailForPassword = ref('')

    const successfulResets = reactive({})

    const isDeleting = ref(false)
    const isResettingPassword = ref(false)

    if (userStore.isSuperAdmin) {
      adminStore.fetchAdmins()
    }

    return {
      adminStore,
      userStore,
      showDeleteModal,
      adminToDelete,
      showPasswordModal,
      adminEmailForPassword,
      successfulResets,
      isDeleting,
      isResettingPassword
    }
  },

  methods: {
    /**
     * Opens password reset confirmation modal
     * @param {string} email - Email of the admin to reset password for
     */
    openPasswordModal(email) {
      this.adminEmailForPassword = email
      this.showPasswordModal = true
    },

    /**
     * Cancels the password reset operation
     */
    cancelPasswordReset() {
      this.showPasswordModal = false
      this.adminEmailForPassword = ''
    },

    /**
     * Confirms and executes the password reset
     * @async
     */
    async confirmPasswordReset() {
      if (!this.adminEmailForPassword) return

      this.isResettingPassword = true
      this.adminStore.error = null;
      this.showPasswordModal = false

      const emailToReset = this.adminEmailForPassword

      try {
        await AdminService.resetPassword(emailToReset)

        this.successfulResets[emailToReset] = true

        setTimeout(() => {
          this.successfulResets[emailToReset] = false
        }, 60000)

      } catch (error) {
        console.error('Kunne ikke tilbakestille passord:', error)
        this.adminStore.error = `Kunne ikke sende nytt passord: ${error.message || 'Ukjent feil'}`
      } finally {
        this.isResettingPassword = false
        this.adminEmailForPassword = ''
      }
    },

    /**
     * Opens the confirmation modal for deleting an administrator
     * @param {Object} admin - The administrator to delete
     */
    openDeleteModal(admin) {
      this.adminToDelete = admin
      this.showDeleteModal = true
      this.adminStore.error = null;
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
      this.adminStore.error = null
      this.showPasswordModal = false

      try {
        await AdminService.deleteAdmin(this.adminToDelete.id)
        await this.adminStore.fetchAdmins()
        this.adminToDelete = null
      } catch (error) {
        console.error('Failed to delete admin:', error)
        this.adminStore.error = error.message || 'Ukjent feil'
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
      <p class="text-gray-600">Laster administratorer...</p>
    </div>

    <div v-else>
      <div v-for="admin in adminStore.admins" :key="admin.email"
           class="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0">
        <div class="text-black">{{ admin.email }}</div>

        <div class="flex items-center">
          <div v-if="admin.role === 'SUPERADMIN'" class="text-black mr-4">Super Admin</div>

          <template v-if="admin.role !== 'SUPERADMIN'">
            <button
              v-if="successfulResets[admin.email]"
              disabled
              class="text-black-600 mr-4 font-medium cursor-default"
            >
              Sendt
            </button>
            <button
              v-else
              @click="openPasswordModal(admin.email)"
              class="text-blue-600 hover:text-blue-800 mr-4 font-medium"
            >
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
      title="Bekreft sletting"
      :description="`Er du sikker på at du vil slette ${adminToDelete.email}?`"
      confirmText="Slett"
      cancelText="Avbryt"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <ConfirmModal
      v-if="showPasswordModal && adminEmailForPassword"
      title="Bekreft passordtilbakestilling"
      :description="`Er du sikker på at du vil sende nytt passord til ${adminEmailForPassword}?`"
      confirmText="Send"
      cancelText="Avbryt"
      @confirm="confirmPasswordReset"
      @cancel="cancelPasswordReset"
    />
  </div>
</template>

