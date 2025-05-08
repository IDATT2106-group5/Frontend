<script setup>
/**
 * Importing the necessary components and utilities:
 * - Icons from 'lucide-vue-next' for UI elements.
 * - Vue's reactive utilities (ref, onMounted, onBeforeUnmount, watch).
 * - Custom components and stores for user and location management.
 * - WebSocket composable for handling notifications and real-time updates.
 */
import {
  AlarmCheck,
  Bell,
  Globe,
  Home,
  Info,
  Lock,
  Mail,
  Menu,
  Newspaper,
  Package,
  ShoppingCart,
  User,
} from 'lucide-vue-next'

import { onMounted, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { RouterLink, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import useWebSocket from '@/service/websocketComposable.js'
import { useLocationStore } from '@/stores/map/LocationStore.js'
import notificationSoundFile from '@/assets/bell-notification-337658.mp3'

// Stores and router
const userStore = useUserStore()
const router = useRouter()
const locationStore = useLocationStore()

// Reactive state
const mobileMenuOpen = ref(false)
const showNotifications = ref(false)

// State for notification sound
const notificationSound = ref(null)

/**
 * WebSocket state and methods.
 * @typedef {Object} WebSocketState
 * @property {Ref<Object[]>} notifications - List of received notifications.
 * @property {Ref<number>} notificationCount - Count of unread notifications.
 * @property {Function} markAsRead - Marks a notification as read.
 * @property {Function} resetNotificationCount - Resets the notification count.
 * @property {Ref<boolean>} showIncidentPopup - Whether to show the incident alert popup.
 * @property {Ref<Object|null>} currentIncident - Current incident details.
 * @property {Function} closeIncidentPopup - Closes the incident popup.
 * @property {Ref<boolean>} connected - WebSocket connection state.
 */

// Destructure WebSocket composable for notification handling
const {
  notifications,
  notificationCount,
  markAsRead,
  resetNotificationCount,
  showIncidentPopup,
  currentIncident,
  closeIncidentPopup,
  connected,
} = useWebSocket()

// Destructure location store for position sharing
const { isSharing, startPositionSharing } = useLocationStore()

/**
 * A function to handle the sound notification.
 */
function playNotificationSound() {
  console.log('Playing notification sound')
  if (notificationSound.value) {
    notificationSound.value.currentTime = 0 // Reset sound to beginning
    notificationSound.value.play().catch(error => {
      // Handle autoplay restrictions (common in browsers)
      console.log('Could not play notification sound:', error)
    })
  }
}
/**
 * Toggles the visibility of the notifications panel.
 * Marks all notifications as read when the panel is opened.
 */
function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    resetNotificationCount()

    notifications.value.forEach((notification) => {
      if (!notification.read) {
        markAsRead(notification.id)
      }
    })
  }
}

/**
 * Marks a single notification as read by ID.
 * @param {number|string} notificationId - The ID of the notification to mark as read.
 */
function handleMarkAsRead(notificationId) {
  markAsRead(notificationId)
}

/**
 * Formats a timestamp into human-readable format.
 * @param {string|number|Date} timestamp - The timestamp to format.
 * @returns {string} Formatted timestamp string.
 */
