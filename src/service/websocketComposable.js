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
            fetchNotifications(userStore.user.id)
          }
        },
        onDisconnected: () => {
          connected.value = false
        },
        onNotification: (message) => {
          console.log('Notification received', message)
          if (userStore.user?.id) {
            fetchNotifications(userStore.user.id)
          }
          if (message.type === 'INCIDENT') {
            currentIncident.value = message
            showIncidentPopup.value = true
          }
        },
      })
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
    }
  }

  function closeIncidentPopup() {
    showIncidentPopup.value = false;
    if (currentIncident.value) {
      currentIncident.value = null;
    }
  }

  onBeforeUnmount(() => {
    webSocketService.disconnect()
  })

  async function subscribeToPosition(householdId, callback) {
    if (userStore.token && householdId) {
      webSocketService.subscribeToPosition(householdId, (position) => {
        console.log('Position update received:', position)
        if (callback) callback(position)
      })
    }
  }

  function updatePosition(userId, longitude, latitude) {
    webSocketService.updatePosition(userId, longitude, latitude)
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

      const index = notifications.value.findIndex((n) => n.id === notificationId)
      if (index !== -1 && !notifications.value[index].read) {
        notifications.value[index].read = true
        notificationCount.value = Math.max(0, notificationCount.value - 1)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  function resetNotificationCount() {
    notificationCount.value = 0
  }

  async function fetchNotifications(userId) {
    if (!userId || !userStore.token) return

    try {
      const requestData = { userId: userId }
      const response = await fetch('http://localhost:8080/api/notifications/get', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userStore.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()
      notifications.value = data
      notificationCount.value = data.filter((n) => !n.read).length
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  async function fetchHouseholdPositions() {
    if (!userStore.token) return []

    try {
      const response = await fetch(`http://localhost:8080/api/household/positions`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userStore.token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      console.log('Received position update data:', data)
      return data
    } catch (error) {
      console.error('Error fetching position update:', error)
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
    fetchHouseholdPositions,
    showIncidentPopup,
    currentIncident,
    closeIncidentPopup,
  }
}
