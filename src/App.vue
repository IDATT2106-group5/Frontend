<script setup>
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
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

    <NavBar v-if="!route.meta.hideNavbar" />
  </div>
  <RouterView />
  <Toaster />
</template>

