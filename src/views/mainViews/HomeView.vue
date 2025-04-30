<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/UserStore'

const userStore = useUserStore()

onMounted(async () => {
  if (!userStore.user) {
    userStore.autoLogin()
    await userStore.fetchUser()
  }
})
</script>


<template>
  <main>
    <TheWelcome />
  </main>
</template>
