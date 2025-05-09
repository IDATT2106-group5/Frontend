import { defineStore } from 'pinia'
import NewsService from '@/service/news/newsService'

export const useNewsStore = defineStore('news', {
  state: () => ({
    news: [],
    loading: false,
    error: null,
    selectedNews: null,
  }),

  getters: {
    getAllNews: (state) => state.news,
    getSelectedNews: (state) => state.selectedNews,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    unreadNews: (state) => state.news.filter((item) => !item.read),
    readNews: (state) => state.news.filter((item) => item.read),
  },

  actions: {
    // Update the fetchPaginatedNews method in useNewsStore.js
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

        // Process the fetched items
        const fetchedNewsItems = (response.news || []).map((item) => ({
          ...item,
          read: readIds.includes(item.id),
        }));

        // If it's the first page, replace the entire list
        // Otherwise, append to the existing list while avoiding duplicates
        if (page === 0) {
          this.news = fetchedNewsItems;
        } else {
          // Filter out items that are already in the state by ID
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
    selectNews(id) {
      this.selectedNews = this.news.find((newsItem) => newsItem.id === id) || null
    },

    async createNews(newsData) {
      this.loading = true;
      this.error = null;

      try {
        const result = await NewsService.createNews(newsData);

        // Add the new news item to the state immediately
        // The API response should contain the created item with an ID
        if (result && result.id) {
          this.news.unshift({
            ...result,
            read: false
          });
        } else {
          // If the API doesn't return the created item with an ID,
          // fetch all news to get the latest data
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
    saveReadStatusToLocalStorage() {
      const readIds = this.news.filter((item) => item.read).map((item) => item.id)
      localStorage.setItem('readNewsIds', JSON.stringify(readIds))
    },
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
    markAsRead(id) {
      console.log('Marking as read:', id)
      const item = this.news.find((news) => news.id === id)
      if (item) {
        item.read = true
        this.saveReadStatusToLocalStorage()
      }
    },
    async deleteNews(id) {
      console.log('Deleting news item with ID:', id)
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
    resetState() {
      this.news = []
      this.loading = false
      this.error = null
      this.selectedNews = null
    },
  },
})
