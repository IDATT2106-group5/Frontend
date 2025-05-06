<script setup>
import InviteNewAdmin from "@/components/adminComponents/InviteNewAdmin.vue";
import AdminUserOverview from "@/components/adminComponents/AdminUsersOverview.vue";

function handleInvite(adminData) {
  console.log('New admin invitation:', adminData);
  // TODO: Add API logic here
}
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
