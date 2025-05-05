<script setup>
import { inject, ref } from 'vue'
import { useHouseholdStore } from '@/stores/HouseholdStore'
import { ShoppingBasket, Apple, Droplet, Pill, Package, Hammer, UsersRound, Menu } from 'lucide-vue-next'

const handleNavItemClick = inject('handleNavItemClick')
const activeCategory = ref('all')
const isMenuOpen = ref(false)

const householdStore = useHouseholdStore()

const onNavItemClick = (category) => {
  activeCategory.value = category
  if (handleNavItemClick) {
    handleNavItemClick(category)
  }
  isMenuOpen.value = false
}
</script>

<template>
  <header class="bg-white text-black px-4 sm:px-8 py-4 sm:py-6 shadow-md">
    <nav class="flex justify-between items-center relative">
      <!-- Left side: Main navigation (desktop) -->
      <div class="hidden sm:flex gap-6 items-center text-sm font-medium">
        <a href="#" @click.prevent="onNavItemClick('all')" class="flex items-center gap-2 hover:underline transition-transform transform hover:scale-105 active:scale-95">
          <ShoppingBasket class="w-5 h-5 transition-colors duration-300"
                          :class="{ 'fill-yellow-500': activeCategory === 'all', 'text-black': activeCategory !== 'all' }" />
          Lager
        </a>
        <a href="#" @click.prevent="onNavItemClick('væske')" class="flex items-center gap-2 hover:underline transition-transform transform hover:scale-105 active:scale-95">
          <Droplet class="w-5 h-5 transition-colors duration-300"
                   :class="{ 'fill-blue-500': activeCategory === 'væske', 'text-black': activeCategory !== 'væske' }" />
          Væske
        </a>
        <a href="#" @click.prevent="onNavItemClick('mat')" class="flex items-center gap-2 hover:underline transition-transform transform hover:scale-105 active:scale-95">
          <Apple class="w-5 h-5 transition-colors duration-300"
                 :class="{ 'fill-red-500': activeCategory === 'mat', 'text-black': activeCategory !== 'mat' }" />
          Mat
        </a>
        <a href="#" @click.prevent="onNavItemClick('medisiner')" class="flex items-center gap-2 hover:underline transition-transform transform hover:scale-105 active:scale-95">
          <Pill class="w-5 h-5 transition-colors duration-300"
                :class="{ 'fill-red-600': activeCategory === 'medisiner', 'text-black': activeCategory !== 'medisiner' }" />
          Medisiner
        </a>
        <a href="#" @click.prevent="onNavItemClick('redskap')" class="flex items-center gap-2 hover:underline transition-transform transform hover:scale-105 active:scale-95">
          <Hammer class="w-5 h-5 transition-colors duration-300"
                  :class="{ 'fill-gray-500': activeCategory === 'redskap', 'text-black': activeCategory !== 'redskap' }" />
          Redskap
        </a>
        <a href="#" @click.prevent="onNavItemClick('diverse')" class="flex items-center gap-2 hover:underline transition-transform transform hover:scale-105 active:scale-95">
          <Package class="w-5 h-5 transition-colors duration-300"
                   :class="{ 'fill-amber-500': activeCategory === 'diverse', 'text-black': activeCategory !== 'diverse' }" />
          Diverse
        </a>
      </div>

      <!-- Right side: Medlemmer -->
      <div class="flex items-center gap-2 text-sm sm:text-base font-medium">
        <UsersRound class="w-5 h-5 sm:w-5 sm:h-5 text-black" />
        <a href="#" class="hover:underline">
          Antall medlemmer i husstand: {{ householdStore.totalMemberCount }}
        </a>
      </div>

      <!-- Hamburger menu (mobile) - now on right side -->
      <button @click="isMenuOpen = !isMenuOpen" class="sm:hidden focus:outline-none ml-auto">
        <Menu class="w-6 h-6 text-black" />
      </button>

      <!-- Mobile menu - full dropdown with all options -->
      <div v-if="isMenuOpen" class="absolute top-full right-0 w-full bg-white shadow-md sm:hidden z-50">
        <div class="flex flex-col px-4 py-4 gap-4 text-sm font-medium">
          <a href="#" @click.prevent="onNavItemClick('all')" class="flex items-center gap-2 hover:underline">
            <ShoppingBasket class="w-5 h-5 transition-colors duration-300"
                            :class="{ 'fill-yellow-500': activeCategory === 'all', 'text-black': activeCategory !== 'all' }" />
            Lager
          </a>
          <a href="#" @click.prevent="onNavItemClick('væske')" class="flex items-center gap-2 hover:underline">
            <Droplet class="w-5 h-5 transition-colors duration-300"
                     :class="{ 'fill-blue-500': activeCategory === 'væske', 'text-black': activeCategory !== 'væske' }" />
            Væske
          </a>
          <a href="#" @click.prevent="onNavItemClick('mat')" class="flex items-center gap-2 hover:underline">
            <Apple class="w-5 h-5 transition-colors duration-300"
                   :class="{ 'fill-red-500': activeCategory === 'mat', 'text-black': activeCategory !== 'mat' }" />
            Mat
          </a>
          <a href="#" @click.prevent="onNavItemClick('medisiner')" class="flex items-center gap-2 hover:underline">
            <Pill class="w-5 h-5 transition-colors duration-300"
                  :class="{ 'fill-red-600': activeCategory === 'medisiner', 'text-black': activeCategory !== 'medisiner' }" />
            Medisiner
          </a>
          <a href="#" @click.prevent="onNavItemClick('redskap')" class="flex items-center gap-2 hover:underline">
            <Hammer class="w-5 h-5 transition-colors duration-300"
                    :class="{ 'fill-gray-500': activeCategory === 'redskap', 'text-black': activeCategory !== 'redskap' }" />
            Redskap
          </a>
          <a href="#" @click.prevent="onNavItemClick('diverse')" class="flex items-center gap-2 hover:underline">
            <Package class="w-5 h-5 transition-colors duration-300"
                     :class="{ 'fill-amber-500': activeCategory === 'diverse', 'text-black': activeCategory !== 'diverse' }" />
            Diverse
          </a>
        </div>
      </div>
    </nav>
  </header>
</template>