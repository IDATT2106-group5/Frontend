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
      onIncident: () => {},
    }
    this.userId = null
    this.token = null
  }

  init({ userId, householdId, token, onConnected, onDisconnected, onNotification, onPositionUpdate }) {
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

    import('sockjs-client')
      .then((SockJS) => {
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
      .catch((err) => {
        console.error('Failed to load SockJS client', err)
      })
  }

  _onConnected() {
    this.connected = true

    this.stompClient.subscribe('/topic/notifications', (message) => {
      try {
        const data = JSON.parse(message.body)
        this.callbacks.onNotification(data)
        if (data.type === 'INCIDENT') {
          this.callbacks.onIncident(data)
        }
      } catch (err) {
        console.error('Error handling /topic/notifications message', err)
        this.callbacks.onNotification()
      }
    })

    if (this.token && this.userId) {
      this.stompClient.subscribe(`/user/queue/notifications`, (message) => {
        try {
          const data = JSON.parse(message.body)
          this.callbacks.onNotification(data)
          if (data.type === 'INCIDENT') {
            this.callbacks.onIncident(data)
          }
        } catch (err) {
          console.error('Error handling /user/queue/notifications message', err)
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
          callback && callback(data)
        } catch (err) {
          console.error('Error handling position update', err)
        }
      })
      return true
    }
    return false
  }

  updatePosition(userId, longitude, latitude) {
    const positionData = { userId, longitude, latitude }
    if (this.stompClient && this.connected) {
      try {
        this.stompClient.publish({
          destination: '/app/position',
          body: JSON.stringify(positionData),
        })
        return true
      } catch (err) {
        console.error('Error publishing position update', err)
        return false
      }
    }
    return false
  }
}
