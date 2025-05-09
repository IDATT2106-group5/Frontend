import { Client } from '@stomp/stompjs'

export default class WebSocketService {
  constructor() {
    /** @type {Client|null} */
    this.stompClient = null

    /** @type {boolean} */
    this.connected = false

    /** @type {Object} */
    this.callbacks = {
      onConnected: () => {},
      onDisconnected: () => {},
      onNotification: () => {},
      onPositionUpdate: () => {},
      onIncident: () => {},
    }
    /** @type {string|null} */
    this.userId = null
    /** @type {string|null} */
    this.token = null
  }

  /**
   * Initializes the WebSocket connection and sets callback functions.
   *
   * @param {Object} config - WebSocket initialization parameters.
   * @param {string} config.userId - The user ID.
   * @param {string} config.householdId - The household ID.
   * @param {string} config.token - The JWT auth token.
   * @param {Function} config.onConnected - Called when connected.
   * @param {Function} config.onDisconnected - Called when disconnected.
   * @param {Function} config.onNotification - Called on notification.
   * @param {Function} config.onPositionUpdate - Called on position update.
   */
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

  /**
   * Establishes the WebSocket connection using SockJS and STOMP.
   */
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

  /**
   * Handles successful STOMP connection and subscribes to notification topics.
   * @private
   */
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

  /**
   * Handles WebSocket disconnection.
   * @private
   */
  _onDisconnected() {
    this.connected = false
    this.callbacks.onDisconnected()
  }

  /**
   * Disconnects the WebSocket client.
   */
  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate()
    }
  }

  /**
   * Subscribes to position updates for a specific household.
   *
   * @param {string} householdId - Household ID to subscribe to.
   * @param {Function} callback - Function to call with received position data.
   * @returns {boolean} True if subscription was successful.
   */
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

  /**
   * Publishes the user's position to the backend.
   *
   * @param {string} userId - User ID.
   * @param {number} longitude - User's longitude.
   * @param {number} latitude - User's latitude.
   * @returns {boolean} True if publish was successful.
   */
  updatePosition(token, longitude, latitude) {
    const positionData = { token, longitude, latitude }
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
