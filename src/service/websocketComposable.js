// src/stores/websocketComposable.js
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Client } from '@stomp/stompjs'
import { useUserStore } from '@/stores/UserStore.js'

export default function useStompWebSocket() {
  const stompClient = ref(null)
  const connected = ref(false)
  const notifications = ref([])
  const notificationCount = ref(0)

  const userStore = useUserStore()

  onMounted(() => {
    userStore.fetchUser()
    connect()
  })

  onBeforeUnmount(() => {
    disconnect()
  })

  function connect() {
    if (typeof window !== 'undefined') {
      window.global = window
    }

    import('sockjs-client').then((SockJS) => {
      // Add userId as query parameter
      const socket = new SockJS.default(`http://localhost:8080/ws?userId=${36}`)

      stompClient.value = new Client({
        webSocketFactory: () => socket,
        onConnect: onConnected,
        onDisconnect: onDisconnected,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      })

      stompClient.value.activate()
    })
  }

  function onConnected() {
    connected.value = true
    console.log('Connected to WebSocket')

    console.log(`User ID: ${36}, Token: ${userStore.token}`)

    stompClient.value.subscribe('/topic/notifications', onBroadcastNotification)
    console.log('Subscribed to /topic/notifications')

    if (userStore.token && 36) {
      stompClient.value.subscribe(`/user/queue/notifications`, onPrivateNotification)
      console.log(`Subscribed to /user/queue/notifications`)

      stompClient.value.subscribe(`/topic/household/${4}`, onHouseholdNotification)
      console.log(`Subscribed to /topic/household/${4}`)
    }
    // Fetch initial notifications
    console.log('Fetching notifications...')
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
    console.log('Raw private message received:', message)
    try {
      const notification = JSON.parse(message.body)
      console.log('Parsed private notification:', notification)
      addNotification(notification)
      fetchNotifications()
    } catch (error) {
      console.error('Error parsing private notification:', error, message)
    }
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
        body: JSON.stringify(notification),
      })
    } else {
      console.error('WebSocket not connected')
    }
  }

  async function markAsRead(notificationId) {
    try {
      const response = await fetch(
        `http://localhost:8080/api/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${userStore.token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }

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
    // if (!userStore.token || !userStore.user) return
    if (stompClient.value && connected.value) {
      stompClient.value.publish({
        destination: '/app/echo',
        body: JSON.stringify({ userId: 36 }),
      })
    }

    try {
      const requestData = { userId: 36 }
      const response = await fetch('http://localhost:8080/api/notifications/get', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userStore.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
      console.log(response)

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      console.log(data)
      notifications.value = data
      notificationCount.value = data.filter((n) => !n.read).length
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  return {
    notifications,
    notificationCount,
    connected,
    markAsRead,
    resetNotificationCount,
    sendNotification,
  }
}
