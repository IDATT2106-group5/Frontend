<script setup>
import { Newspaper, Globe, ShoppingCart, User, Menu } from 'lucide-vue-next'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { RouterLink, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'

const userStore = useUserStore()
const router = useRouter()

const mobileMenuOpen = ref(false)

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="bg-[#2c3e50] text-white px-6 py-4 shadow">
    <div class="flex items-center justify-between">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-3">
        <img
          src="/src/assets/icons/Krisefikser.png"
          alt="Logo"
          class="h-12 w-auto object-contain bg-white rounded-full p-1"
        />
        <span class="text-xl font-semibold hidden sm:inline">Krisefikser</span>
      </RouterLink>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex gap-8 items-center text-sm font-medium">
        <a href="#" class="flex items-center gap-2 hover:underline">
          <Newspaper class="w-5 h-5 text-white" />
          Nyheter
        </a>
        <RouterLink to="/map" class="flex items-center gap-2 hover:underline">
          <Globe class="w-5 h-5 text-white" />
          Kart
        </RouterLink>
        <a href="#" class="flex items-center gap-2 hover:underline">
          <ShoppingCart class="w-5 h-5 text-white" />
          Min beholdning
        </a>
        <RouterLink to="/household" class="flex items-center gap-2 hover:underline">
          <User class="w-5 h-5 text-white" />
          Min husstand
        </RouterLink>
      </nav>

      <!-- Mobile Menu Button -->
      <button class="md:hidden" @click="mobileMenuOpen = !mobileMenuOpen">
        <Menu class="w-6 h-6 text-white" />
      </button>

      <!-- Auth Button -->
      <div class="hidden md:block ml-4">
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
    </div>

    <!-- Mobile Nav Dropdown -->
    <div v-if="mobileMenuOpen" class="md:hidden mt-4 flex flex-col gap-4 text-sm font-medium">
      <a href="#" class="flex items-center gap-2 hover:underline px-2">
        <Newspaper class="w-5 h-5 text-white" />
        Nyheter
      </a>
      <RouterLink to="/map" class="flex items-center gap-2 hover:underline px-2">
        <Globe class="w-5 h-5 text-white" />
        Kart
      </RouterLink>
      <Routerlink>
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

      <!-- Auth Button on Mobile -->
      <div class="px-2 pt-2">
        <template v-if="userStore.token">
          <Button @click="handleLogout" variant="outline" class="w-full text-white border-white bg-[#2c3e50] hover:bg-red-600">
            Logg ut
          </Button>
        </template>
        <template v-else>
          <RouterLink to="/login">
            <Button variant="outline" class="w-full text-white border-white bg-[#2c3e50] hover:bg-gray-300">
              Login
            </Button>
          </RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>
