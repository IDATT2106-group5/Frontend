<script>
import { useNewsStore } from '@/stores/news/NewsStore'

export default {
  name: 'NewsManagement',

  /**
   * Setup composition API and initialize required stores
   * @returns {Object} The initialized store
   */
  setup() {
    // Initialize the store
    const newsStore = useNewsStore()
    return { newsStore }
  },

  /**
   * Component data
   * @returns {Object} Component data
   */
  data() {
    return {
      /** @type {Boolean} Flag to show/hide the add news form */
      showAddNewsForm: false,

      /** @type {Boolean} Flag to indicate editing mode */
      isEditing: false,

      /** @type {Object} Current news item being created or edited */
      currentNews: {
        title: '',
        source: 'Trondheim Kommune',
        content: '',
        publishDate: '',
        publishTime: '',
        url: '',
        isCrisis: false
      }
    }
  },

  /**
   * Computed properties
   */
  computed: {
    /**
     * Get all news items from the store
     * @returns {Array} Array of news items
     */
    newsItems() {
      return this.newsStore.getAllNews
    },

    /**
     * Check if news items are being loaded
     * @returns {Boolean} True if loading, false otherwise
     */
    isLoading() {
      return this.newsStore.isLoading
    },

    /**
     * Check if there is an error
     * @returns {Boolean} True if there is an error, false otherwise
     */
    hasError() {
      return this.newsStore.getError !== null
    },

    /**
     * Get error message
     * @returns {String} Error message
     */
    errorMessage() {
      return this.newsStore.getError ? this.newsStore.getError.message : ''
    }
  },

  /**
   * Lifecycle hook - component mounted
   */
  async mounted() {
    // Set default date and time to current date and time
    const now = new Date();
    this.currentNews.publishDate = this.formatDate(now);
    this.currentNews.publishTime = this.formatTime(now);

    // Fetch all news from the API when component is mounted
    await this.newsStore.fetchAllNews();
  },

  /**
   * Component methods
   */
  methods: {
    /**
     * Format date to YYYY-MM-DD format
     * @param {Date} date - The date to format
     * @returns {String} Formatted date string
     */
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    /**
     * Format time to HH:MM format
     * @param {Date} date - The date to extract time from
     * @returns {String} Formatted time string
     */
    formatTime(date) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    },

    /**
     * Toggle the crisis state of a news item
     * @param {Object} newsItem - The news item to toggle
     * @returns {Promise<void>}
     */
    async toggleCrisisState(newsItem) {
      try {
        const updatedNewsData = {
          ...newsItem,
          isCrisis: !newsItem.isCrisis
        };
        await this.newsStore.updateNews(newsItem.id, updatedNewsData);
      } catch (error) {
        console.error('Failed to toggle crisis state:', error);
      }
    },

    /**
     * Set up form for editing a news item
     * @param {Object} newsItem - The news item to edit
     */
    editNewsItem(newsItem) {
      this.isEditing = true;
      this.newsStore.selectNews(newsItem.id);

      // Prepare form data from the selected news
      const selectedNews = this.newsStore.getSelectedNews;
      if (selectedNews) {
        // Extract date and time from timestamp if available
        let publishDate = this.formatDate(new Date());
        let publishTime = this.formatTime(new Date());

        if (selectedNews.timestamp) {
          const timestampParts = selectedNews.timestamp.split(' ');
          if (timestampParts.length === 2) {
            const dateParts = timestampParts[0].split('/');
            if (dateParts.length === 3) {
              // Convert from DD/MM/YY to YYYY-MM-DD
              publishDate = `20${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
            }
            publishTime = timestampParts[1];
          }
        }

        this.currentNews = {
          ...selectedNews,
          publishDate,
          publishTime
        };

        this.showAddNewsForm = true;
      }
    },

    /**
     * Cancel form and reset state
     */
    cancelForm() {
      this.resetForm();
    },

    /**
     * Reset form to default state
     */
    resetForm() {
      this.isEditing = false;
      this.showAddNewsForm = false;
      this.currentNews = {
        title: '',
        source: 'Trondheim Kommune',
        content: '',
        url: '',
        isCrisis: false
      };
    },

    /**
     * Save current news item (create new or update existing)
     * @returns {Promise<void>}
     */
    async saveNewsItem() {
      // Create a timestamp from the date and time
      const timestamp = this.formatTimestamp(this.currentNews.publishDate, this.currentNews.publishTime);

      const newsItem = {
        ...this.currentNews,
        timestamp
      };

      try {
        if (this.isEditing && this.newsStore.getSelectedNews) {
          // Update existing news
          await this.newsStore.updateNews(this.newsStore.getSelectedNews.id, newsItem);
        } else {
          // Create new news
          await this.newsStore.createNews(newsItem);
        }

        this.resetForm();
      } catch (error) {
        console.error('Failed to save news item:', error);
      }
    },

    /**
     * Format date and time to timestamp (DD/MM/YY HH:MM)
     * @param {String} dateStr - Date in YYYY-MM-DD format
     * @param {String} timeStr - Time in HH:MM format
     * @returns {String} Formatted timestamp
     */
    formatTimestamp(dateStr, timeStr) {
      // Convert YYYY-MM-DD to DD/MM/YY
      const dateParts = dateStr.split('-');
      if (dateParts.length === 3) {
        const day = dateParts[2];
        const month = dateParts[1];
        const year = dateParts[0].slice(2); // Get last 2 digits of year
        return `${day}/${month}/${year} ${timeStr}`;
      }
      return `${dateStr} ${timeStr}`;
    }
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-4 text-gray-800">
    <h1 class="text-2xl font-bold mb-6">Nyhetshåndtering</h1>

    <!-- News List Section -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">Alle nyheter</h2>
      <div class="flex justify-end mb-6">
        <button
          @click="showAddNewsForm = true"
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-200"
        >
          + Opprett nyhet
        </button>
      </div>

      <div v-if="isLoading" class="py-8 text-center">
        <p class="text-gray-600">Laster inn nyheter...</p>
      </div>

      <div v-else-if="hasError" class="py-8 text-center">
        <p class="text-red-600 mb-4">Feil ved lasting av nyheter: {{ errorMessage }}</p>
        <button
          @click="newsStore.fetchAllNews"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-200"
        >
          Prøv igjen
        </button>
      </div>

      <div v-else class="space-y-4">
        <div v-for="newsItem in newsItems" :key="newsItem.id" class="border border-gray-200 rounded p-4 flex justify-between items-center">
          <div>
            <h3 class="text-lg font-medium">{{ newsItem.title }}</h3>
            <p class="text-sm text-gray-500">{{ newsItem.source }} | {{ newsItem.timestamp }}</p>
          </div>
          <div class="flex gap-3">
            <button
              @click="toggleCrisisState(newsItem)"
              class="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm transition duration-200"
            >
              {{ newsItem.isCrisis ? 'Fjern som krisehåndtering' : 'Gjør om til krisehåndtering' }}
            </button>
            <button
              @click="editNewsItem(newsItem)"
              class="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm transition duration-200"
            >
              Rediger
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Add/Edit News Form -->
    <section v-if="showAddNewsForm || isEditing" class="bg-gray-100 border border-gray-200 rounded p-6 mt-6">
      <h2 class="text-xl font-semibold mb-4">{{ isEditing ? 'Rediger' : 'Opprett' }} Nyhet</h2>

      <div class="mb-4">
        <label for="title" class="block font-medium mb-1">Tittel</label>
        <input
          type="text"
          id="title"
          v-model="currentNews.title"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>

      <div class="mb-4">
        <label for="source" class="block font-medium mb-1">Kilde</label>
        <input
          type="text"
          id="source"
          v-model="currentNews.source"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>

      <div class="mb-4">
        <label for="content" class="block font-medium mb-1">Innhold</label>
        <textarea
          id="content"
          v-model="currentNews.content"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="5"
        ></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label for="publishDate" class="block font-medium mb-1">Publiseringsdato</label>
          <input
            type="date"
            id="publishDate"
            v-model="currentNews.publishDate"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div>
          <label for="publishTime" class="block font-medium mb-1">Tid</label>
          <input
            type="time"
            id="publishTime"
            v-model="currentNews.publishTime"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
      </div>

      <div class="mb-4">
        <label for="url" class="block font-medium mb-1">URL</label>
        <input
          type="text"
          id="url"
          v-model="currentNews.url"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>

      <div class="flex justify-end gap-4 mt-6">
        <button
          @click="cancelForm"
          class="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition duration-200"
        >
          Avbryt
        </button>
        <button
          @click="saveNewsItem"
          class="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded transition duration-200"
        >
          Lagre
        </button>
      </div>
    </section>
  </div>
</template>