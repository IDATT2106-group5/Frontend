<script setup>
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
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
  <!-- Navbar outside, unaffected -->
  <Navbar v-if="!route.meta.hideNavbar" />

  <!-- Page content + sticky footer wrapper -->
  <div class="flex flex-col min-h-screen">
    <!-- Main view fills space -->
    <div class="flex-1">
      <RouterView />
    </div>
    <!-- Footer always at bottom -->
    <Footer v-if="!route.meta.hideFooter" />
  </div>
</template>
