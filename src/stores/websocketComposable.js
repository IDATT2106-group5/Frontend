// src/stores/websocketComposable.js
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Client } from '@stomp/stompjs'
import { useUserStore } from '@/stores/UserStore'

export default function useStompWebSocket() {
  const stompClient = ref(null)
  const connected = ref(false)
  const notifications = ref([])
  const notificationCount = ref(0)

  const userStore = useUserStore()

  onMounted(() => {
    connect()
  })

  onBeforeUnmount(() => {
    disconnect()
  })

  function connect() {
    if (typeof window !== 'undefined') {
      window.global = window;
    }

    // Import SockJS dynamically to ensure global is defined first
    import('sockjs-client').then(SockJS => {
      const socket = new SockJS.default('http://localhost:8080/ws')

      stompClient.value = new Client({
        webSocketFactory: () => socket,
        onConnect: onConnected,
        onDisconnect: onDisconnected,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      })

      stompClient.value.activate()
    })
  }

  function onConnected() {
    connected.value = true
    console.log('Connected to WebSocket')

    stompClient.value.subscribe('/topic/notifications', onBroadcastNotification)

    if (userStore.token && userStore.user?.id) {
      stompClient.value.subscribe(`/user/${userStore.user.id}/queue/notifications`, onPrivateNotification)

      if (userStore.user?.householdId) {
        stompClient.value.subscribe(`/topic/household/${userStore.user.householdId}`, onHouseholdNotification)
      }
    }

    fetchNotifications()
  }

  function onDisconnected() {
    connected.value = false
    console.log('Disconnected from WebSocket')
  }

  function disconnect() {
    if (stompClient.value) {
      stompClient.value.deactivate()
    }
  }

  function onPrivateNotification(message) {
    const notification = JSON.parse(message.body)
    addNotification(notification)
  }

  function onBroadcastNotification(message) {
    const notification = JSON.parse(message.body)
    addNotification(notification)
  }

  function onHouseholdNotification(message) {
    const notification = JSON.parse(message.body)
    addNotification(notification)
  }

  function addNotification(notification) {
    notifications.value.unshift(notification)
    if (!notification.read) {
      notificationCount.value++
    }
  }

  function sendNotification(notification) {
    if (stompClient.value && connected.value) {
      stompClient.value.publish({
        destination: '/app/notification',
        body: JSON.stringify(notification)
      })
    } else {
      console.error('WebSocket not connected')
    }
  }

  async function markAsRead(notificationId) {
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userStore.token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }

      const index = notifications.value.findIndex(n => n.id === notificationId)
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
  if (!userStore.token || !userStore.user) return

  try {
    const requestData = { userId: userStore.user.id }
    const response = await fetch('http://localhost:8080/api/notifications/get', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      throw new Error('Failed to fetch notifications')
    }

    const data = await response.json()
    console.log(data)
    notifications.value = data
    notificationCount.value = data.filter(n => !n.read).length
  } catch (error) {
    console.error('Error fetching notifications:', error)
  }
}

  return {
    notifications,
    notificationCount,
    connected,
    markAsRead,
    resetNotificationCount
  }
}
