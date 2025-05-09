import { defineStore } from 'pinia'
import NewsService from '@/service/news/newsService'

/**
 * News store definition using Pinia
 * @typedef {Object} NewsItem
 * @property {string|number} id - Unique identifier for the news item
 * @property {boolean} read - Whether the news item has been read
 * @property {string} [title] - Title of the news item
 * @property {string} [content] - Content of the news item
 * @property {Date|string} [createdAt] - Creation date of the news item
 * @property {string} [author] - Author of the news item
 * @property {Object} [...rest] - Any other properties of the news item
 */

/**
 * Pinia store for managing news items
 * @returns {Object} News store instance
 */
export const useNewsStore = defineStore('news', {
  /**
   * State of the news store
   * @returns {Object} Initial state
   * @property {Array<NewsItem>} news - List of news items
   * @property {boolean} loading - Whether the store is loading data
   * @property {Error|null} error - Error that occurred during the last operation
   * @property {NewsItem|null} selectedNews - Currently selected news item
   */
  state: () => ({
    news: [],
    loading: false,
    error: null,
    selectedNews: null,
  }),

  /**
   * Getters for the news store
   */
  getters: {
    /**
     * Get all news items
     * @returns {Array<NewsItem>} All news items
     */
    getAllNews: (state) => state.news,

    /**
     * Get the currently selected news item
     * @returns {NewsItem|null} Selected news item or null if none selected
     */
    getSelectedNews: (state) => state.selectedNews,

    /**
     * Check if the store is currently loading data
     * @returns {boolean} True if loading, false otherwise
     */
    isLoading: (state) => state.loading,

    /**
     * Get the error that occurred during the last operation
     * @returns {Error|null} Error or null if no error occurred
     */
    getError: (state) => state.error,

    /**
     * Get all unread news items
     * @returns {Array<NewsItem>} Unread news items
     */
    unreadNews: (state) => state.news.filter((item) => !item.read),

    /**
     * Get all read news items
     * @returns {Array<NewsItem>} Read news items
     */
    readNews: (state) => state.news.filter((item) => item.read),
  },

  actions: {
    /**
     * Fetches paginated news items from the API
     * @param {number} page - Page number to fetch (0-based)
     * @param {number} size - Number of items per page
     * @returns {Promise<Object>} Object containing news items and pagination info
     * @property {Array<NewsItem>} news - Fetched news items
     * @property {number} totalPages - Total number of pages
     * @property {number} totalElements - Total number of news items
     */
    async fetchPaginatedNews(page, size) {
      this.loading = true;
      this.error = null;

      try {
        const response = await NewsService.fetchPaginatedNews(page, size);

        let readIds = [];
        try {
          const readIdsString = localStorage.getItem('readNewsIds');
          if (readIdsString) {
            readIds = JSON.parse(readIdsString);
          }
        } catch (e) {
          console.error('Error parsing read IDs from localStorage:', e);
        }

        const fetchedNewsItems = (response.news || []).map((item) => ({
          ...item,
          read: readIds.includes(item.id),
        }));

        if (page === 0) {
          this.news = fetchedNewsItems;
        } else {
          const newItems = fetchedNewsItems.filter(
            (newItem) => !this.news.some((existingItem) => existingItem.id === newItem.id)
          );
          this.news = [...this.news, ...newItems];
        }

        return response;
      } catch (error) {
        console.error('[NewsStore] Failed to fetch news:', error);
        this.error = error;
        return { news: [], totalPages: 0, totalElements: 0 };
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetches a specific news item by ID
     * @param {string|number} id - ID of the news item to fetch
     * @returns {Promise<NewsItem>} The fetched news item
     * @throws {Error} If the news item cannot be fetched
     */
    async fetchNewsById(id) {
      this.loading = true
      this.error = null

      try {
        const newsItem = await NewsService.getNewsById(id)
        this.selectedNews = newsItem
        return newsItem
      } catch (error) {
        console.error('[NewsStore] Failed to fetch news by ID:', error)
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Selects a news item by ID from the existing news items
     * @param {string|number} id - ID of the news item to select
     */
    selectNews(id) {
      this.selectedNews = this.news.find((newsItem) => newsItem.id === id) || null
    },

    /**
     * Creates a new news item
     * @param {Object} newsData - Data for the new news item
     * @returns {Promise<NewsItem>} The created news item
     * @throws {Error} If the news item cannot be created
     */
    async createNews(newsData) {
      this.loading = true;
      this.error = null;

      try {
        const result = await NewsService.createNews(newsData);

        if (result && result.id) {
          this.news.unshift({
            ...result,
            read: false
          });
        } else {
          await this.fetchPaginatedNews(0, 100);
        }

        return result;
      } catch (error) {
        console.error('[NewsStore] Failed to create news item:', error);
        this.error = error;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Updates an existing news item
     * @param {string|number} id - ID of the news item to update
     * @param {Object} newsData - New data for the news item
     * @returns {Promise<NewsItem>} The updated news item
     * @throws {Error} If the news item cannot be updated
     */
    async updateNews(id, newsData) {
      this.loading = true
      this.error = null

      try {
        const result = await NewsService.updateNews(id, newsData)
        const index = this.news.findIndex((item) => item.id === id)
        if (index !== -1) {
          this.news[index] = {
            ...this.news[index],
            ...newsData,
          }
        }

        if (this.selectedNews && this.selectedNews.id === id) {
          this.selectedNews = { ...this.selectedNews, ...newsData }
        }

        await this.fetchPaginatedNews(1, 10);
        return result
      } catch (error) {
        console.error('[NewsStore] Failed to update news item:', error)
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Saves the read status of news items to localStorage
     */
    saveReadStatusToLocalStorage() {
      const readIds = this.news.filter((item) => item.read).map((item) => item.id)
      localStorage.setItem('readNewsIds', JSON.stringify(readIds))
    },

    /**
     * Loads the read status of news items from localStorage
     */
    loadReadStatusFromLocalStorage() {
      try {
        const readIdsString = localStorage.getItem('readNewsIds')
        if (readIdsString) {
          const readIds = JSON.parse(readIdsString)
          this.news.forEach((item) => {
            if (readIds.includes(item.id)) {
              item.read = true
            }
          })
        }
      } catch (error) {
        console.error('Error loading read status from localStorage:', error)
      }
    },

    /**
     * Marks a news item as read
     * @param {string|number} id - ID of the news item to mark as read
     */
    markAsRead(id) {
      const item = this.news.find((news) => news.id === id)
      if (item) {
        item.read = true
        this.saveReadStatusToLocalStorage()
      }
    },

    /**
     * Deletes a news item
     * @param {string|number} id - ID of the news item to delete
     * @returns {Promise<void>} Promise that resolves when the news item is deleted
     * @throws {Error} If the news item cannot be deleted
     */
    async deleteNews(id) {
      this.loading = true
      this.error = null

      try {
        const result = await NewsService.deleteNews(id)
        this.news = this.news.filter((item) => item.id !== id)
        if (this.selectedNews && this.selectedNews.id === id) {
          this.selectedNews = null
        }
        return result
      } catch (error) {
        console.error('[NewsStore] Failed to delete news item:', error)
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Resets the store state to its initial values
     */
    resetState() {
      this.news = []
      this.loading = false
      this.error = null
      this.selectedNews = null
    },
  },
})