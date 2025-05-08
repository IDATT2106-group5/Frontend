<script>
import ConfirmModal from '@/components/householdMainView/modals/ConfirmModal.vue'
import { ref, reactive } from 'vue'

export default {
  components: {
    ConfirmModal
  },

  props: {
    admins: {
      type: Array,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  setup() {
    const showDeleteModal = ref(false)
    const adminToDelete = ref(null)
    const showPasswordModal = ref(false)
    const adminEmailForPassword = ref('')
    const successfulResets = reactive({})
    const isResettingPassword = ref(false)
    const isDeleting = ref(false)

    return {
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
     * Emits reset-password event to parent
     * @async
     */
    async confirmPasswordReset() {
      if (!this.adminEmailForPassword) return

      this.showPasswordModal = false
      this.isResettingPassword = true

      this.$emit('reset-password', this.adminEmailForPassword)

      this.successfulResets[this.adminEmailForPassword] = true

      setTimeout(() => {
        this.successfulResets[this.adminEmailForPassword] = false
      }, 60000)

      this.isResettingPassword = false
      this.adminEmailForPassword = ''
    },

    /**
     * Opens the confirmation modal for deleting an administrator
     * @param {Object} admin - The administrator to delete
     */
    openDeleteModal(admin) {
      this.adminToDelete = admin
      this.showDeleteModal = true
    },

    /**
     * Cancel the delete operation and close the modal
     */
    cancelDelete() {
      this.showDeleteModal = false
      this.adminToDelete = null
    },

    /**
     * Emits delete-admin event to parent
     * @async
     */
    async confirmDelete() {
      if (!this.adminToDelete) return

      this.showPasswordModal = false
      this.isDeleting = true

      this.$emit('delete-admin', this.adminToDelete)

      this.isDeleting = false
      this.adminToDelete = null
    },

    /**
     * Marks a reset as failed for UI feedback
     * @param {string} email - Email address of the admin
     */
    markResetFailed(email) {
      if (this.successfulResets[email]) {
        this.successfulResets[email] = false
      }
    }
  }
}
</script>

<template>
  <div class="bg-white rounded shadow">
    <div v-if="isLoading" class="text-center py-4">
      <p class="text-gray-600">Laster administratorer...</p>
    </div>

    <div v-else>
      <div v-for="admin in admins" :key="admin.email"
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

