import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/UserStore.js'
import { useHouseholdStore } from '@/stores/HouseholdStore.js'
import WebSocketService from '@/service/websocketService.js'

export default function useWebSocket() {
  const notifications = ref([])
  const notificationCount = ref(0)
  const connected = ref(false)
  const showIncidentPopup = ref(false)
  const currentIncident = ref(null)
  const webSocketService = new WebSocketService()
  const userStore = useUserStore()
  const householdStore = useHouseholdStore()

  onMounted(() => {
    if (userStore.user && userStore.token) {
      initWebSocket()
    }
  })

  watch(
    () => userStore.user,
    (newUser) => {
      if (newUser && userStore.token && !connected.value) {
        initWebSocket()
      }
    },
  )

  async function initWebSocket() {
    try {
      if (!householdStore.currentHousehold) {
        await householdStore.checkCurrentHousehold()
      }

      webSocketService.init({
        userId: userStore.user?.id,
        token: userStore.token,
        householdId: householdStore.currentHousehold.id,
        onConnected: () => {
          connected.value = true
          if (userStore.user?.id) {
            fetchNotifications()
          }
        },
        onDisconnected: () => {
          connected.value = false
        },
        onNotification: (message) => {
          if (userStore.user?.id) {
            fetchNotifications()
          }
          if (message.type === 'INCIDENT') {
            currentIncident.value = message
            showIncidentPopup.value = true
          }
        },
      })
    } catch (err) {
      console.error('Failed to initialize WebSocket', err)
    }
  }

  function closeIncidentPopup() {
    showIncidentPopup.value = false
    currentIncident.value = null
  }

  onBeforeUnmount(() => {
    webSocketService.disconnect()
  })

  async function subscribeToPosition(householdId, callback) {
    if (userStore.token && householdId) {
      return webSocketService.subscribeToPosition(householdId, (position) => {
        if (callback) callback(position)
      })
    }
    return false
  }

  function updatePosition(userId, longitude, latitude) {
    return webSocketService.updatePosition(userId, longitude, latitude)
  }

  async function markAsRead(notificationId) {
    try {
      await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${userStore.token}`,
          'Content-Type': 'application/json',
        },
      })

      const idx = notifications.value.findIndex((n) => n.id === notificationId)
      if (idx !== -1 && !notifications.value[idx].read) {
        notifications.value[idx].read = true
        notificationCount.value = Math.max(0, notificationCount.value - 1)
      }
    } catch (err) {
      console.error(`Error marking notification ${notificationId} as read`, err)
    }
  }

  function resetNotificationCount() {
    notificationCount.value = 0
  }

  async function fetchNotifications() {
    if (!userStore.token) return

    try {
      const res = await fetch('http://localhost:8080/api/notifications/get', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userStore.token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      notifications.value = data
      notificationCount.value = data.filter((n) => !n.read).length
    } catch (err) {
      console.error('Error fetching notifications', err)
    }
  }

  async function fetchHouseholdPositions() {
    if (!userStore.token) return []

    try {
      const res = await fetch('http://localhost:8080/api/household/positions', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userStore.token}`,
          'Content-Type': 'application/json',
        },
      })
      return await res.json()
    } catch (err) {
      console.error('Error fetching household positions', err)
      return []
    }
  }

  return {
    notifications,
    notificationCount,
    connected,
    markAsRead,
    resetNotificationCount,
    subscribeToPosition,
    updatePosition,
    fetchNotifications,
    fetchHouseholdPositions,
    showIncidentPopup,
    currentIncident,
    closeIncidentPopup,
  }
}
