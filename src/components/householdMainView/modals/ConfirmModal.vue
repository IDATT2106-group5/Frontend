<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * Component props
 * @type {Object}
 * @property {string} [title] - The title of the confirmation dialog
 * @property {string} [description] - Detailed description explaining what the user is confirming
 * @property {string} [confirmText='Bekreft'] - Text for the confirm button
 * @property {string} [cancelText='Avbryt'] - Text for the cancel button
 * @property {boolean} [showCancel=true] - Whether to show the cancel button
 */
const props = defineProps({
  title: String,
  description: String,
  confirmText: { type: String, default: 'Bekreft' },
  cancelText: { type: String, default: 'Avbryt' },
  showCancel: { type: Boolean, default: true }
})

/**
 * Emits events to parent component
 * @type {function[]}
 * @property {function} confirm - Emitted when the user confirms the action
 * @property {function} cancel - Emitted when the user cancels or dismisses the dialog
 */
const emit = defineEmits(['confirm', 'cancel'])

/**
 * Reference to the confirm button element for auto-focus
 * @type {import('vue').Ref<HTMLButtonElement|null>}
 */
const confirmButtonRef = ref(null)

/**
 * Handles keyboard events for the dialog
 * Allows dismissing the dialog with the Escape key
 * @param {KeyboardEvent} event - The keyboard event
 */
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('cancel')
  }
}

/**
 * Lifecycle hook that runs when the component is mounted
 * Sets up event listeners and focuses the confirm button
 */
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)

  if (confirmButtonRef.value) {
    confirmButtonRef.value.focus()
  }
})

/**
 * Lifecycle hook that runs just before the component is unmounted
 * Cleans up event listeners to prevent memory leaks
 */
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
            data-cy="modal-cancel-button"
            @click="emit('cancel')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {{ cancelText }}
          </button>
          <button
            ref="confirmButtonRef"
            @click="emit('confirm')"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
            data-cy="modal-confirm-button"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
