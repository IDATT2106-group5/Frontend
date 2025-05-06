<script setup>
import { Newspaper, Globe, ShoppingCart, User, Menu, Bell } from 'lucide-vue-next'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { RouterLink, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import useStompWebSocket from '@/service/websocketComposable.js'

const userStore = useUserStore()
const router = useRouter()
const mobileMenuOpen = ref(false)
const showNotifications = ref(false)

const { notifications, notificationCount, markAsRead, resetNotificationCount } = useStompWebSocket()

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
</script>

<template>
  <header class="bg-[#2c3e50] text-white px-6 py-4 shadow">
    <div class="flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-3">
        <img src="/src/assets/icons/Krisefikser.png" alt="Logo" class="h-12 w-auto object-contain bg-white rounded-full p-1" />
        <span class="text-xl font-semibold hidden sm:inline">Krisefikser</span>
      </RouterLink>

      <nav class="hidden md:flex gap-8 items-center text-sm font-medium">
        <a href="#" class="flex items-center gap-2 hover:underline">
          <Newspaper class="w-5 h-5 text-white" />
          Nyheter
        </a>
        <RouterLink to="/admin/map-icons" class="flex items-center gap-2 hover:underline">
          <Globe class="w-5 h-5 text-white" />
          Kart
        </RouterLink>
        <a href="#" class="flex items-center gap-2 hover:underline">
          <ShoppingCart class="w-5 h-5 text-white" />
          Min beholdning
        </a>
        <RouterLink to="/household" class="flex items-center gap-2 hover:underline">
          <User class="w-5 h-5 text-white" />
          Min husstand
        </RouterLink>
      </nav>

      <div class="flex gap-4 items-center">
        <Button @click="toggleNotifications" variant="outline" class="text-white border-white bg-[#2c3e50] hover:bg-blue-600 relative">
          <Bell class="w-4 h-4 mr-2" />
          Varsler
          <span v-if="notificationCount > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {{ notificationCount }}
          </span>
        </Button>

        <template v-if="userStore.token">
          <Button @click="handleLogout" variant="outline" class="text-white border-white bg-[#2c3e50] hover:bg-red-600">
            Logg ut
          </Button>
        </template>
        <template v-else>
          <RouterLink to="/login">
            <Button variant="outline" class="text-white border-white bg-[#2c3e50] hover:bg-gray-300">
              Login
            </Button>
          </RouterLink>
        </template>
      </div>

      <button class="md:hidden" @click="mobileMenuOpen = !mobileMenuOpen">
        <Menu class="w-6 h-6 text-white" />
      </button>
    </div>

    <div v-if="mobileMenuOpen" class="md:hidden mt-4 flex flex-col gap-4 text-sm font-medium">
      <a href="#" class="flex items-center gap-2 hover:underline">
        <Newspaper class="w-5 h-5 text-white" />
        Nyheter
      </a>
      <RouterLink to="/map" class="flex items-center gap-2 hover:underline">
        <Globe class="w-5 h-5 text-white" />
        Kart
      </RouterLink>
      <a href="#" class="flex items-center gap-2 hover:underline">
        <ShoppingCart class="w-5 h-5 text-white" />
        Min beholdning
      </a>
      <RouterLink to="/household" class="flex items-center gap-2 hover:underline">
        <User class="w-5 h-5 text-white" />
        Min husstand
      </RouterLink>
    </div>
  </header>

  <div v-if="showNotifications" class="fixed right-4 top-16 w-72 bg-white shadow-lg rounded-md border border-gray-200 z-50">
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
      <div v-for="notification in notifications" :key="notification.id" class="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer" :class="{ 'bg-blue-50': !notification.read }" @click="handleMarkAsRead(notification.id)">
        <div class="flex">
          <div class="mr-3 text-xl">
            {{
              notification.type === 'INVITATION' ? '📩' :
              notification.type === 'MEMBERSHIP_REQUEST' ? '👤' :
              notification.type === 'INCIDENT' ? '🚨' :
              notification.type === 'STOCK_CONTROL' ? '📦' :
              notification.type === 'HOUSEHOLD' ? '🏠' :
              notification.type === 'INFO' ? 'ℹ️' : '🔔'
            }}
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
