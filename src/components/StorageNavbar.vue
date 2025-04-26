<script setup>
import { ShoppingBasket, Apple, Droplet, Pill, Package, UsersRound } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <header class="bg-white text-black px-8 py-10 flex items-center justify-center">
    <nav class="flex gap-8 items-center text-lg font-medium">
      <a href="#" class="flex items-center gap-2 hover:underline focus:outline-none">
        <ShoppingBasket class="w-6 h-6 text-black" />
        Lager innhold
      </a>
      <a href="#" class="flex items-center gap-2 hover:underline focus:outline-none">
        <Apple class="w-6 h-6 text-black" />
        Mat
      </a>
      <a href="#" class="flex items-center gap-2 hover:underline">
        <Droplet class="w-6 h-6 text-black" />
        Væske
      </a>
      <a href="#" class="flex items-center gap-2 hover:underline">
        <Pill class="w-6 h-6 text-black" />
        Medisiner
      </a>
      <a href="#" class="flex items-center gap-2 hover:underline">
        <Package class="w-6 h-6 text-black" />
        Diverse
      </a>
      <a href="#" class="flex items-center gap-2 hover:underline">
        <UsersRound class="w-6 h-6 text-black" />
        Meldemmer i husstand
      </a>
    </nav>
  </header>
</template>
