<script setup>
import { Newspaper, Globe, ShoppingCart, User } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="bg-[#2c3e50] text-white px-8 py-4 shadow flex items-center justify-between">
    <div class="flex items-center gap-2">
      <img src="/src/assets/icons/Krisefikser.png" alt="Logo" class="w-10 h-10 bg-gray-300" />
    </div>

    <nav class="flex gap-8 items-center text-sm font-medium">
      <a href="#" class="flex items-center gap-2 hover:underline focus:outline-none">
        <Newspaper class="w-5 h-5 text-white" />
        Nyheter
      </a>
      <a href="#" class="flex items-center gap-2 hover:underline focus:outline-none">
        <Globe class="w-5 h-5 text-teal-300" />
        Kart
      </a>
      <a href="#" class="flex items-center gap-2 hover:underline">
        <ShoppingCart class="w-5 h-5 text-yellow-400" />
        Min beholdning
      </a>
      <a href="#" class="flex items-center gap-2 hover:underline">
        <User class="w-5 h-5 text-orange-400" />
        Min husstand
      </a>
    </nav>

  <RouterLink to="/login">
    <Button variant="outline" class="text-white border-white bg-[#2c3e50] text-white hover:bg-gray-300">
      Login
    </Button>
  </RouterLink>
  </header>
</template>
