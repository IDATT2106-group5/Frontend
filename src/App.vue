<script setup>
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import { useRoute } from 'vue-router'
import Toaster from '@/components/ui/toast/Toaster.vue'
import { useUserStore } from '@/stores/UserStore'
import { onBeforeMount } from 'vue'  

const userStore = useUserStore()
const route = useRoute()

onBeforeMount(() => {
  userStore.autoLogin()
})
</script>

<template>
  <div>
    
    <Navbar v-if="!route.meta.hideNavbar" />
  </div>
  <RouterView />
  <Toaster />
</template>

