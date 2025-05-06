<script setup>
import { ref, watch } from 'vue';

/**
 * Emits events to parent component
 * @type {Function}
 */
const emit = defineEmits(['search']);

/**
 * Reactive reference to store the current search input value
 * @type {import('vue').Ref<string>}
 */
const searchInput = ref('');

/**
 * Timeout ID for the debounce mechanism
 * @type {number|null}
 */
let debounceTimeout = null;

/**
 * Handles the search with debounce functionality
 * Emits the search event after a delay to prevent excessive API calls
 * @returns {void}
 */
const onSearch = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    emit('search', searchInput.value);
  }, 300);
};

/**
 * Handles keyboard events in the search input
 * Immediately triggers search on Enter key press
 * @param {KeyboardEvent} event - The keyboard event
 * @returns {void}
 */
const onKeyDown = (event) => {
  if (event.key === 'Enter') {
    clearTimeout(debounceTimeout);
    emit('search', searchInput.value);
  }
};

/**
 * Watches for changes in the search input
 * Triggers search on input change or clears search on empty input
 * @type {import('vue').WatchStopHandle}
 */
watch(searchInput, (newValue) => {
  if (newValue === '') {
    clearTimeout(debounceTimeout);
    emit('search', '');
  } else {
    onSearch();
  }
});
</script>

<template>
  <div class="w-full max-w-md mx-auto">
    <div class="relative">
      <input
        v-model="searchInput"
        type="search"
        placeholder="Søk..."
        class="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2c3e50]"
        @input="onSearch"
        @keydown="onKeyDown"
      />

    </div>
  </div>
</template>