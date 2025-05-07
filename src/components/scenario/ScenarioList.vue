<script>
import { ref, computed, onMounted } from 'vue'
import { useScenarioStore } from '@/stores/ScenarioStore'
import {
  AlertTriangle,
  AlertOctagon,
  Droplets,
  Flame,
  Wind,
  Thermometer,
  Zap,
  ShieldAlert,
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'

export default {
  name: 'ScenarioList',

  setup() {
    const scenarioStore = useScenarioStore()
    const router = useRouter()

    const loading = computed(() => scenarioStore.isLoading)
    const error = computed(() => scenarioStore.getError)
    const scenarios = computed(() => scenarioStore.getAllScenarios)

    const goToScenarioPage = (id) => {
      router.push(`/scenarios/${id}`)
    }

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

    // Fetch scenarios when component mounts
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
      fetchScenarios,
      goToScenarioPage
    }
  },
}
</script>

<template>
  <div class="max-w-7xl mx-auto p-5">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Scenarioer</h1>
    </div>

    <div v-if="loading" class="text-center py-10">
      <p>Laster...</p>
    </div>

    <div v-else-if="error" class="text-center py-10">
      <p class="text-red-600">Det oppstod en feil: {{ error }}</p>
    </div>

    <div v-else-if="scenarios.length === 0" class="text-center py-10">
      <p>Ingen scenarioer funnet</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <div
        v-for="scenario in scenarios"
        :key="scenario.id"
        @click="goToScenarioPage(scenario.id)"
        class="bg-white rounded-lg shadow-md border border-gray-200 h-[150px] relative"
      >
        <div class="flex flex-col items-center justify-center h-full p-5 gap-2.5">
          <component :is="getIconComponent(scenario.iconName)" size="32" class="text-blue-500" />
          <h2 class="text-lg font-medium text-center m-0">{{ scenario.name }}</h2>
        </div>
      </div>
    </div>
  </div>
</template>