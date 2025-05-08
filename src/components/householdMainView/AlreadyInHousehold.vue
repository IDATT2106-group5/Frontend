<script setup>
import { Home } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useHouseholdStore } from '@/stores/HouseholdStore'

const router = useRouter()
const householdStore = useHouseholdStore()

const goToHousehold = () => {
  router.push('/household')
}
</script>

<template>
  <div class="text-center max-w-md">
    <Home class="w-20 h-20 text-blue-700 mb-4 mx-auto" />
    <h1 class="text-2xl font-bold mb-4">Du er allerede i en husstand</h1>
    <p class="text-gray-700 mb-6">
      Du er allerede medlem av husstanden
      “{{ householdStore.currentHousehold?.name }}”.
      Du kan ikke opprette en ny husstand før du forlater den nåværende.
    </p>
    <RouterLink
      to="/household"
      >
    <button
      @click="goToHousehold"
      class="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition"
    >
      Gå til min husstand
    </button>
    </RouterLink>
  </div>
</template>
