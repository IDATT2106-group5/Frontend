<script setup>
import { onMounted } from "vue";
import InviteNewAdmin from "@/components/adminComponents/InviteNewAdmin.vue";
import AdminUserOverview from "@/components/adminComponents/AdminUsersOverview.vue";
import { useUserStore } from '@/stores/UserStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

function handleInvite(adminData) {
  console.log('New admin invitation:', adminData);
  // TODO: Add API logic here
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
      <h1 class="text-4xl font-semibold text-black mb-6 max-w-6xl mx-auto">Administrer admin-brukere</h1>
    </div>
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
      <div class="md:w-1/3 flex justify-center md:justify-start md:items-start">
        <InviteNewAdmin @invite-admin="handleInvite" />
      </div>

      <div class="md:w-2/3">
        <AdminUserOverview />
      </div>
    </div>
  </div>
</template>
