<script setup>
import { computed, onMounted, ref } from 'vue'
import { useNewsStore } from '@/stores/news/NewsStore.js'

const newsStore = useNewsStore()
const currentPage = ref(0)
const pageSize = ref(5)
const totalPages = ref(0)

const currentFilter = ref('all')

/**
 * Fetches paginated news items when the component is mounted.
 */
onMounted(() => {
  fetchPaginatedNews()
  newsStore.loadReadStatusFromLocalStorage()
})

/**
 * Fetches news items with pagination from the backend.
 */
function fetchPaginatedNews() {
  newsStore
    .fetchPaginatedNews(currentPage.value, pageSize.value)
    .then((response) => {
      if (response && response.totalPages) {
        totalPages.value = response.totalPages
      }
    })
    .catch((error) => {
      console.error('Error fetching paginated news:', error)
    })
}

/**
 * Formats a date string into a localized Norwegian date and time format.
 *
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date and time string in 'no-NO' locale.
 */
function formatDate(dateString) {
  try {
    if (!dateString) return 'Unknown date'

    const date = new Date(dateString)

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }

    return new Intl.DateTimeFormat('no-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error, dateString)
    return 'Invalid date'
  }
}

/**
 * Marks a news item as read and opens its URL in a new tab.
 *
 * @param {Object} news - The news item to mark as read.
 */
function markAsRead(news) {
  newsStore.markAsRead(news.id)
  window.open(news.url, '_blank')
}

/**
 * Computes the filtered list of news items based on the current filter.
 * - 'all': Returns all news items.
 * - 'unread': Returns only unread news items.
 * - 'read': Returns only read news items.
 *
 * @returns {Array} The filtered list of news items.
 */
const allFilteredNews = computed(() => {
  const allNews = newsStore.getAllNews || []

  if (currentFilter.value === 'all') return allNews
  if (currentFilter.value === 'unread') return allNews.filter((item) => !item.read)
  if (currentFilter.value === 'read') return allNews.filter((item) => item.read)
  return []
})

/**
 * Computes the visible news items based on the number of items to show.
 *
 * @returns {Array} The visible news items.
 */
const filteredNews = computed(() => {
  return allFilteredNews.value
})

/**
 * Increases the number of news items to display by 5.
 */
const loadMore = () => {
  currentPage.value += 1
  fetchPaginatedNews()
}

/**
 * Checks if there are more news items to display.
 *
 * @returns {boolean} True if there are more items to display, false otherwise.
 */
const hasMoreItems = computed(() => {
  return totalPages.value - 1 > currentPage.value
})
</script>

<template>
  <div class="max-w-3xl mx-auto p-4">
    <h1 class="text-3xl font-bold text-center mb-6">Alle nyheter</h1>

    <!-- Radio buttons for filtering news items -->
    <div class="flex items-center justify-center gap-4 mb-6">
      <label> <input type="radio" v-model="currentFilter" value="all" name="filter" /> Alle </label>
      <label>
        <input type="radio" v-model="currentFilter" value="unread" name="filter" /> Uleste
      </label>
      <label>
        <input type="radio" v-model="currentFilter" value="read" name="filter" /> Leste
      </label>
    </div>

    <!-- List of filtered news items -->
    <div
      v-for="(news, index) in filteredNews"
      :key="index"
      class="border rounded-lg p-4 mb-4 shadow-sm fill-white bg-white"
      :class="{ 'border-blue-400': !news.read, 'border-white': news.read }"
    >
      <h2 class="font-bold text-lg mb-1">{{ news.title }}</h2>
      <p class="text-sm text-gray-500 mb-2">{{ news.source }} | {{ formatDate(news.createdAt) }}</p>
      <p class="text-gray-800 mb-4">{{ news.content }}</p>
      <button
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        @click="markAsRead(news)"
      >
        Les mer
      </button>
    </div>

    <!-- Load more button -->
    <div class="text-center mt-6">
      <button
        v-if="hasMoreItems"
        @click="loadMore"
        class="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700"
      >
        Last inn mer
      </button>
    </div>
  </div>
</template>
