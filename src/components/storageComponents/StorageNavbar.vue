<script setup>
import { inject, ref } from 'vue'
import { useHouseholdStore } from '@/stores/HouseholdStore.js'
import { ShoppingBasket, Apple, Droplet, Pill, Package, Hammer, UsersRound, Menu } from 'lucide-vue-next'

/**
 * Function injected from parent component to handle navigation item clicks
 * @type {Function|undefined}
 */
const handleNavItemClick = inject('handleNavItemClick')

/**
 * Currently active category for filtering
 * @default 'all'
 */
const activeCategory = ref('all')

/**
 * Controls the visibility of the mobile menu
 * @default false
 */
const isMenuOpen = ref(false)

/**
 * Store for accessing household data and methods
 */
const householdStore = useHouseholdStore()

/**
 * Handles the click event on a navigation item
 * @param {string} category - The category identifier that was clicked
 * @returns {void}
 */
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
      <div class="hidden sm:flex gap-6 items-center text-sm font-medium">
        <a href="#" @click.prevent="onNavItemClick('all')" class="flex items-center gap-2 hover:underline transition-transform transform hover:scale-105 active:scale-95">
          <ShoppingBasket class="w-5 h-5" />
          <span class="relative">
            Lager
            <div v-if="activeCategory === 'all'" class="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
          </span>
        </a>
        <a href="#" @click.prevent="onNavItemClick('væske')" class="flex items-center gap-2 hover:underline transition-transform transform hover:scale-105 active:scale-95">
          <Droplet class="w-5 h-5" />
          <span class="relative">
            Væske
            <div v-if="activeCategory === 'væske'" class="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
          </span>
        </a>
        <a href="#" @click.prevent="onNavItemClick('mat')" class="flex items-center gap-2 hover:underline transition-transform transform hover:scale-105 active:scale-95">
          <Apple class="w-5 h-5" />
          <span class="relative">
            Mat
            <div v-if="activeCategory === 'mat'" class="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
          </span>
        </a>
        <a href="#" @click.prevent="onNavItemClick('medisiner')" class="flex items-center gap-2 hover:underline transition-transform transform hover:scale-105 active:scale-95">
          <Pill class="w-5 h-5" />
          <span class="relative">
            Medisiner
            <div v-if="activeCategory === 'medisiner'" class="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
          </span>
        </a>
        <a href="#" @click.prevent="onNavItemClick('redskap')" class="flex items-center gap-2 hover:underline transition-transform transform hover:scale-105 active:scale-95">
          <Hammer class="w-5 h-5" />
          <span class="relative">
            Redskap
            <div v-if="activeCategory === 'redskap'" class="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
          </span>
        </a>
        <a href="#" @click.prevent="onNavItemClick('diverse')" class="flex items-center gap-2 hover:underline transition-transform transform hover:scale-105 active:scale-95">
          <Package class="w-5 h-5" />
          <span class="relative">
            Diverse
            <div v-if="activeCategory === 'diverse'" class="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
          </span>
        </a>
      </div>

      <div class="flex items-center gap-2 font-small">
        <UsersRound class="w-5 h-5 sm:w-5 sm:h-5 text-black" />
        Antall medlemmer i husstand: {{ householdStore.totalMemberCount }}
      </div>

      <button @click="isMenuOpen = !isMenuOpen" class="sm:hidden focus:outline-none ml-auto">
        <Menu class="w-6 h-6 text-black" />
      </button>

      <div v-if="isMenuOpen" class="absolute top-full right-0 w-full bg-white shadow-md sm:hidden z-50">
        <div class="flex flex-col px-4 py-4 gap-4 text-sm font-medium">
          <a href="#" @click.prevent="onNavItemClick('all')" class="flex items-center gap-2 hover:underline">
            <ShoppingBasket class="w-5 h-5" />
            <span class="relative">
              Lager
              <div v-if="activeCategory === 'all'" class="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
            </span>
          </a>
          <a href="#" @click.prevent="onNavItemClick('væske')" class="flex items-center gap-2 hover:underline">
            <Droplet class="w-5 h-5" />
            <span class="relative">
              Væske
              <div v-if="activeCategory === 'væske'" class="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
            </span>
          </a>
          <a href="#" @click.prevent="onNavItemClick('mat')" class="flex items-center gap-2 hover:underline">
            <Apple class="w-5 h-5" />
            <span class="relative">
              Mat
              <div v-if="activeCategory === 'mat'" class="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
            </span>
          </a>
          <a href="#" @click.prevent="onNavItemClick('medisiner')" class="flex items-center gap-2 hover:underline">
            <Pill class="w-5 h-5" />
            <span class="relative">
              Medisiner
              <div v-if="activeCategory === 'medisiner'" class="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
            </span>
          </a>
          <a href="#" @click.prevent="onNavItemClick('redskap')" class="flex items-center gap-2 hover:underline">
            <Hammer class="w-5 h-5" />
            <span class="relative">
              Redskap
              <div v-if="activeCategory === 'redskap'" class="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
            </span>
          </a>
          <a href="#" @click.prevent="onNavItemClick('diverse')" class="flex items-center gap-2 hover:underline">
            <Package class="w-5 h-5" />
            <span class="relative">
              Diverse
              <div v-if="activeCategory === 'diverse'" class="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
            </span>
          </a>
        </div>
      </div>
    </nav>
  </header>
</template>