// stores/LocationStore.js
import { defineStore } from 'pinia'
import { ref, watch, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import useWebSocket from '@/service/websocketComposable.js'

export const useLocationStore = defineStore('location', () => {
  // State
  const isSharing = ref(localStorage.getItem('isSharing') === 'true')
  const locationError = ref(null)
  let positionUpdateInterval = null

  // Get dependencies
  const userStore = useUserStore()
  const { updatePosition, connected } = useWebSocket()

  // Methods
  function updateUserPosition() {
    if (!connected.value) {
      console.debug('WebSocket not connected, will retry when connection is established')
      if (locationError.value !== 'No connection to server') {
        locationError.value = 'No connection to server'
      }
      return
    }

    if (!isSharing.value) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const userId = userStore.user?.id

        if (!userId) {
          console.debug('No user ID available, location sharing paused')
          return
        }

        console.debug('Updating position for user ID:', userId)
        updatePosition(userId, longitude.toString(), latitude.toString())
        locationError.value = null
      },
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
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    )
  }

  function startPositionSharing() {
    if (!navigator.geolocation) {
      locationError.value = 'Geolocation is not supported by your browser'
      return
    }

    if (positionUpdateInterval) {
      clearInterval(positionUpdateInterval)
    }

    updateUserPosition()

    positionUpdateInterval = setInterval(updateUserPosition, 30000)
    isSharing.value = true
    localStorage.setItem('isSharing', 'true')
    console.debug('Position sharing started')
  }

  function stopPositionSharing() {
    if (positionUpdateInterval) {
      clearInterval(positionUpdateInterval)
      positionUpdateInterval = null
    }
    isSharing.value = false
    localStorage.setItem('isSharing', 'false')
    console.debug('Position sharing stopped')
  }

  function togglePositionSharing() {
    if (isSharing.value) {
      stopPositionSharing()
    } else {
      startPositionSharing()
    }
  }

  function attemptReconnect() {
    if (isSharing.value && !positionUpdateInterval && connected.value) {
      console.debug('Attempting to reconnect position sharing')
      startPositionSharing()
      return true
    }
    return false
  }

  watch(
    () => userStore.user?.id,
    (userId) => {
      if (userId && isSharing.value && !positionUpdateInterval) {
        console.log('User authenticated, starting position sharing')
        startPositionSharing()
      } else if (!userId && positionUpdateInterval) {
        console.log('User logged out, stopping position sharing')
        stopPositionSharing()
      }
    }
  )

  watch(
    () => connected.value,
    (isConnected) => {
      const now = Date.now();

      if (isConnected) {
        if (isSharing.value && !positionUpdateInterval) {
          console.debug('WebSocket connected, restarting position sharing');
          startPositionSharing();
        }

        if (locationError.value === 'No connection to server') {
          locationError.value = null;
        }
      } else {
        if (now - lastConnectionLogTime > connectionLogThreshold) {
          console.debug('WebSocket disconnected, will reconnect automatically');
        }
      }
    }
  )

  if (isSharing.value && userStore.user?.id) {
    setTimeout(() => {
      console.log('Initializing position sharing')
      startPositionSharing()
    }, 30000)
  }

  return {
    isSharing,
    locationError,
    startPositionSharing,
    stopPositionSharing,
    togglePositionSharing,
    updateUserPosition,
    attemptReconnect
  }
})