function formatTimestamp(timestamp) {
  const date = new Date(timestamp)

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Month is 0-indexed
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}, ${day}.${month}.${year}`
}

/**
 * Logs the user out and redirects to the login page.
 */
function handleLogout() {
  userStore.logout()
  router.push('/login')
}

/**
 * Lifecycle hook: Executes when the component is mounted.
 * Starts position sharing if the WebSocket is connected and sharing is enabled.
 */
onMounted(() => {
  if (connected.value && isSharing) {
    startPositionSharing()
  } else {
    console.log('WebSocket not connected')
  }

  if (notificationSound.value) {
    notificationSound.value.src = notificationSoundFile
  }
})

/**
 * Watches for changes in the WebSocket connection status.
 * If connected and sharing is enabled, starts position sharing.
 */
watch(
  () => connected.value,
  (isConnected) => {
    if (isSharing && isConnected) {
      startPositionSharing()
    }
  },
)
/**
 * Watches for changes in the notification count.
 * If the count increases, plays the notification sound.
 */
watch(
  () => notificationCount.value,
  (newCount, oldCount) => {
    if (newCount > oldCount && oldCount !== undefined) {
      playNotificationSound()
    }
  }
)


/**
 * Determines the route to navigate to based on the notification type.
 * @param {Object} notification - The notification object.
 * @returns {string} - The route path.
 */
function getNotificationRoute(notification) {
  switch (notification.type) {
    case 'INVITATION':
      return '/household'
    case 'MEMBERSHIP_REQUEST':
      return '/household'
    case 'HOUSEHOLD':
      return '/household'
    case 'INCIDENT':
      return '/map'
    case 'STOCK_CONTROL':
      return '/storage'
    default:
      return '/'
  }
}

/**
 * Mapping of notification types to icon components.
 * @type {Record<string, object>}
 */
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
  <audio ref="notificationSound" preload="auto"></audio>
  <!-- Incident Popup -->
  <transition name="fade">
    <div
      v-if="showIncidentPopup && currentIncident"
      class="fixed inset-0 flex items-center justify-center z-[2000] bg-black bg-opacity-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div class="bg-blue-600 p-4 text-white flex justify-between items-center">
          <div class="flex items-center">
            <AlarmCheck class="w-6 h-6 mr-2" />
            <h3 class="text-lg font-bold">EMERGENCY ALERT</h3>
          </div>
          <button @click="closeIncidentPopup" class="text-white hover:text-gray-200">
            <span class="text-2xl">×</span>
          </button>
        </div>
        <div class="p-6">
          <p class="text-lg mb-4">{{ currentIncident.message }}</p>
          <p v-show="!locationStore.isSharing" class="text-sm text-gray-500 mb-4">
            Del posisjon for å tillate husstanden din til å se posisjonen din
          </p>
          <p v-show="locationStore.isSharing" class="text-sm text-gray-500 mb-4">
            Din posisjon er delt med husstanden din, gå til kartet for å se om de er i faresonen
          </p>
          <p class="text-sm text-gray-500 mb-6">
            {{ formatTimestamp(currentIncident.timestamp) }}
          </p>
          <div class="flex justify-center gap-3 pt-4">
            <Button
              v-show="!locationStore.isSharing"
              @click="startPositionSharing"
              variant="default"
              class="ml-2 bg-blue-600 hover:bg-blue-700"
            >
              Del posisjon
            </Button>
            <Button
              @click="closeIncidentPopup"
              variant="default"
              class="bg-red-600 hover:bg-red-700"
            >
              Lukk
            </Button>
          </div>
        </div>
      </div>
    </div>
  </transition>
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
        <RouterLink to="/nyheter" class="flex items-center gap-2 hover:underline">
          <Newspaper class="w-5 h-5 text-white" />
          Nyheter
        </RouterLink>
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
          Beholdning
        </RouterLink>
        <RouterLink to="/household" class="flex items-center gap-2 hover:underline">
          <User class="w-5 h-5 text-white" />
          Husstand
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

        <!-- Login/Logout Button -->
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

  <!-- Notifications Panel -->
  <div
    v-if="showNotifications"
    class="fixed right-4 top-16 w-72 bg-white shadow-lg rounded-md border border-gray-200 z-[1001]"
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
        @click="router.push(getNotificationRoute(notification))"
      >
        <div class="flex">
          <div class="mr-3 text-gray-700">
            <component :is="notificationIcons[notification.type] || Bell" class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <span class="font-medium">{{ notification.message }}</span>
              <span class="text-xs text-gray-500">{{
                formatTimestamp(notification.timestamp)
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
