<template>
  <div class="search-container">
    <div class="search-input-container">
      <input
        v-model="searchInput"
        type="search"
        placeholder="Søk etter adresse eller sted..."
        class="search-input"
        @input="onSearch"
        @keydown="onKeyDown"
        :disabled="isSearching"
      />
      <div v-if="isSearching" class="search-spinner"></div>
      <button
        v-else-if="searchInput"
        class="search-clear-button"
        @click="clearSearch"
        aria-label="Tøm søk"
      >
        ×
      </button>
    </div>

    <!-- Search results dropdown -->
    <div v-if="searchResults.length > 0" class="search-results">
      <div
        v-for="result in searchResults"
        :key="result.id"
        class="search-result-item"
        @click="selectResult(result)"
      >
        <div class="search-result-name">{{ result.name }}</div>
        <div class="search-result-address">
          {{ formatAddress(result.address) }}
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="searchError" class="search-error">
      {{ searchError }}
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useMapStore } from '@/stores/map/mapStore';
import { storeToRefs } from 'pinia';

export default {
  name: 'MapSearchBar',
  setup() {
    const mapStore = useMapStore();
    const { searchResults, isSearching, searchError } = storeToRefs(mapStore);

    const searchInput = ref('');
    const debounceTimeout = ref(null);

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

    // Handle search input with debounce
    const onSearch = () => {
      clearTimeout(debounceTimeout.value);

      debounceTimeout.value = setTimeout(() => {
        if (searchInput.value.trim()) {
          mapStore.searchPlaces(searchInput.value);
        }
      }, 300);
    };

    // Handle keydown events
    const onKeyDown = (event) => {
      if (event.key === 'Enter') {
        clearTimeout(debounceTimeout.value);
        if (searchInput.value.trim()) {
          mapStore.searchPlaces(searchInput.value);
        }
      } else if (event.key === 'Escape') {
        clearSearch();
      }
    };

    // Clear search input and results
    const clearSearch = () => {
      searchInput.value = '';
      mapStore.searchResults = [];
      mapStore.searchError = null;
      mapStore.clearSearchResultMarker();
    };

    // Select a search result
    const selectResult = (result) => {
      mapStore.selectSearchResult(result);
      searchInput.value = result.name;
    };

    // Close search results when clicking outside
    const handleClickOutside = (event) => {
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer && !searchContainer.contains(event.target)) {
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
      onSearch,
      onKeyDown,
      clearSearch,
      selectResult,
      formatAddress
    };
  }
};
</script>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  z-index: 1001;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 10px 36px 10px 16px;
  border: none;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  transition: box-shadow 0.2s ease;
}

.search-input:focus {
  outline: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.search-spinner {
  position: absolute;
  right: 12px;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.search-clear-button {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #777;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

.search-clear-button:hover {
  color: #333;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 2000;
}

.search-result-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.search-result-item:last-child {
  border-bottom: none;
  border-radius: 0 0 8px 8px;
}

.search-result-item:hover {
  background-color: #f8f8f8;
}

.search-result-name {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-result-address {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-error {
  background-color: #fff3f3;
  color: #e53935;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 8px;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .search-container {
    max-width: 100%;
  }

  .search-input {
    padding: 8px 32px 8px 12px;
    font-size: 13px;
  }

  .search-result-item {
    padding: 10px 12px;
  }
}
</style>
