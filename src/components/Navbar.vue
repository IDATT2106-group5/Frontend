<script setup xmlns="http://www.w3.org/1999/html">
import {
  AlarmCheck,
  Bell,
  Globe,
  Home,
  Info,
  Lock,
  Mail,
  Map,
  Menu,
  Newspaper,
  Package,
  ShoppingCart,
  User,
} from 'lucide-vue-next'

import { onBeforeUnmount, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { RouterLink, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import useWebSocket from '@/service/websocketComposable.js'

const userStore = useUserStore()
const router = useRouter()
const mobileMenuOpen = ref(false)
const showNotifications = ref(false)
const isSharing = ref(localStorage.getItem('isSharing') === 'true')
const locationError = ref(null)
let positionUpdateInterval = null

const {
  notifications,
  notificationCount,
  markAsRead,
  resetNotificationCount,
  connected,
  updatePosition,
  subscribeToPosition,
} = useWebSocket()

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    resetNotificationCount()
  }
}

function handleMarkAsRead(notificationId) {
  markAsRead(notificationId)
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('no-NO', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  })
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}

function updateUserPosition() {
  if (!connected.value) return

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      const userId = userStore.userId || 44
      console.log('User ID:', userId)
      updatePosition(userId, longitude.toString(), latitude.toString())
      locationError.value = null
    },
    (error) => {
      console.error('Geolocation error:', error)
      locationError.value = 'Could not access your location'
      stopPositionSharing()
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    },
  )
}

function startPositionSharing() {
  if (!navigator.geolocation) {
    locationError.value = 'Geolocation is not supported by your browser'
    return
  }

  updateUserPosition()
  positionUpdateInterval = setInterval(updateUserPosition, 10000)
  isSharing.value = true
  localStorage.setItem('isSharing', true)
  console.log('Position sharing allowed:', localStorage.getItem('isSharing'))
}

function stopPositionSharing() {
  if (positionUpdateInterval) {
    clearInterval(positionUpdateInterval)
    positionUpdateInterval = null
  }
  isSharing.value = false
  localStorage.setItem('isSharing', false)
  console.log('Position sharing allowed:', localStorage.getItem('isSharing'))
}

function togglePositionSharing() {
  if (isSharing.value) {
    stopPositionSharing()
  } else {
    startPositionSharing()
  }
  localStorage.setItem('isSharing', isSharing.value)
}

onBeforeUnmount(() => {
  stopPositionSharing()
})

const notificationIcons = {
  INVITATION: Mail,
  MEMBERSHIP_REQUEST: User,
  INCIDENT: AlarmCheck,
  STOCK_CONTROL: Package,
  HOUSEHOLD: Home,
  INFO: Info,
}
</script>

