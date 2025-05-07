<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useScenarioStore } from '@/stores/ScenarioStore'
import { Button } from '@/components/ui/button/index.js'
import {
  AlertTriangle,
  AlertOctagon,
  Droplets,
  Flame,
  Wind,
  Thermometer,
  Zap,
  ShieldAlert,
  CirclePlus
} from 'lucide-vue-next'

export default {
  name: 'ScenarioList',
  components: { CirclePlus, Button },

  setup() {
    const scenarioStore = useScenarioStore()

    const loading = computed(() => scenarioStore.isLoading)
    const error = computed(() => scenarioStore.getError)
    const scenarios = computed(() => scenarioStore.getAllScenarios)

    const iconMap = {
      0: AlertTriangle,
      1: AlertOctagon,
      2: Droplets,
      3: Flame,
      4: Wind,
      5: Thermometer,
      6: Zap,
      7: ShieldAlert,
    }

    const getIconComponent = (scenario) => {
      if (!scenario.iconIndex && scenario.iconIndex !== 0) {
        const iconIndex = scenario.id % 8
        return iconMap[iconIndex] || AlertTriangle
      }
      return iconMap[scenario.iconIndex] || AlertTriangle
    }

    onMounted(() => {
      fetchScenarios()
    })

    const fetchScenarios = async () => {
      await scenarioStore.fetchAllScenarios()
    }

    return {
      loading,
      error,
      scenarios,
      getIconComponent,
      fetchScenarios
    }
  },
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-5 py-6">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-black">Scenarioer</h1>
    </div>

    <div v-if="loading" class="text-center py-10">
      <p>Laster...</p>
    </div>

    <div v-else-if="error" class="text-center py-10 text-red-600">
      <p>Det oppstod en feil: {{ error }}</p>
      <button
        @click="fetchScenarios"
        class="mt-4 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-5 rounded"
      >
        Prøv på nytt
      </button>
    </div>

    <div v-else-if="scenarios.length === 0" class="text-center py-10">
      <p>Ingen scenarioer funnet</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <div
        v-for="scenario in scenarios"
        :key="scenario.id"
        class="bg-white rounded-lg shadow-md border border-gray-200 h-40 flex flex-col"
      >
        <div class="flex flex-col items-center justify-center flex-grow px-5 py-4">
          <component
            :is="getIconComponent(scenario)"
            size="32"
            class="text-blue-500 mb-3"
          />
          <h2 class="text-lg font-medium text-center m-0">{{ scenario.name }}</h2>
        </div>
      </div>
    </div>
  </div>
</template>
