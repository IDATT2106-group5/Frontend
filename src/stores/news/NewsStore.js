import { defineStore } from 'pinia'
import NewsService from '@/service/news/newsService'

/**
 * Store for managing news data and state
 */
export const useNewsStore = defineStore('news', {
  state: () => ({
    news: [],
    loading: false,
    error: null,
    selectedNews: null,
  }),

  getters: {
    /**
     * Returns all news items from the store
     * @returns {Array} Array of news objects
     */
    getAllNews: (state) => state.news,

    /**
     * Returns the currently selected news item
     * @returns {Object|null} The selected news item or null if none selected
     */
    getSelectedNews: (state) => state.selectedNews,

    /**
     * Returns the loading state
     * @returns {boolean} True if news items are being loaded, false otherwise
     */
    isLoading: (state) => state.loading,

    /**
     * Returns any error that occurred during news operations
     * @returns {Error|null} The error or null if no error occurred
     */
    getError: (state) => state.error,

    /**
     * Retrieves unread news items.
     * @param {Object} state - The current state of the store.
     * @returns {Array} Unread news items.
     */
    unreadNews: (state) => state.newsItems.filter((item) => !item.read),

    /**
     * Retrieves read news items.
     * @param {Object} state - The current state of the store.
     * @returns {Array} Read news items.
     */
    readNews: (state) => state.newsItems.filter((item) => item.read),
  },

  actions: {
    /**
     * Fetches all news items from the API and updates the store
     * @async
     */
    async fetchAllNews() {
      this.loading = true
      this.error = null

      try {
        this.news = await NewsService.getAllNews()
      } catch (error) {
        console.error('[NewsStore] Failed to fetch news:', error)
        this.error = error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetches a single news item by its ID from the API
     * @async
     * @param {number} id - The ID of the news item to fetch
     * @returns {Promise<Object>} The fetched news item
     */
    async fetchNewsById(id) {
      this.loading = true;
      this.error = null;

      try {
        const newsItem = await NewsService.getNewsById(id);
        // Update the selected news item with the fetched data
        this.selectedNews = newsItem;
        return newsItem;
      } catch (error) {
        console.error('[NewsStore] Failed to fetch news by ID:', error);
        this.error = error;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Selects a news item by its ID
     * @param {number} id - The ID of the news item to select
     */
    selectNews(id) {
      this.selectedNews = this.news.find((newsItem) => newsItem.id === id) || null
    },

    /**
     * Creates a new news item and updates the store
     * @async
     * @param {Object} newsData - The data for the new news item
     * @returns {Promise<Object>} The result of the operation
     */
    async createNews(newsData) {
      this.loading = true
      this.error = null

      try {
        const result = await NewsService.createNews(newsData)
        // Refresh news items to get the newly created one with its server-assigned ID
        await this.fetchAllNews()
        return result
      } catch (error) {
        console.error('[NewsStore] Failed to create news item:', error)
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Updates an existing news item and refreshes the store
     * @async
     * @param {number} id - The ID of the news item to update
     * @param {Object} newsData - The updated news data
     * @returns {Promise<Object>} The result of the operation
     */
    async updateNews(id, newsData) {
      this.loading = true
      this.error = null

      try {
        const result = await NewsService.updateNews(id, newsData)
        // Refresh news items to get the updated data
        await this.fetchAllNews()
        // If this was the selected news item, update it
        if (this.selectedNews && this.selectedNews.id === id) {
          this.selectNews(id)
        }
        return result
      } catch (error) {
        console.error('[NewsStore] Failed to update news item:', error)
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    saveReadStatusToLocalStorage() {
      const readIds = this.newsItems.filter((item) => item.read).map((item) => item.id)
      localStorage.setItem('readNewsIds', JSON.stringify(readIds))
    },

    /**
     * Loads the read status of news items from localStorage.
     */
    loadReadStatusFromLocalStorage() {
      try {
        const readIdsString = localStorage.getItem('readNewsIds')
        if (readIdsString) {
          const readIds = JSON.parse(readIdsString)
          this.newsItems.forEach((item) => {
            item.read = readIds.includes(item.id)
          })
        }
      } catch (error) {
        console.error('Error loading read status from localStorage:', error)
      }
    },
    /**
     * Marks a news item as read and updates localStorage.
     * @param {number} id - The ID of the news item to mark as read.
     */
    markAsRead(id) {
      console.log('Marking as read:', id)
      const item = this.newsItems.find((news) => news.id === id)
      if (item) {
        item.read = true
        this.saveReadStatusToLocalStorage()
      }
    },

    /**
     * Resets the store state
     */
    resetState() {
      this.news = []
      this.loading = false
      this.error = null
      this.selectedNews = null
    },
  },
})