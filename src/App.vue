<script setup>
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div>
    <Navbar v-if="!route.meta.hideNavbar" />
  </div>
  <RouterView />
</template>

