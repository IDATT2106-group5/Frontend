/**
 * @fileoverview Location sharing store that manages user geolocation functionality.
 * This store handles tracking, sharing, and updating a user's geographic position
 * through WebSockets while managing the state of location sharing.
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import useWebSocket from '@/service/websocketComposable.js'

/**
 * Location store for managing geolocation functionality.
 * @returns {Object} Collection of state and methods for location sharing
 */
export const useLocationStore = defineStore('location', () => {
  /**
   * Flag indicating whether location sharing is currently active.
   * Value is persisted in localStorage to maintain state across sessions.
   * @type {import('vue').Ref<boolean>}
   */
  const isSharing = ref(localStorage.getItem('isSharing') === 'true')

  /**
   * Current location error message, if any.
   * @type {import('vue').Ref<string|null>}
   */
  const locationError = ref(null)

  /**
   * Interval ID for the position update timer.
   * @type {import('vue').Ref<number|null>}
   */
  const positionUpdateInterval = ref(null)

  /**
   * User store instance for accessing user information and authentication.
   * @type {Object}
   */
  const userStore = useUserStore()

  /**
   * WebSocket service for sending position updates to server.
   * @type {Object}
   */
  const { updatePosition, connected } = useWebSocket()

  /**
   * Updates the current user's geographic position by obtaining the latest
   * coordinates and sending them to the server via WebSocket.
   *
   * Sets appropriate error messages if connection or geolocation fails.
   * @returns {void}
   */
  function updateUserPosition() {
    if (!connected.value) {
      if (locationError.value !== 'Ingen tilkobling til server') {
        locationError.value = 'Ingen tilkobling til server'
      }
      return
    }

    if (!isSharing.value) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      /**
       * Success callback for geolocation request.
       * @param {GeolocationPosition} position - The position object containing coordinates
       * @returns {Promise<void>}
       */
      async (position) => {
        const { latitude, longitude } = position.coords

        console.debug('Updating position for current user')
        await updatePosition(userStore.token, longitude.toString(), latitude.toString())
      },
      /**
       * Error callback for geolocation request.
       * @param {GeolocationPositionError} error - The error that occurred during geolocation
       * @returns {void}
       */
      (error) => {
        console.error('Geolocation error:', error)

        switch (error.code) {
          case error.PERMISSION_DENIED:
            locationError.value = 'Location access denied. Please enable location services.'
            break
          case error.POSITION_UNAVAILABLE:
            locationError.value = 'Location information unavailable.'
            break
          case error.TIMEOUT:
            locationError.value = 'Location request timed out.'
            break
          default:
            locationError.value = 'Unknown error occurred.'
        }

        stopPositionSharing()
      },
      /**
       * Options for the geolocation request.
       * @type {PositionOptions}
       */
      {
        enableHighAccuracy: true,
        timeout: 300000,
        maximumAge: 30000,
      },
    )

    locationError.value = null
  }

  /**
   * Starts sharing the user's position.
   * Initializes a timer to regularly update the position and
   * stores the sharing state in localStorage.
   * @returns {void}
   */
  function startPositionSharing() {
    if (!navigator.geolocation) {
      locationError.value = 'Geolocation is not supported by your browser'
      return
    }
    if (positionUpdateInterval.value) {
      clearInterval(positionUpdateInterval.value)
    }
    updateUserPosition()
    positionUpdateInterval.value = setInterval(updateUserPosition, 30000)
    isSharing.value = true
    localStorage.setItem('isSharing', 'true')
  }

  /**
   * Stops sharing the user's position.
   * Clears the update interval and updates localStorage.
   * @returns {void}
   */
  function stopPositionSharing() {
    updateUserPosition()
    if (positionUpdateInterval.value) {
      clearInterval(positionUpdateInterval.value)
      positionUpdateInterval.value = null
    }
    isSharing.value = false
    localStorage.setItem('isSharing', 'false')
  }

  /**
   * Toggles the location sharing state between on and off.
   * @returns {void}
   */
  function togglePositionSharing() {
    if (isSharing.value === true) {
      stopPositionSharing()
    } else {
      startPositionSharing()
    }
  }

  /**
   * Watches for changes in the user ID.
   * Starts or stops position sharing based on user authentication state.
   */
  watch(
    () => userStore.user?.id,
    /**
     * @param {string|null} userId - The ID of the current user
     * @returns {void}
     */
    (userId) => {
      if (userId && isSharing.value && !positionUpdateInterval.value) {
        startPositionSharing()
      } else if (!userId && positionUpdateInterval.value) {
        stopPositionSharing()
      }
    },
  )

  /**
   * Watches for changes in WebSocket connection status.
   * Restarts position sharing when connection is established.
   */
  watch(
    () => connected.value,
    /**
     * @param {boolean} isConnected - Whether the WebSocket is connected
     * @returns {void}
     */
    (isConnected) => {
      const now = Date.now()

      if (isConnected) {
        if (isSharing.value && !positionUpdateInterval.value) {
          console.debug('WebSocket connected, restarting position sharing')
          startPositionSharing()
        }

        if (locationError.value === 'No connection to server') {
          locationError.value = null
        }
      } else {
        if (now - lastConnectionLogTime > connectionLogThreshold) {
          console.debug('WebSocket disconnected, will reconnect automatically')
        }
      }
    },
  )

  /**
   * Initializes position sharing if it was previously enabled
   * and the user is authenticated. Uses a delay to ensure all
   * dependencies are properly initialized.
   */
  if (isSharing.value && userStore.user?.id) {
    setTimeout(() => {
      startPositionSharing()
    }, 30000)
  }

  /**
   * Public API exposed by the location store.
   * @type {Object}
   * @property {import('vue').Ref<boolean>} isSharing - Current sharing state
   * @property {import('vue').Ref<string|null>} locationError - Current error message, if any
   * @property {Function} startPositionSharing - Function to start location sharing
   * @property {Function} togglePositionSharing - Function to toggle location sharing state
   */
  return {
    isSharing,
    locationError,
    startPositionSharing,
    togglePositionSharing,
  }
})
