<script setup>
import { ShoppingBasket, Apple, Droplet, Pill, Package, UsersRound } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <header class="bg-[#f3f3f3] text-[#2c3e50] px-8 py-4 shadow flex items-center justify-center">
    <nav class="flex gap-8 items-center text-lg font-medium">
      <a href="#" class="flex items-center gap-2 hover:underline focus:outline-none">
        <ShoppingBasket class="w-6 h-6 text-[#2c3e50]" />
        Lager innhold
      </a>
      <a href="#" class="flex items-center gap-2 hover:underline focus:outline-none">
        <Apple class="w-6 h-6 text-[#2c3e50]" />
        Mat
      </a>
      <a href="#" class="flex items-center gap-2 hover:underline">
        <Droplet class="w-6 h-6 text-[#2c3e50]" />
        Væske
      </a>
      <a href="#" class="flex items-center gap-2 hover:underline">
        <Pill class="w-6 h-6 text-[#2c3e50]" />
        Medisiner
      </a>
      <a href="#" class="flex items-center gap-2 hover:underline">
        <Package class="w-6 h-6 text-[#2c3e50]" />
        Diverse
      </a>
      <a href="#" class="flex items-center gap-2 hover:underline">
        <UsersRound class="w-6 h-6 text-[#2c3e50]" />
        Meldemmer i husstand
      </a>
    </nav>
  </header>
</template>
