<script setup>
import { onMounted } from "vue";
import InviteNewAdmin from "@/components/adminComponents/InviteNewAdmin.vue";
import AdminUserOverview from "@/components/adminComponents/AdminUsersOverview.vue";
import { useUserStore } from '@/stores/UserStore'
import { useRouter } from 'vue-router'
import { useAdminStore } from "@/stores/AdminStore";

const router = useRouter()
const userStore = useUserStore()
const adminStore = useAdminStore()

function handleInvite(adminData) {
  console.log('New admin invitation:', adminData);
  const response = adminStore.inviteNewAdmin(adminData)
  console.log(response)
}

onMounted(async () => {
  if (!userStore.isSuperAdmin) {
    return router.push('/not-authorized')
  }
})
</script>

<template>
  <div class="min-h-screen p-6 bg-gray-100">
    <div class="flex justify-center">
      <h1 class="text-4xl font-semibold text-black mb-6 max-w-6xl mx-auto">Administrer Admin Brukere</h1>
    </div>

    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
      <div class="md:w-1/3 flex flex-col">
        <div class="flex justify-center">
          <h2 class="text-2xl font-bold mb-4 text-center md:text-left">Invitere Ny Admin</h2>
        </div>
        <div class="flex justify-center md:justify-start">
          <InviteNewAdmin @invite-admin="handleInvite" />
        </div>
      </div>

      <div class="md:w-2/3 flex flex-col">
        <div class="flex justify-center">
          <h2 class="text-2xl font-bold mb-4 text-center md:text-left">Administratorer</h2>
        </div>
        <AdminUserOverview />
      </div>
    </div>
  </div>
</template>
