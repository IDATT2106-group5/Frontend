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
      console.debug('WebSocket not connected, will retry when connection is established')
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
            locationError.value = 'Posisjon tilgang nektet. Vennligst aktiver posisjonstjenester.'
            break
          case error.POSITION_UNAVAILABLE:
            locationError.value = 'Posisjoninformasjon er utilgjengelig.'
            break
          case error.TIMEOUT:
            locationError.value = 'Posisjon forespørsel utløpt.'
            break
          default:
            locationError.value = 'Feil ved henting av posisjon.'
        }

        stopPositionSharing()
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    )

    locationError.value = null
  }

  function startPositionSharing() {
    if (!navigator.geolocation) {
      locationError.value = 'Positionering er ikke tilgjengelig i nettleseren din'
      return
    }
    if (positionUpdateInterval.value) {
      clearInterval(positionUpdateInterval.value)
    }

    positionUpdateInterval.value = setInterval(updateUserPosition, 30000)
    isSharing.value = true
    localStorage.setItem('isSharing', 'true')
    console.debug('Position sharing started')
  }

  function stopPositionSharing() {
    updateUserPosition()
    if (positionUpdateInterval.value) {
      clearInterval(positionUpdateInterval.value)
      positionUpdateInterval.value = null
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

        if (locationError.value === 'Ingen tilkobling til server') {
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
