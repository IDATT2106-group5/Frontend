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
  CirclePlus,
  Pencil
} from 'lucide-vue-next'


export default {
  name: 'ScenarioList',
  components: { CirclePlus, Pencil, Button },

  setup() {
    const router = useRouter()
    const scenarioStore = useScenarioStore()

    const loading = computed(() => scenarioStore.isLoading)
    const error = computed(() => scenarioStore.getError)
    const scenarios = computed(() => scenarioStore.getAllScenarios)

    // Map of available icons
    const iconMap = {
      // Using indexes for mapping (no need to store icon names in database)
      0: AlertTriangle,
      1: AlertOctagon,
      2: Droplets,
      3: Flame,
      4: Wind,
      5: Thermometer,
      6: Zap,
      7: ShieldAlert,
    }

    // Get icon by index or by id (for deterministic mapping)
    const getIconComponent = (scenario) => {
      // Use scenario.id to deterministically choose an icon if no explicit selection
      // This creates a consistent icon for each scenario without storing it
      if (!scenario.iconIndex && scenario.iconIndex !== 0) {
        // Get a number between 0 and 7 based on scenario.id
        const iconIndex = scenario.id % 8
        return iconMap[iconIndex] || AlertTriangle
      }

      // If iconIndex is explicitly set, use that
      return iconMap[scenario.iconIndex] || AlertTriangle
    }

    // Fetch scenarios when component mounts
    onMounted(() => {
      fetchScenarios()
    })

    const fetchScenarios = async () => {
      await scenarioStore.fetchAllScenarios()
    }

    const addNewScenario = () => {
      router.push('/scenarios/new')
    }

    const editScenario = (id) => {
      router.push(`/scenarios/${id}`)
    }

    return {
      loading,
      error,
      scenarios,
      getIconComponent,
      fetchScenarios,
      addNewScenario,
      editScenario,
    }
  },
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-5 py-6">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-black">Scenarioer</h1>
      <Button
        @click="addNewScenario"
        variant="OUTLINE"
        class="bg-[#2c3e50] hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded inline-flex items-center gap-2"
      >
        <CirclePlus class="w-4 h-4 mr-2" /> Legg til nytt scenario
      </Button>
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
      <button
        @click="addNewScenario"
        class="mt-4 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-5 rounded"
      >
        Legg til nytt scenario
      </button>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <div
        v-for="scenario in scenarios"
        :key="scenario.id"
        class="bg-white rounded-lg shadow-md border border-gray-200 h-40 flex flex-col"
      >
        <div class="flex flex-col items-center justify-center flex-grow px-5 py-4 relative">
          <!-- Position the button absolutely in the top right corner -->
          <Button
            @click="editScenario(scenario.id)"
            class="absolute top-2 right-2 bg-[#2c3e50] hover:bg-blue-600 text-white text-xs py-1 px-2 rounded inline-flex items-center gap-1"
          >
            <Pencil class="w-3 h-3" />
            Rediger
          </Button>

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