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
    async fetchPaginatedNews(page, size) {
      this.loading = true
      this.error = null

      try {
        const response = await NewsService.fetchPaginatedNews(page, size)

        let readIds = []
        try {
          const readIdsString = localStorage.getItem('readNewsIds')
          if (readIdsString) {
            readIds = JSON.parse(readIdsString)
          }
        } catch (e) {
          console.error('Error parsing read IDs from localStorage:', e)
        }

        const newNewsItems = (response.news || [])
          .filter((newItem) => !this.news.some((existingItem) => existingItem.id === newItem.id))
          .map((item) => ({
            ...item,
            read: readIds.includes(item.id),
          }))

        this.news = [...this.news, ...newNewsItems]
        return response
      } catch (error) {
        console.error('[NewsStore] Failed to fetch news:', error)
        this.error = error
        return { news: [], totalPages: 0, totalElements: 0 }
      } finally {
        this.loading = false
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
      this.loading = true
      this.error = null

      try {
        const result = await NewsService.createNews(newsData)
        await this.fetchPaginatedNews(1, 10)
        return result
      } catch (error) {
        console.error('[NewsStore] Failed to create news item:', error)
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
    async updateNews(id, newsData) {
      this.loading = true
      this.error = null

      try {
        const result = await NewsService.updateNews(id, newsData)
        await this.fetchPaginatedNews(1, 10)
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
    resetState() {
      this.news = []
      this.loading = false
      this.error = null
      this.selectedNews = null
    },
  },
})
