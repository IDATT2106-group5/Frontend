import { Client } from '@stomp/stompjs'

export default class WebSocketService {
  constructor() {
    this.stompClient = null
    this.connected = false
    this.callbacks = {
      onConnected: () => {},
      onDisconnected: () => {},
      onNotification: () => {},
      onPositionUpdate: () => {},
      onIncident: () => {}, // Add default empty callback for incident
    }
    this.userId = null
    this.token = null
  }

  init({
    userId,
    householdId,
    token,
    onConnected,
    onDisconnected,
    onNotification,
    onPositionUpdate,
  }) {
    this.userId = userId
    this.token = token
    this.householdId = householdId

    if (onConnected) this.callbacks.onConnected = onConnected
    if (onDisconnected) this.callbacks.onDisconnected = onDisconnected
    if (onNotification) this.callbacks.onNotification = onNotification
    if (onPositionUpdate) this.callbacks.onPositionUpdate = onPositionUpdate

    this.connect()
  }

  connect() {
    if (typeof window !== 'undefined') {
      window.global = window
    }

    import('sockjs-client').then((SockJS) => {
      const socket = new SockJS.default(`http://localhost:8080/ws?userId=${this.userId}`)

      this.stompClient = new Client({
        webSocketFactory: () => socket,
        onConnect: () => this._onConnected(),
        onDisconnect: () => this._onDisconnected(),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      })

      this.stompClient.activate()
    })
  }

  _onConnected() {
    this.connected = true


    this.stompClient.subscribe('/topic/notifications', (message) => {
      try {
        const data = JSON.parse(message.body)
        this.callbacks.onNotification(data)

        // Check for incident type and call the specific handler
        if (data && data.type === 'INCIDENT') {
          this.callbacks.onIncident(data)
        }
      } catch (error) {
        console.error('Error parsing notification:', error)
        this.callbacks.onNotification()
      }
    })

    if (this.token && this.userId) {
      this.stompClient.subscribe(`/user/queue/notifications`, (message) => {
        try {
          const data = JSON.parse(message.body)
          this.callbacks.onNotification(data)

          // Check for incident type and call the specific handler
          if (data && data.type === 'INCIDENT') {
            this.callbacks.onIncident(data)
          }
        } catch (error) {
          console.error('Error parsing notification:', error)
          this.callbacks.onNotification()
        }
      })
    }

    this.callbacks.onConnected()
  }

  _onDisconnected() {
    this.connected = false
    this.callbacks.onDisconnected()
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate()
    }
  }

  subscribeToPosition(householdId, callback) {
    if (this.stompClient && this.connected && this.token && householdId) {
      this.stompClient.subscribe(`/topic/position/${householdId}`, (message) => {
        try {
          const data = JSON.parse(message.body)
          if (callback) callback(data)
        } catch (error) {
          console.error('Error parsing position data:', error)
        }
      })
      return true
    } else {
      console.error('Cannot subscribe to position: STOMP client not connected')
      return false
    }
  }

  updatePosition(userId, longitude, latitude) {
    const positionData = {
      userId: userId,
      longitude: longitude,
      latitude: latitude,
    }

    if (this.stompClient && this.connected) {
      try {
        this.stompClient.publish({
          destination: '/app/position',
          body: JSON.stringify(positionData),
        })
        return true
      } catch (error) {
        console.error('Error sending position update:', error)
        return false
      }
    } else {
      console.error('Cannot send position update: STOMP client not connected')
      return false
    }
  }
}
