<script setup>
import InviteNewAdmin from "@/components/adminComponents/InviteNewAdmin.vue";
import AdminUserOverview from "@/components/adminComponents/AdminUsersOverview.vue";
import { useUserStore } from '@/stores/UserStore'

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
      <div class="max-w-4xl mx-auto space-y-8">
        <div class="flex justify-center">
          <InviteNewAdmin @invite-admin="handleInvite" />
        </div>

        <AdminUserOverview />
      </div>
    </div>
</template>
