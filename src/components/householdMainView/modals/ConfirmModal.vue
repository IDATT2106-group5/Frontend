<script setup>
defineProps({
  title: String,
  description: String,
  confirmText: { type: String, default: 'Bekreft' },
  cancelText: { type: String, default: 'Avbryt' }
})
const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 space-y-4">
      <h3 class="text-lg font-semibold">{{ title }}</h3>
      <p class="text-sm text-gray-600">{{ description }}</p>

      <div class="flex justify-end space-x-2 mt-4">
        <button @click="$emit('cancel')" class="px-3 py-1 border rounded hover:bg-gray-100">
          {{ cancelText }}
        </button>
        <button @click="$emit('confirm')" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>
