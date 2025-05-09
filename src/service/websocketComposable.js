import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/UserStore.js'
import { useHouseholdStore } from '@/stores/HouseholdStore.js'
import WebSocketService from '@/service/websocketService.js'

export default function useWebSocket() {
  /** @type {import('vue').Ref<Array<Object>>} */
  const notifications = ref([])

  /** @type {import('vue').Ref<number>} */
  const notificationCount = ref(0)

  /** @type {import('vue').Ref<boolean>} */
  const connected = ref(false)

  /** @type {import('vue').Ref<boolean>} */
  const showIncidentPopup = ref(false)

  /** @type {import('vue').Ref<Object|null>} */
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

  /**
   * Initializes the WebSocket connection and sets up listeners.
   */
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

   /**
   * Closes the incident popup and clears current incident data.
   */
  function closeIncidentPopup() {
    showIncidentPopup.value = false
    currentIncident.value = null
  }

  onBeforeUnmount(() => {
    webSocketService.disconnect()
  })

  /**
   * Subscribes to position updates for the given household.
   * @param {string} householdId - The household ID to subscribe to.
   * @param {function} callback - Callback to handle received position data.
   * @returns {boolean|Promise<boolean>} Subscription result.
   */
  async function subscribeToPosition(householdId, callback) {
    if (userStore.token && householdId) {
      return webSocketService.subscribeToPosition(householdId, (position) => {
        if (callback) callback(position)
      })
    }
    return false
  }

  /**
   * Sends the user's latest position.
   * @param {string} token - The token.
   * @param {number} longitude - Longitude.
   * @param {number} latitude - Latitude.
   * @returns {Promise<void>} A promise that resolves when position is sent.
   */
  function updatePosition(token, longitude, latitude) {
    return webSocketService.updatePosition(token, longitude, latitude)
  }

  /**
   * Marks a notification as read and updates count locally.
   * @param {string} notificationId - The ID of the notification.
   * @returns {Promise<void>}
   */
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

  /**
   * Resets the notification count to 0.
   */
  function resetNotificationCount() {
    notificationCount.value = 0
  }

  /**
   * Fetches all notifications for the logged in user.
   * @returns {Promise<void>}
   */
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

  /**
   * Fetches the latest household member positions.
   * @returns {Promise<Array<Object>>} List of member positions.
   */
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
