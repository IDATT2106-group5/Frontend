<script setup>
import { ref, watch } from 'vue';

const emit = defineEmits(['search']);
const searchInput = ref('');

let debounceTimeout = null;

const onSearch = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    emit('search', searchInput.value);
  }, 300); // 300ms debounce
};

const onKeyDown = (event) => {
  if (event.key === 'Enter') {
    clearTimeout(debounceTimeout);
    emit('search', searchInput.value);
  }
};

watch(searchInput, (newValue) => {
  if (newValue === '') {
    clearTimeout(debounceTimeout);
    emit('search', '');
  } else {
    onSearch();
  }
});

const clearSearch = () => {
  searchInput.value = '';
  emit('search', '');
};
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