<script>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useMapStore } from '@/stores/map/mapStore';
import { storeToRefs } from 'pinia';
import { Search as SearchIcon } from 'lucide-vue-next';

export default {
  name: 'MapSearchBar',
  components: {
    SearchIcon
  },
  setup() {
    const mapStore = useMapStore();
    const { searchResults, isSearching, searchError } = storeToRefs(mapStore);

    const searchInput = ref('');
    const debounceTimeout = ref(null);
    const autoSearchTimeout = ref(null);
    // Add ref for the search container
    const searchContainerRef = ref(null);

    // Format address components
    const formatAddress = (address) => {
      if (!address) return '';

      const parts = [];

      if (address.road) {
        parts.push(address.road + (address.house_number ? ' ' + address.house_number : ''));
      }

      const locality = address.city || address.town || address.village || address.hamlet;
      if (locality) {
        if (address.postcode) {
          parts.push(address.postcode + ' ' + locality);
        } else {
          parts.push(locality);
        }
      }

      return parts.join(', ');
    };

    // Trigger the search immediately
    const triggerSearch = () => {
      if (searchInput.value.trim()) {
        mapStore.searchPlaces(searchInput.value);
      }
    };

    // Handle keydown events
    const onKeyDown = (event) => {
      // Reset the auto-search timeout every time the user types
      clearTimeout(autoSearchTimeout.value);

      if (event.key === 'Enter') {
        // Search immediately on Enter
        triggerSearch();
      } else if (event.key === 'Escape') {
        clearSearch();
      } else {
        // Set up auto-search after 1 second of inactivity
        autoSearchTimeout.value = setTimeout(() => {
          if (searchInput.value.trim().length >= 3) {
            triggerSearch();
          }
        }, 1000);
      }
    };

    // Clear search input and results
    const clearSearch = () => {
      searchInput.value = '';
      mapStore.searchResults = [];
      mapStore.searchError = null;
      mapStore.clearSearchResultMarker();

      // Clear the timeouts
      clearTimeout(debounceTimeout.value);
      clearTimeout(autoSearchTimeout.value);
    };

    // Select a search result
    const selectResult = (result) => {
      mapStore.selectSearchResult(result);
      searchInput.value = result.name;
    };

    // Close search results when clicking outside
    const handleClickOutside = (event) => {
      // Use the ref instead of class selector
      if (searchContainerRef.value && !searchContainerRef.value.contains(event.target)) {
        mapStore.searchResults = [];
      }
    };

    // Add click outside listener
    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    // Clean up listener
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
      clearTimeout(debounceTimeout.value);
      clearTimeout(autoSearchTimeout.value);
    });

    // Clear search results when input is empty
    watch(searchInput, (newValue) => {
      if (!newValue || newValue.trim() === '') {
        mapStore.searchResults = [];
        mapStore.searchError = null;
      }
    });

    return {
      searchInput,
      searchResults,
      isSearching,
      searchError,
      searchContainerRef,
      triggerSearch,
      onKeyDown,
      clearSearch,
      selectResult,
      formatAddress
    };
  }
};
</script>

<template>
  <div ref="searchContainerRef" class="relative w-full max-w-full md:max-w-[400px] z-[1001]">
    <div class="relative flex items-center">
      <input
        v-model="searchInput"
        type="search"
        placeholder="Søk etter adresse eller sted..."
        class="w-full py-2 px-3 md:py-2.5 md:px-4 border-none rounded-lg bg-white shadow-md text-xs md:text-sm transition-shadow focus:outline-none focus:shadow-lg [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:hidden"
        @keydown="onKeyDown"
        :disabled="isSearching"
      />
      <div v-if="isSearching" class="absolute right-3 w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      <button
        v-else-if="searchInput"
        class="absolute right-10 bg-transparent border-none text-gray-500 text-lg cursor-pointer p-0 flex items-center justify-center w-[18px] h-[18px] hover:text-gray-700"
        @click="clearSearch"
        aria-label="Tøm søk"
      >
        ×
      </button>
      <button
        v-if="searchInput && !isSearching"
        class="absolute right-3 bg-transparent border-none cursor-pointer p-0 flex items-center justify-center w-6 h-6"
        @click="triggerSearch"
        aria-label="Søk"
      >
        <SearchIcon class="text-gray-600 transition-colors hover:text-black" size="16" />
      </button>
    </div>

    <!-- Search results dropdown -->
    <div v-if="searchResults.length > 0" class="absolute top-full left-0 right-0 bg-white rounded-b-lg shadow-lg mt-1 max-h-[250px] md:max-h-[300px] overflow-y-auto z-[2000]">
      <div
        v-for="result in searchResults"
        :key="result.id"
        class="py-2.5 px-3 md:py-3 md:px-4 cursor-pointer border-b border-gray-100 last:border-b-0 last:rounded-b-lg transition-colors hover:bg-gray-50"
        @click="selectResult(result)"
      >
        <div class="font-medium text-xs md:text-sm mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{{ result.name }}</div>
        <div class="text-[10px] md:text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
          {{ formatAddress(result.address) }}
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="searchError" class="bg-red-50 text-red-600 py-2 px-3 rounded-md mt-2 text-xs md:text-sm shadow-md">
      {{ searchError }}
    </div>
  </div>
</template>
