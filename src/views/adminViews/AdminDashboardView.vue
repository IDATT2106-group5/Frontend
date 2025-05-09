<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/AdminStore'
import { useUserStore } from '@/stores/UserStore'
import ArrowIcon from '@/components/ArrowIcon.vue'

const router = useRouter()
const adminStore = useAdminStore()
const userStore = useUserStore()


/**
 * Navigates to the specified route within the application.
 *
 * @param {string} route - The name or path of the route to navigate to.
 */
function navigateToRoute(route) {
  if (route) {
    router.push(route)
  }
}

onMounted(async () => {
  if (!userStore.user) {
    await userStore.fetchUser()
  }

  if (!userStore.isAdmin) {
    return router.push('/not-authorized')
  }

  adminStore.fetchIncidents()

  if (userStore.isSuperAdmin) {
    adminStore.fetchAdmins()
  }
})

const crisisCount = computed(() => adminStore.incidents.length)
const adminCount = computed(() => adminStore.admins.length)

const crisisTypes = ref([
  { name: 'Flom', count: 1, color: 'bg-blue-500' },
  { name: 'Strømbrudd', count: 1, color: 'bg-orange-400' },
  { name: 'Vannforsyning', count: 1, color: 'bg-blue-200' }
])

const adminButtons = computed(() => {
  const buttons = [
    { label: 'Aktive kriser', route: '/admin/incidents' },
    { label: 'Kart markører', route: '/admin/map-icons' },
    { label: 'Nyhetshåndtering', route: '/admin/admin-news'},
    { label: 'Scenarioer', route: 'admin-scenarios' },
  ]

  if (userStore.isSuperAdmin) {
    buttons.push({ label: 'Admin brukere', route: 'admin-users' })
  }

  return buttons
})
</script>

<template>
  <div v-if="userStore.isLoading" class="p-6 text-center text-gray-600">Laster...</div>

  <div v-else-if="!userStore.isAdmin" class="p-6 text-center text-red-600">
    Du har ikke tilgang til denne siden.
  </div>

  <div v-else class="min-h-screen p-6 font-sans bg-background">
    <h1 class="text-3xl font-bold mb-8 text-center" style="color: #3A465E;">Admin dashboard</h1>

    <!-- Button Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
      <button
        v-for="btn in adminButtons"
        :key="btn.label"
        :class="[
          'w-full h-16 px-4 text-left font-bold border rounded flex justify-between items-center shadow-sm transition',
          btn.isPrimary
        ? 'text-red-600 border-red-600 border-2 bg-white'
        : 'text-gray-800 border bg-white'
        ]"
        :v-if="btn.label == 'Admin brukere'"
        @click="btn.route ? navigateToRoute(btn.route) : null"
      >
        {{ btn.label }}
        <ArrowIcon class="w-5" />
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-10">
      <div class="bg-white border rounded p-4 text-center shadow-sm">
        <div class="text-gray-600 text-sm">Aktive kriser</div>
        <div class="text-2xl font-bold">{{ crisisCount }}</div>
      </div>

      <div
        v-if="userStore.isSuperAdmin"
        class="bg-white border rounded p-4 text-center shadow-sm"
      >
        <div class="text-gray-600 text-sm">Admin brukere</div>
        <div class="text-2xl font-bold">{{ adminCount }}</div>
      </div>

      <div class="bg-white border rounded p-4 shadow-sm">
        <div class="text-gray-600 text-sm mb-2 font-semibold">Krisetyper</div>
        <div
          v-for="type in crisisTypes"
          :key="type.name"
          class="text-sm mb-1 flex justify-between items-center"
        >
          <span>{{ type.name }}</span>
          <div class="flex items-center gap-2">
            <div :class="[type.color, 'h-2 w-16 rounded']"></div>
            <span class="font-semibold">{{ type.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
