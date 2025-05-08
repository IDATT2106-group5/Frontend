<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  title: String,
  description: String,
  confirmText: { type: String, default: 'Bekreft' },
  cancelText: { type: String, default: 'Avbryt' },
  showCancel: { type: Boolean, default: true }
})

const emit = defineEmits(['confirm', 'cancel'])
const confirmButtonRef = ref(null)

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('cancel')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  if (confirmButtonRef.value) {
    confirmButtonRef.value.focus()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center"
       role="dialog"
       aria-modal="true"
       aria-labelledby="modal-title">
    <div class="fixed inset-0 bg-black/50" @click="emit('cancel')"></div>

    <div class="relative z-10 bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
      <div class="p-6">
        <h3 id="modal-title" class="text-lg font-medium text-gray-900">{{ title }}</h3>
        <p class="mt-2 text-sm text-gray-500">{{ description }}</p>

        <div class="mt-4 flex justify-end space-x-3">
          <button
            v-if="showCancel"
            @click="emit('cancel')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {{ cancelText }}
          </button>
          <button
            ref="confirmButtonRef"
            @click="emit('confirm')"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
