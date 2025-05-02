import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

class WebSocketService {
  constructor() {
    this.stompClient = null
    this.connected = false
    this.notificationHandlers = {
      private: [],
      broadcast: [],
      household: [],
    }
    this.userId = null
    this.householdId = null
  }

  connect(userId, householdId) {
    this.userId = userId
    this.householdId = householdId

    const socket = new SockJS('http://localhost:8080/ws')
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: this.onConnected.bind(this),
      onDisconnect: this.onDisconnected.bind(this),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    this.stompClient.activate()

    return new Promise((resolve) => {
      const checkConnection = setInterval(() => {
        if (this.connected) {
          clearInterval(checkConnection)
          resolve()
        }
      }, 100)
    })
  }

  onConnected() {
    console.log('Connected to WebSocket server')
    this.connected = true

    // Subscribe to private notifications
    if (this.userId) {
      this.stompClient.subscribe(
        `/user/${this.userId}/queue/notifications`,
        this.onPrivateNotification.bind(this),
      )
    }

    // Subscribe to broadcast notifications
    this.stompClient.subscribe('/topic/notifications', this.onBroadcastNotification.bind(this))

    // Subscribe to household notifications if applicable
    if (this.householdId) {
      this.stompClient.subscribe(
        `/topic/household/${this.householdId}`,
        this.onHouseholdNotification.bind(this),
      )
    }
  }

  onDisconnected() {
    console.log('Disconnected from WebSocket server')
    this.connected = false
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate()
      this.connected = false
    }
  }

  sendNotification(notification) {
    if (this.stompClient && this.connected) {
      this.stompClient.publish({
        destination: '/app/notification',
        body: JSON.stringify(notification),
      })
    } else {
      console.error('Not connected to WebSocket server')
    }
  }

  addPrivateNotificationHandler(handler) {
    this.notificationHandlers.private.push(handler)
  }

  addBroadcastNotificationHandler(handler) {
    this.notificationHandlers.broadcast.push(handler)
  }

  addHouseholdNotificationHandler(handler) {
    this.notificationHandlers.household.push(handler)
  }

  onPrivateNotification(message) {
    const notification = JSON.parse(message.body)
    console.log('Received private notification:', notification)
    this.notificationHandlers.private.forEach((handler) => handler(notification))
  }

  onBroadcastNotification(message) {
    const notification = JSON.parse(message.body)
    console.log('Received broadcast notification:', notification)
    this.notificationHandlers.broadcast.forEach((handler) => handler(notification))
  }

  onHouseholdNotification(message) {
    const notification = JSON.parse(message.body)
    console.log('Received household notification:', notification)
    this.notificationHandlers.household.forEach((handler) => handler(notification))
  }

  markAsRead(notificationId) {
    return fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }
      return response
    })
  }
}

export default new WebSocketService()
