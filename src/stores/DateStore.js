import { defineStore } from 'pinia'

export const useDateStore = defineStore('date', {
  state: () => ({
    currentDateTime: new Date()
  }),
  getters: {
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
    startClock() {
      if (this.interval) return
      this.interval = setInterval(() => {
        this.currentDateTime = new Date()
      }, 60000) 
    },
    stopClock() {
      clearInterval(this.interval)
      this.interval = null
    }
  }
})