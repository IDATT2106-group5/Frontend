<template>
  <div class="max-w-3xl mx-auto p-4">
    <h1 class="text-3xl font-bold text-center mb-6">Alle nyheter</h1>

    <div class="flex items-center justify-center gap-4 mb-6">
      <label>
        <input type="radio" v-model="currentFilter" value="all" name="filter" /> Alle
      </label>
      <label>
        <input type="radio" v-model="currentFilter" value="unread" name="filter" /> Uleste
      </label>
      <label>
        <input type="radio" v-model="currentFilter" value="read" name="filter" /> Leste
      </label>
    </div>

    <div
      v-for="(news, index) in filteredNews"
      :key="index"
      class="border rounded-lg p-4 mb-4 shadow-sm fill-white bg-white"
      :class="{ 'border-blue-200': !news.read, 'border-white': news.read }"
    >
      <h2 class="font-bold text-lg mb-1">{{ news.title }}</h2>
      <p class="text-sm text-gray-500 mb-2">{{ news.source }} | {{ formatDate(news.created_at) }}</p>
      <p class="text-gray-800 mb-4">{{ news.content }}</p>
      <button
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        @click="markAsRead(news)"
      >
        Les mer
      </button>
    </div>

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

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useNewsStore } from '@/stores/NewsStore.js'

const newsStore = useNewsStore()
const itemsToShow = ref(5)
const currentFilter = ref('all')

onMounted(() => {
  newsStore.fetchNews()
})

function formatDate(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('no-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function markAsRead(news) {
  newsStore.markAsRead(news.id)
  window.open(news.url, '_blank')
}

const allFilteredNews = computed(() => {
  if (currentFilter.value === 'all') return newsStore.allNews
  if (currentFilter.value === 'unread') return newsStore.unreadNews
  if (currentFilter.value === 'read') return newsStore.readNews
  return []
})

const filteredNews = computed(() => {
  return allFilteredNews.value.slice(0, itemsToShow.value)
})

const loadMore = () => {
  itemsToShow.value += 5
}

const hasMoreItems = computed(() => {
  return itemsToShow.value < allFilteredNews.value.length
})
</script>
