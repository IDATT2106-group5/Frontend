<script setup>
defineProps({
  title: String,
  description: String
})
</script>

<template>
    <div class="flex items-start gap-4">
      <!-- Icon -->
      <div class="text-[#2c3e50]">
        <slot name="icon" />
      </div>
      <div>
        <h2 class="text-lg font-semibold text-[#2c3e50]">{{ title }}</h2>
        <p class="text-sm text-[#2c3e50] opacity-70 py-3">{{ description }}</p>
      </div>
    </div>
  </template>
