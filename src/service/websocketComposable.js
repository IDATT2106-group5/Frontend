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

  async function onConnected() {
    connected.value = true
    console.log('Connected to WebSocket')

    console.log(`User ID: ${36}, Token: ${userStore.token}`)

    stompClient.value.subscribe('/topic/notifications', onBroadcastNotification)
    console.log('Subscribed to /topic/notifications')

    if (userStore.token && 36) {
      stompClient.value.subscribe(`/user/queue/notifications`, onPrivateNotification)
      console.log(`Subscribed to /user/queue/notifications`)
    }

    await fetchNotifications()
  }

  async function subscribeToPosition(householdId) {
    if (userStore.token && 4) {
      stompClient.value.subscribe(`/topic/position/${householdId}`, onPositionUpdate)
      console.log(`Subscribed to /topic/position/${householdId}`)
    }
    updatePosition(29, '10.0', '20.0')
  }

  async function updatePosition(userId, longitude, latitude) {
    const positionData = {
      userId: userId,
      longitude: longitude,
      latitude: latitude
    }

    if (stompClient.value && connected.value) {
      try {
        stompClient.value.publish({
          destination: '/app/position',
          body: JSON.stringify(positionData)
        });
        console.log('Position update sent successfully');
      } catch (error) {
        console.error('Error sending position update:', error);
      }
    } else {
      console.error('Cannot send position update: STOMP client not connected');
    }
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

  async function onPrivateNotification() {
    await fetchNotifications()
  }

  async function onBroadcastNotification() {
    await fetchNotifications()
  }

  function onPositionUpdate(position) {
    console.log('Received position update:', JSON.parse(position.body))
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
    // if (!userStore.token || !userStore.user) return

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

      const data = await response.json()
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
    subscribeToPosition,
  }
}
