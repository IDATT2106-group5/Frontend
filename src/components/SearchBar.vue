<script setup>
import { ref } from 'vue'

const searchQuery = ref('')
</script>

<template>
  <div class="w-full max-w-md mx-auto">
    <input
      v-model="searchQuery"
      type="search"
      placeholder="Search..."
      class="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2
      focus:ring-blue-500"
    />
  </div>
</template>

