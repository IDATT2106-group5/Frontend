<script setup>
/**
 * Vue Composition API lifecycle imports.
 */
import { onMounted, onUnmounted, computed } from 'vue'

/**
 * Imports the user store to manage authentication and user related actions.
 * @see useUserStore
 */
import { useUserStore } from '@/stores/UserStore'

/**
 * Imports the date store to show and update the current time.
 * @see useDateStore
 */
import { useDateStore } from '@/stores/DateStore'

/**
 * Imports the news store to manage news related actions.
 * @see useNewsStore
 */
import { useNewsStore } from '@/stores/news/NewsStore'

/**
 * Imports the household store to manage household related actions.
 * @see useHouseholdStore
 */
import { useHouseholdStore } from '@/stores/HouseholdStore'

import { useIncidentAdminStore } from '@/stores/admin/incidentAdminStore.js'

const userStore = useUserStore()
const dateStore = useDateStore()
const newsStore = useNewsStore()
const householdStore = useHouseholdStore()
const incidentStore = useIncidentAdminStore()

/**
 * Lifecycle hook: called when the component is mounted.
 * Starts the clock (updates time every minute).
 * Attempts to auto login the user.
 * Fetches user data from the backend.
 */
onMounted(async () => {
  await newsStore.fetchPaginatedNews(0,3)
  dateStore.startClock()
  await incidentStore.fetchIncidents()
  if (!userStore.user) {
    userStore.autoLogin()
  }
  await userStore.fetchUser().then(await householdStore.currentHousehold)
})

/**
 * Computed property to get the current date and time.
 * @returns {string}
 *
 * @type {ComputedRef<{severity: null}>}
 */
const incident = computed(() =>
  incidentStore.incidents?.length ? incidentStore.incidents[0] : {
    severity: null,
    startedAt: new Date().toISOString(),
    name: 'Ingen aktive hendelser',
    description: 'Det er ingen aktive krisesituasjoner for øyeblikket.'
  }
)

/**
 * Calculates the time difference between the current time and the created_at time of a news item.
 *
 * @param createdAt
 * @returns {string|string}
 */
const calculateTimeDifference = (createdAt) => {

  const now = new Date(dateStore.currentDateTime)
  const createdTime = new Date(createdAt)
  const diffInMs = now.getTime() - createdTime.getTime()

  const minutes = Math.floor(diffInMs / (1000 * 60))
  const hours = Math.floor(diffInMs / (1000 * 60 * 60))
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (days >= 1) {
    return `${days} ${days === 1 ? 'dag' : 'dager'}`
  } else if (hours >= 1) {
    return `${hours} timer`
  } else if (minutes >= 1) {
    return `${minutes} min`
  } else {
    return 'Akkurat nå'
  }
}
/**
 * Formats a date string into a more readable format.
 *
 * @param dateString
 * @returns {string}
 */

function formatDate(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('no-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}


/**
 * Lifecycle hook: called when the component is unmounted.
 * Stops the clock interval to prevent memory leaks.
 */
onUnmounted(() => {
  dateStore.stopClock()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 font-sans">
    <!-- Header -->
    <header
      class="flex flex-col sm:flex-row items-center justify-between p-4 bg-white shadow text-center sm:text-left gap-2 sm:gap-0"
    >
      <h1 class="text-3xl md:text-5xl font-bold">KRISESITUASJON</h1>
      <div class="text-sm">
        <p class="font-semibold">Norske myndigheter</p>
        <p>{{ incident.startedAt ? formatDate(incident.startedAt) : formatDate(new Date()) }}</p>
      </div>
    </header>

    <!-- Danger Section -->
    <section class="bg-white p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6">
      <!-- Left: Danger Level -->
      <div class="text-center md:text-left">
        <p class="font-semibold">Farenivå:</p>
        <p v-if="incident.severity === 'RED'" class="text-red-600 font-bold text-lg">
          KRITISK
        </p>
        <p v-if="incident.severity === 'YELLOW'" class="text-yellow-400 font-bold text-lg">
          FARLIG
        </p>
        <p v-if="incident.severity === 'GREEN'" class="text-green-600 font-bold text-lg">
          MILD
        </p>
      </div>

      <!-- Warning Message -->
      <div class="bg-gray-50 p-4 border rounded w-full max-w-4xl mx-auto text-sm">
        <h2 class="font-bold text-lg mb-2"> {{ incident.name }}</h2>
        <p>
          {{ incident.description }}
        </p>
      </div>

      <!-- Map Placeholder -->
      <router-link to="/map" class="w-full md:w-1/3">
        <div
          class="h-48 md:h-64 bg-gray-300 rounded flex items-center justify-center text-gray-700 hover:bg-gray-400 transition cursor-pointer"
        >
          Kart
        </div>
      </router-link>
    </section>

    <!-- Latest News -->
    <section class="bg-[#2c3e50] text-white py-8 px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-6">Siste nytt</h2>
      <div
        v-for="(news, index) in newsStore.news.slice(0,3)"
        :key="index"
        class="bg-white text-black p-4 rounded flex flex-col sm:flex-row justify-between gap-2 mb-3"
        @click="$router.push('/news')"
      >
        <p class="font-semibold">{{ news.title }}</p>
        <span class="text-red-600 font-bold text-right sm:text-left">{{
          calculateTimeDifference(news.createdAt)
        }}</span>
      </div>

      <div class="text-center mt-6">
        <button
          class="bg-[#2c3e50] text-white px-4 py-2 rounded border border-white"
          @click="$router.push('/news')"
        >
          Alle nyheter
        </button>
      </div>
    </section>
    <!-- Preparedness -->
    <section class="py-10 px-4 bg-gray-100 text-center">
      <h2 class="text-3xl md:text-5xl font-bold mb-6 text-[#2c3e50]">Beredskap</h2>

      <!-- Wrapper for desktop layout -->
      <div
        class="flex flex-col md:flex-row justify-center items-center md:gap-32 gap-8 text-center"
      >
        <!-- Før -->
        <router-link to="/before" class="block">
          <div
            class="bg-[#2c3e50] text-white p-6 rounded-lg w-52 h-52 flex flex-col justify-between hover:shadow-lg transition cursor-pointer"
          >
            <p class="text-xl font-bold text-center drop-shadow-md">Før</p>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold">Les mer</span>
              <span
                class="bg-white text-[#2c3e50] rounded-md px-3 py-1 text-xl font-bold leading-none"
                >→</span
              >
            </div>
          </div>
        </router-link>

        <!-- Under -->
        <router-link to="/under" class="block">
          <div
            class="bg-[#2c3e50] text-white p-6 rounded-lg w-52 h-52 flex flex-col justify-between hover:shadow-lg transition cursor-pointer"
          >
            <p class="text-xl font-bold text-center drop-shadow-md">Under</p>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold">Les mer</span>
              <span
                class="bg-white text-[#2c3e50] rounded-md px-3 py-1 text-xl font-bold leading-none"
                >→</span
              >
            </div>
          </div>
        </router-link>

        <!-- Etter -->
        <router-link to="/after" class="block">
          <div
            class="bg-[#2c3e50] text-white p-6 rounded-lg w-52 h-52 flex flex-col justify-between hover:shadow-lg transition cursor-pointer"
          >
            <p class="text-xl font-bold text-center drop-shadow-md">Etter</p>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold">Les mer</span>
              <span
                class="bg-white text-[#2c3e50] rounded-md px-3 py-1 text-xl font-bold leading-none"
                >→</span
              >
            </div>
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>
