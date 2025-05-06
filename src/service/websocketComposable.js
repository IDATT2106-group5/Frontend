import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useUserStore } from '@/stores/UserStore.js'
import WebSocketService from '@/service/websocketService.js'

export default function useWebSocket() {
  const notifications = ref([])
  const notificationCount = ref(0)
  const connected = ref(false)

  const userStore = useUserStore()
  const webSocketService = new WebSocketService()

  onMounted(() => {
    webSocketService.init({
      userId: userStore.userId,
      token: userStore.token,
      onConnected: () => {
        connected.value = true
        fetchNotifications()
      },
      onDisconnected: () => {
        connected.value = false
      },
      onNotification: () => {
        fetchNotifications()
      },
      onPositionUpdate: (position) => {
        console.log('Received position update:', position)
      }
    })
  })

  onBeforeUnmount(() => {
    webSocketService.disconnect()
  })

  async function subscribeToPosition(householdId) {
    if (userStore.token && householdId) {
      webSocketService.subscribeToPosition(householdId)
      updatePosition(29, '10.0', '20.0')
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

  async function fetchNotifications() {
    try {
      const requestData = { userId: userStore.userId }
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
    fetchHouseholdPositions
  }
}
