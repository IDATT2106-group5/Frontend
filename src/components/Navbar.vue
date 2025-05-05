<script setup>
import { Newspaper, Globe, ShoppingCart, User } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { RouterLink, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'

const userStore = useUserStore()
const router = useRouter()

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>
<template>
  <header class="bg-[#2c3e50] text-white px-8 py-4 shadow flex items-center justify-between">
    <!-- Left section: logo -->
    <div class="flex items-center gap-2">
      <RouterLink to="/">
        <img src="/src/assets/icons/Krisefikser.png" alt="Logo" class="w-10 h-10 bg-gray-300" />
      </RouterLink>
    </div>

    <!-- Navigation links -->
    <nav class="flex gap-8 items-center text-sm font-medium">
      <a href="#" class="flex items-center gap-2 hover:underline">
        <Newspaper class="w-5 h-5 text-white" />
        Nyheter
      </a>
      <RouterLink to="/map" class="flex items-center gap-2 hover:underline">
        <Globe class="w-5 h-5 text-white" />
        Kart
      </RouterLink>
<<<<<<< HEAD
      <Routerlink>
=======
      <RouterLink to="/storage">
>>>>>>> 287849bd9533109522a4f0c58701e824ca0f8bdf
      <a href="#" class="flex items-center gap-2 hover:underline">
        <ShoppingCart class="w-5 h-5 text-white" />
        Min beholdning
      </a>
    </RouterLink>
      <RouterLink to="/household">
        <a href="#" class="flex items-center gap-2 hover:underline">
          <User class="w-5 h-5 text-white" />
          Min husstand
        </a>
      </RouterLink>
    </nav>

    <!-- Auth button -->
    <div>
      <template v-if="userStore.token">
        <Button @click="handleLogout" variant="outline" class="text-white border-white bg-[#2c3e50] hover:bg-red-600">
          Logg ut
        </Button>
      </template>
      <template v-else>
        <RouterLink to="/login">
          <Button variant="outline" class="text-white border-white bg-[#2c3e50] hover:bg-gray-300">
            Login
          </Button>
        </RouterLink>
      </template>
    </div>
  </header>
</template>
