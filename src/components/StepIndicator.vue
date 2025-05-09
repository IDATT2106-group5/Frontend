<!-- src/components/StepIndicator.vue -->
<script setup>
import { useRoute } from 'vue-router'

/**
 * Vue Router's current route object.
 * Provides access to the current path, params, query, etc.
 * @type {import('vue-router').RouteLocationNormalizedLoaded}
 */
const route = useRoute()

/**
 * Checks if the given path matches the current route's path.
 *
 * @param {string} path - The path to compare with the current route.
 * @returns {boolean} `true` if the given path matches the current route's path, `false` otherwise.
 */
const isActive = (path) => route.path === path
</script>

<template>
  <div class="mt-10 flex items-center justify-center space-x-10 text-sm">
    <!-- Før -->
    <router-link
      to="/before"
      class="flex flex-col items-center space-y-1 cursor-pointer"
      :class="isActive('/before') ? '' : 'opacity-50 hover:opacity-100 transition transform hover:scale-110'"
    >
      <div
        :class="isActive('/before')
          ? 'w-5 h-5 rounded-full bg-[#2c3e50]'
          : 'w-5 h-5 rounded-full border-2 border-gray-400'"
      ></div>
      <span :class="isActive('/before') ? 'font-semibold' : ''">Før</span>
    </router-link>

    <!-- Under -->
    <router-link
      to="/under"
      class="flex flex-col items-center space-y-1 cursor-pointer"
      :class="isActive('/under') ? '' : 'opacity-50 hover:opacity-100 transition transform hover:scale-110'"
    >
      <div
        :class="isActive('/under')
          ? 'w-5 h-5 rounded-full bg-[#2c3e50]'
          : 'w-5 h-5 rounded-full border-2 border-gray-400'"
      ></div>
      <span :class="isActive('/under') ? 'font-semibold' : ''">Under</span>
    </router-link>

    <!-- Etter -->
    <router-link
      to="/after"
      class="flex flex-col items-center space-y-1 cursor-pointer"
      :class="isActive('/after') ? '' : 'opacity-50 hover:opacity-100 transition transform hover:scale-110'"
    >
      <div
        :class="isActive('/after')
          ? 'w-5 h-5 rounded-full bg-[#2c3e50]'
          : 'w-5 h-5 rounded-full border-2 border-gray-400'"
      ></div>
      <span :class="isActive('/after') ? 'font-semibold' : ''">Etter</span>
    </router-link>
  </div>
</template>
