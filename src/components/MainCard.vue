<script setup>
  defineProps({
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      required: true
    }
  })
</script>
  


<template>
    <div class="bg-white border-4 border-[#ACACAC] rounded-2xl shadow-lg p-14 w-full max-w-3xl text-center min-h-[800px] flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-center gap-4 mb-3">
          <!-- Calendar Icon -->
          <div class="-ml-20 text-[#2c3e50]">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 class="lucide lucide-calendar">
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
            </svg>
          </div>
          <!-- Title -->
          <h1 class="text-4xl font-extrabold text-[#2c3e50]">{{ title }}</h1>
        </div>
        <!-- Subtitle -->
        <p class="text-base text-gray-600 mb-10">{{ subtitle }}</p>
  
        <!-- Content Slot -->
        <slot />
      </div>
    </div>
  </template>
