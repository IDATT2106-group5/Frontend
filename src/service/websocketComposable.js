import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useUserStore } from '@/stores/UserStore.js'
import { useHouseholdStore } from '@/stores/HouseholdStore.js'
import WebSocketService from '@/service/websocketService.js'

export default function useWebSocket() {
  const notifications = ref([])
  const notificationCount = ref(0)
  const connected = ref(false)

  const userStore = useUserStore()
  const householdStore = useHouseholdStore()
  const webSocketService = new WebSocketService()

  onMounted(() => {
    webSocketService.init({
      userId: userStore.userId,
      token: userStore.token,
      householdId: householdStore.householdId,
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

  async function fetchNotifications() {
    try {
      const requestData = { userId: userStore.user.id }
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
    console.log('Fetching household positions for user:', userStore.user.id)
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
