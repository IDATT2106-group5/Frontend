<script>
import { ref, computed, onMounted } from 'vue'
import { useScenarioStore } from '@/stores/ScenarioStore'
import { useRoute, useRouter } from 'vue-router'
import {
  AlertTriangle,
  AlertOctagon,
  Droplets,
  Flame,
  Wind,
  Thermometer,
  Zap,
  ShieldAlert,
  Bomb
} from 'lucide-vue-next'

export default {
  name: 'ScenarioInfo',

  setup() {
    const scenarioStore = useScenarioStore()
    const route = useRoute()
    const router = useRouter()

    const loading = computed(() => scenarioStore.isLoading)
    const error = computed(() => scenarioStore.getError)
    const scenario = computed(() => scenarioStore.getSelectedScenario)

    // Map icon names to components
    const iconMap = {
      AlertTriangle,
      AlertOctagon,
      Droplets,
      Flame,
      Wind,
      Thermometer,
      Zap,
      ShieldAlert,
    }

    // Get the appropriate icon component
    const getIconComponent = (iconName) => {
      return iconMap[iconName] || AlertTriangle // Default to AlertTriangle if icon not found
    }

    // Go back to all scenarios
    const goBackToScenarios = () => {
      router.push('/scenarios')
    }

    onMounted(async () => {
      const scenarioId = parseInt(route.params.id)
      if (!isNaN(scenarioId)) {
        try {
          await scenarioStore.fetchScenarioById(scenarioId)
        } catch (err) {
          console.error('Failed to load scenario:', err)
        }
      }
    })

    return {
      loading,
      error,
      scenario,
      getIconComponent,
      goBackToScenarios
    }
  },
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-5">
    <!-- Back button -->
    <button
      @click="goBackToScenarios"
      class="flex items-center text-gray-700 mb-6 hover:text-gray-900"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Alle scenarioer
    </button>

    <div v-if="loading" class="text-center py-10">
      <p>Laster...</p>
    </div>

    <div v-else-if="error" class="text-center py-10">
      <p class="text-red-600">Det oppstod en feil: {{ error }}</p>
    </div>

    <div v-else-if="!scenario" class="text-center py-10">
      <p>Scenario ikke funnet</p>
    </div>

    <div v-else>
      <!-- Header section with scenario name -->
      <div class="flex items-center mb-6">
        <h1 class="text-4xl font-bold text-gray-800">{{ scenario.name }}</h1>
      </div>

      <!-- About this scenario section -->
      <section class="mb-10">
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Om dette scenarioet</h2>
        <p class="text-gray-700">{{ scenario.description }}</p>
      </section>

      <!-- What you should do section -->
      <section class="mb-10">
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Hva du bør gjøre</h2>
        <p class="text-gray-700">{{ scenario.toDo }}</p>
      </section>

      <!-- Packing list section -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Pakkeliste</h2>
        <p class="text-gray-700">{{ scenario.packingList }}</p>
      </section>
    </div>
  </div>
</template>