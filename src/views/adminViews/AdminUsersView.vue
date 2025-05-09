<script setup>
import { ref, onMounted, computed } from "vue";
import InviteNewAdmin from "@/components/adminComponents/InviteNewAdmin.vue";
import AdminUserOverview from "@/components/adminComponents/AdminUsersOverview.vue";
import { useUserStore } from '@/stores/UserStore'
import { useRouter } from 'vue-router'
import { useAdminStore } from "@/stores/AdminStore";
import { CheckCircle, XCircle, Loader } from 'lucide-vue-next';
import { toast } from '@/components/ui/toast/index.js'

const router = useRouter()
const userStore = useUserStore()
const adminStore = useAdminStore()

const successMessage = ref('')
const showSuccess = computed(() => !!successMessage.value)
const clearSuccessTimeout = ref(null)
const inviteFormRef = ref(null)
const adminUsersOverviewRef = ref(null)

/**
 * Shows a success message temporarily
 * @param {string} message - The success message to display
 */
function showSuccessMessage(message) {
  successMessage.value = message

  if (clearSuccessTimeout.value) clearTimeout(clearSuccessTimeout.value)

  clearSuccessTimeout.value = setTimeout(() => {
    successMessage.value = ''
  }, 5000)
}

/**
 * Handles the process of inviting a new admin user.
 *
 * @param {Object} adminData - The data of the admin user to be invited.
 * @param {string} adminData.email - The email address of the admin user.
 * @param {string} adminData.fullName - The name of the admin user.
 */
async function handleInvite(adminData) {
  try {
    successMessage.value = ''

    const response = await adminStore.inviteNewAdmin(adminData)

    if (response && response.message) {
      showSuccessMessage(response.message)
      adminStore.fetchAdmins()
    }
  } catch (error) {
    console.error("Error inviting admin:", error)
  } finally {
    inviteFormRef.value.resetForm()
  }
}

/**
 * Handles password reset requests
 * @param {string} email - Email address of the admin
 */
async function handlePasswordReset(email) {
  console.log('Password reset requested for:', email)

  try {
    const response = adminStore.resetPasswordAdmin(email)

    if (response) {
      toast({
        title: 'Nytt passord sendt',
        description: `Du sendte nytt passord til: ${email}`,
        variant: 'success',
      })
    }
  } catch (error) {
    console.error('Kunne ikke tilbakestille passord:', error);
    toast({
      title: 'Feil',
      description: `Klarte ikke sende nytt passord til: ${email}`,
      variant: 'destructive',
    })
  }

  if (adminUsersOverviewRef.value) {
    adminUsersOverviewRef.value.markResetFailed(email);
  }
}

/**
 * Handles admin deletion requests
 * @param {Object} admin - The admin to delete
 */
async function handleAdminDelete(admin) {
  try {
    const response = adminStore.deleteAdmin(admin.id)

    if (response) {
      showSuccessMessage(`Admin ${admin.email} har blitt slettet`)
      toast({
        title: `Admin slettet`,
        description: `Admin ${admin.email} har blitt slettet`,
        variant: 'success',
      })
    }
    await adminStore.fetchAdmins();

  } catch (error) {
    console.error('Failed to delete admin:', error);
    toast({
      title: 'Feil',
      description: `Kunne ikke slette admin ${admin.email}`,
      variant: 'destructive',
    })
  } finally {
    adminStore.isLoading = false;
  }
}

onMounted(async () => {
  if (!userStore.isSuperAdmin) {
    return router.push('/not-authorized')
  }

  adminStore.fetchAdmins();
})
</script>

<template>
  <div class="min-h-screen p-6 bg-gray-100">
    <div class="flex justify-center">
      <h1 class="text-4xl font-semibold text-black mb-6 max-w-6xl mx-auto">Administrer Admin Brukere</h1>
    </div>

    <div class="flex justify-center">
      <div v-if="adminStore.isLoading" class="mb-4 p-3 bg-blue-50 text-blue-700 rounded flex items-center justify-center">
        <Loader class="h-5 w-5 mr-2 animate-spin" />
        <span>Laster...</span>
      </div>

      <div v-else-if="showSuccess" class="mb-4 p-3 bg-green-100 text-green-700 rounded flex items-center">
        <CheckCircle class="h-5 w-5 mr-2" />
        <span>{{ successMessage }}</span>
      </div>

      <div v-else-if="adminStore.error" class="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center">
        <XCircle class="h-5 w-5 mr-2" />
        <span>{{ adminStore.error }}</span>
      </div>
    </div>

    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
      <div class="md:w-1/3 flex flex-col">
        <div class="flex justify-center">
          <h2 class="text-2xl font-bold mb-4 text-center md:text-left">Invitere Ny Admin</h2>
        </div>
        <div class="flex justify-center md:justify-start">
          <InviteNewAdmin
            ref="inviteFormRef"
            @invite-admin="handleInvite"
          />
        </div>
      </div>

      <div class="md:w-2/3 flex flex-col">
        <div class="flex justify-center">
          <h2 class="text-2xl font-bold mb-4 text-center md:text-left">Administratorer</h2>
        </div>
        <AdminUserOverview
          ref="adminUsersOverviewRef"
          :admins="adminStore.admins"
          :isLoading="adminStore.isLoading"
          @reset-password="handlePasswordReset"
          @delete-admin="handleAdminDelete"
        />
      </div>
    </div>
  </div>
</template>
