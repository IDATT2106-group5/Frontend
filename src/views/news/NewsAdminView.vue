<script>
import { useNewsStore } from '@/stores/news/NewsStore'
import { Button } from '@/components/ui/button/index.js'
import { toast } from '@/components/ui/toast/index.js'
import ConfirmModal from '@/components/householdMainView/modals/ConfirmModal.vue'
import { ref } from 'vue'

export default {
  name: 'NewsManagement',
  components: { ConfirmModal, Button },

  /**
   * Setup composition API and initialize required stores
   * @returns {Object} The initialized store
   */
  setup() {
    const newsStore = useNewsStore()
    const confirmDeleteOpen = ref(false)
    const newsIdToDelete = ref(null)

    return {
      newsStore,
      confirmDeleteOpen,
      newsIdToDelete
    }
  },

  /**
   * Component data
   * @returns {Object} Component data
   */
  data() {
    return {
      /** @type {Boolean} Flag to show/hide the edit modal */
      showEditModal: false,

      /** @type {Boolean} Flag to indicate editing mode */
      isEditing: false,

      /** @type {Object} Current news item being created or edited */
      currentNews: {
        id: null,
        title: '',
        source: 'Trondheim Kommune',
        content: '',
        publishDate: '',
        publishTime: '',
        url: '',
        isCrisis: false,
      },

      /** @type {Object} Form validation errors */
      validationErrors: {
        title: '',
        content: '',
        url: ''
      },

      /** @type {Boolean} Form submission attempted */
      submitted: false,
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
    },

    /**
     * Check if form is valid
     * @returns {Boolean} True if form is valid, false otherwise
     */
    isFormValid() {
      return !this.validationErrors.title &&
             !this.validationErrors.content &&
             !this.validationErrors.url;
    }
  },

  /**
   * Lifecycle hook - component mounted
   */
  async mounted() {
    await this.newsStore.fetchPaginatedNews(0, 100) // Fetch with pagination
  },

  /**
   * Component methods
   */
  methods: {
    /**
     * Open the edit modal for creating or editing a news item
     * @param {Object|null} newsItem - The news item to edit, or null for new item
     */
    openEditModal(newsItem = null) {
      // Reset validation state
      this.resetValidation();

      if (newsItem) {
        this.isEditing = true
        this.currentNews = {
          ...newsItem,
        }
      } else {
        this.isEditing = false
        this.currentNews = {
          id: null,
          title: '',
          source: 'Trondheim Kommune',
          content: '',
          url: '',
        }
      }

      this.showEditModal = true
    },

    /**
     * Close the modal and reset state
     */
    closeModal() {
      this.showEditModal = false
      this.isEditing = false
      this.resetValidation();
    },

    /**
     * Reset validation state
     */
    resetValidation() {
      this.submitted = false;
      this.validationErrors = {
        title: '',
        content: '',
        url: ''
      };
    },

    /**
     * Validate the form
     * @returns {Boolean} True if form is valid, false otherwise
     */
    validateForm() {
      let isValid = true;

      // Reset validation errors
      this.validationErrors = {
        title: '',
        content: '',
        url: ''
      };

      // Validate title
      if (!this.currentNews.title.trim()) {
        this.validationErrors.title = 'Tittel er påkrevd';
        isValid = false;
      }

      // Validate content
      if (!this.currentNews.content.trim()) {
        this.validationErrors.content = 'Innhold er påkrevd';
        isValid = false;
      }

      // Validate URL
      if (!this.currentNews.url.trim()) {
        this.validationErrors.url = 'URL er påkrevd';
        isValid = false;
      }

      return isValid;
    },

    /**
     * Formats a date string into a localized Norwegian date and time format.
     *
     * @param {string} dateString - The date string to format.
     * @returns {string} The formatted date and time string in 'no-NO' locale.
     */
    formatDate(dateString) {
      try {
        if (!dateString) return 'Unknown date'

        const date = new Date(dateString)

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
    },

    /**
     * Save current news item (create new or update existing)
     * @returns {Promise<void>}
     */
    async saveNewsItem() {
      this.submitted = true;

      // Validate form
      if (!this.validateForm()) {
        return;
      }

      const newsItem = {
        ...this.currentNews,
      };

      try {
        if (this.isEditing && this.currentNews.id) {
          await this.newsStore.updateNews(this.currentNews.id, newsItem);
          toast({
            title: 'Nyhet ble oppdatert',
            description: 'Du har oppdatert en nyhet.',
            variant: 'success',
          });
        } else {
          // Create a new news item
          const result = await this.newsStore.createNews(newsItem);
          toast({
            title: 'Ny nyhet ble lagt til',
            description: 'Du laget en ny nyhet',
            variant: 'success',
          });

          // No need to fetch news again, the store now handles this properly
        }

        this.closeModal();
      } catch (error) {
        console.error('Failed to save news item:', error);
        toast({
          title: 'Feil',
          description: 'Klarte ikke å oppdatere eller lage nyhet.',
          variant: 'destructive',
        });
      }
    },

    /**
     * Open the delete confirmation modal
     * @param {String} newsId - The ID of the news item to delete
     */
    openDeleteConfirm(newsId) {
      this.newsIdToDelete = newsId
      this.confirmDeleteOpen = true
    },

    /**
     * Delete a news item
     */
    async deleteNewsItem() {
      try {
        await this.newsStore.deleteNews(this.newsIdToDelete)
        toast({
          title: 'Nyhet ble slettet',
          description: 'Du har slettet en nyhet.',
          variant: 'success',
        })
        this.confirmDeleteOpen = false
        this.closeModal()
      } catch (error) {
        console.error('Failed to delete news item:', error)
        toast({
          title: 'Feil',
          description: 'Klarte ikke slette nyhet.',
          variant: 'destructive'
        })
      }
    }
  },
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
          @click="openEditModal()"
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
          @click="newsStore.fetchPaginatedNews(0, 100)"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-200"
        >
          Prøv igjen
        </button>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="newsItem in newsItems"
          :key="newsItem.id"
          class="border border-gray-200 rounded p-4 flex justify-between items-center"
        >
          <div>
            <h3 class="text-lg font-medium">{{ newsItem.title }}</h3>
            <p class="text-sm text-gray-500">
              {{ newsItem.source }} | {{ formatDate(newsItem.createdAt) }}
            </p>
            <p v-if="newsItem.isCrisis" class="text-sm text-red-600 font-medium mt-1">Krisenyhet</p>
          </div>
          <div class="flex gap-3">
            <button
              @click="openEditModal(newsItem)"
              class="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm transition duration-200"
            >
              Rediger
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal for Add/Edit News -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4">
        <h2 class="text-xl font-semibold mb-4">
          {{ isEditing ? 'Rediger nyhet' : 'Opprett nyhet' }}
        </h2>

        <div class="mb-4">
          <label for="title" class="block font-medium mb-1">
            Tittel <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            v-model="currentNews.title"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': validationErrors.title }"
          />
          <p v-if="validationErrors.title" class="text-red-500 text-sm mt-1">
            {{ validationErrors.title }}
          </p>
        </div>

        <div class="mb-4">
          <label for="source" class="block font-medium mb-1">Kilde</label>
          <input
            type="text"
            id="source"
            v-model="currentNews.source"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="mb-4">
          <label for="content" class="block font-medium mb-1">
            Innhold <span class="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            v-model="currentNews.content"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': validationErrors.content }"
            rows="5"
          ></textarea>
          <p v-if="validationErrors.content" class="text-red-500 text-sm mt-1">
            {{ validationErrors.content }}
          </p>
        </div>

        <div class="mb-4">
          <label for="url" class="block font-medium mb-1">
            URL <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="url"
            v-model="currentNews.url"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': validationErrors.url }"
          />
          <p v-if="validationErrors.url" class="text-red-500 text-sm mt-1">
            {{ validationErrors.url }}
          </p>
        </div>

        <div class="flex justify-end gap-4 mt-6">
          <button
            v-if="isEditing"
            @click="openDeleteConfirm(currentNews.id)"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition duration-200"
          >
            Slett
          </button>
          <button
            @click="closeModal"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition duration-200"
          >
            Avbryt
          </button>
          <button
            @click="saveNewsItem"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition duration-200"
          >
            Lagre
          </button>

          <ConfirmModal
            v-if="confirmDeleteOpen"
            title="Slett nyhet"
            description="Er du sikker på at du vil slette nyheten? Dette kan ikke angres."
            @cancel="confirmDeleteOpen = false"
            @confirm="deleteNewsItem"
          />
        </div>
      </div>
    </div>
  </div>
</template>
