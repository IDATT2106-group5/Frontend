import { defineStore } from 'pinia'

/**
 * A Pinia store for tracking and formatting the current date and time.
 *
 * @store useDateStore
 * @state {Date} currentDateTime - The current date and time, updated every minute.
 * @getter {string} formattedDateTime - The formatted string of the current date and time (e.g., "05.05.2025 14:30").
 * @action startClock - Starts an interval that updates the current time every minute.
 * @action stopClock - Clears the interval that updates the current time.
 */
export const useDateStore = defineStore('date', {
  state: () => ({
    currentDateTime: new Date()
  }),
  getters: {
    /**
     * Returns the formatted date and time as a string in "DD.MM.YYYY HH:mm" format.
     *
     * @param {Object} state The store's state.
     * @returns {string} A formatted datetime string.
     */
    formattedDateTime(state) {
      const d = state.currentDateTime
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      return `${day}.${month}.${year} ${hours}:${minutes}`
    }
  },
  actions: {
    /**
     * Starts an interval that updates `currentDateTime` every minute.
     * Prevents multiple intervals from being created.
     *
     * @returns {void}
     */
    startClock() {
      if (this.interval) return
      this.interval = setInterval(() => {
        this.currentDateTime = new Date()
      }, 60000) 
    },
    /**
     * Stops the interval that updates `currentDateTime`.
     *
     * @returns {void}
     */
    stopClock() {
      clearInterval(this.interval)
      this.interval = null
    }
  }
})