<template>
  <header class="bg-[#2c3e50] text-white px-6 py-4 shadow">
    <div class="flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-3">
        <img
          src="/src/assets/icons/Krisefikser.png"
          alt="Logo"
          class="h-12 w-auto object-contain bg-white rounded-full p-1"
        />
        <span class="text-xl font-semibold hidden sm:inline">Krisefikser</span>
      </RouterLink>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex gap-8 items-center text-sm font-medium">
        <a href="#" class="flex items-center gap-2 hover:underline">
          <Newspaper class="w-5 h-5 text-white" />
          Nyheter
        </a>
        <RouterLink to="/map" class="flex items-center gap-2 hover:underline">
          <Globe class="w-5 h-5 text-white" />
          Kart
        </RouterLink>
        <RouterLink
          v-if="userStore.token"
          to="/storage"
          class="flex items-center gap-2 hover:underline"
        >
          <ShoppingCart class="w-5 h-5 text-white" />
          Min beholdning
        </RouterLink>
        <RouterLink to="/household" class="flex items-center gap-2 hover:underline">
          <User class="w-5 h-5 text-white" />
          Min husstand
        </RouterLink>
        <RouterLink
          v-if="userStore.isAdmin"
          to="/admin-dashboard"
          class="flex items-center gap-2 hover:underline"
        >
          <Lock class="w-5 h-5 text-white" />
          Admin
        </RouterLink>
      </nav>

      <!-- Right Side -->
      <div class="flex gap-4 items-center">
        <div
          @click="toggleNotifications"
          class="relative cursor-pointer hover:bg-blue-600 p-2 rounded transition-colors"
        >
          <Bell class="w-5 h-5 text-white fill-white" />
          <span
            v-if="notificationCount > 0"
            class="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {{ notificationCount }}
          </span>
        </div>

        <template v-if="userStore.token">
          <Button
            @click="handleLogout"
            variant="outline"
            class="text-white border-white bg-[#2c3e50] hover:bg-red-600"
          >
            Logg ut
          </Button>
        </template>
        <template v-else>
          <RouterLink to="/login">
            <Button
              variant="outline"
              class="text-white border-white bg-[#2c3e50] hover:bg-gray-300"
            >
              Login
            </Button>
          </RouterLink>
        </template>
      </div>

      <!-- Hamburger for mobile -->
      <button class="md:hidden" @click="mobileMenuOpen = !mobileMenuOpen">
        <Menu class="w-6 h-6 text-white" />
      </button>
    </div>

    <!-- Mobile Navigation -->
    <div v-if="mobileMenuOpen" class="md:hidden mt-4 flex flex-col gap-4 text-sm font-medium">
      <a href="#" class="flex items-center gap-2 hover:underline">
        <Newspaper class="w-5 h-5 text-white" />
        Nyheter
      </a>
      <RouterLink to="/map" class="flex items-center gap-2 hover:underline">
        <Globe class="w-5 h-5 text-white" />
        Kart
      </RouterLink>
      <RouterLink
        v-if="userStore.token"
        to="/storage"
        class="flex items-center gap-2 hover:underline"
      >
        <ShoppingCart class="w-5 h-5 text-white" />
        Min beholdning
      </RouterLink>
      <RouterLink to="/household" class="flex items-center gap-2 hover:underline">
        <User class="w-5 h-5 text-white" />
        Min husstand
      </RouterLink>
      <RouterLink
        v-if="userStore.isAdmin"
        to="/admin-dashboard"
        class="flex items-center gap-2 hover:underline"
      >
        <Lock class="w-5 h-5 text-white" />
        Admin
      </RouterLink>
    </div>
  </header>

  <!-- Add this button next to the notifications button in the Auth and notifications div -->
  <Button
    @click="togglePositionSharing"
    variant="outline"
    :class="[
      'text-white border-white bg-[#2c3e50]',
      isSharing ? 'hover:bg-red-600' : 'hover:bg-green-600',
    ]"
  >
    <Map class="w-4 h-4 mr-2" />
    {{ isSharing ? 'Stop deling' : 'Del posisjon' }}
  </Button>

  <!-- Notifications Panel -->
  <div
    v-if="showNotifications"
    class="fixed right-4 top-16 w-72 bg-white shadow-lg rounded-md border border-gray-200 z-50"
  >
    <div class="p-3 border-b border-gray-200 flex justify-between items-center">
      <div class="flex items-center">
        <Bell class="w-4 h-4 mr-2" />
        <h3 class="font-medium">Varsler</h3>
      </div>
      <Button @click="toggleNotifications" variant="ghost" size="sm" class="h-7 w-7 p-0">×</Button>
    </div>

    <div class="max-h-80 overflow-y-auto">
      <div v-if="notifications.length === 0" class="p-4 text-center text-gray-500">
        Ingen varsler
      </div>
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
        :class="{ 'bg-blue-50': !notification.read }"
        @click="handleMarkAsRead(notification.id)"
      >
        <div class="flex">
          <div class="mr-3 text-gray-700">
            <component
              :is="notificationIcons[notification.type] || Bell"
              class="w-5 h-5"
            />
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <span class="font-medium">{{ notification.message }}</span>
              <span class="text-xs text-gray-500">{{ formatTimestamp(notification.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
