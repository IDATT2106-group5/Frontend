// stores/LocationStore.js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import useWebSocket from '@/service/websocketComposable.js'

export const useLocationStore = defineStore('location', () => {
  // State
  const isSharing = ref(localStorage.getItem('isSharing') === 'true')
  const locationError = ref(null)
  const positionUpdateInterval = ref(null)

  // Get dependencies
  const userStore = useUserStore()
  const { updatePosition, connected } = useWebSocket()

  // Methods
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
      async (position) => {
        const { latitude, longitude } = position.coords

        console.debug('Updating position for current user')
        await updatePosition(userStore.token, longitude.toString(), latitude.toString())
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
        timeout: 300000,
        maximumAge: 30000,
      },
    )

    locationError.value = null
  }

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

  function stopPositionSharing() {
    updateUserPosition()
    if (positionUpdateInterval.value) {
      clearInterval(positionUpdateInterval.value)
      positionUpdateInterval.value = null
    }
    isSharing.value = false
    localStorage.setItem('isSharing', 'false')
  }

  function togglePositionSharing() {
    if (isSharing.value === true) {
      stopPositionSharing()
    } else {
      startPositionSharing()
    }
  }

  function attemptReconnect() {
    if (isSharing.value && !positionUpdateInterval.value && connected.value) {
      console.debug('Attempting to reconnect position sharing')
      startPositionSharing()
      return true
    }
    return false
  }

  watch(
    () => userStore.user?.id,
    (userId) => {
      if (userId && isSharing.value && !positionUpdateInterval.value) {
        startPositionSharing()
      } else if (!userId && positionUpdateInterval.value) {
        stopPositionSharing()
      }
    },
  )

  watch(
    () => connected.value,
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

  if (isSharing.value && userStore.user?.id) {
    setTimeout(() => {
      startPositionSharing()
    }, 30000)
  }

  return {
    isSharing,
    locationError,
    startPositionSharing,
    togglePositionSharing,
  }
})
