<script setup>
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import { useRoute } from 'vue-router'
import Toaster from '@/components/ui/toast/Toaster.vue'

const route = useRoute()
</script>

<template>
  <div>
    <Navbar v-if="!route.meta.hideNavbar" />
  </div>
  <RouterView />
  <Toaster />
</template>

