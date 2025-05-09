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
  Pencil,
  Map,
  Bomb,
  Waves
} from 'lucide-vue-next'

export default {
  name: 'ScenarioList',
  components: {
    Map,
    Button,
    CirclePlus,
    Pencil,
  },

  /**
   * @function setup
   * @description Vue Composition API setup function that handles component logic
   * @returns {Object} Reactive properties and methods for the component template
   */
  setup() {
    const router = useRouter()
    const scenarioStore = useScenarioStore()

    /**
     * @computed loading
     * @description Tracks the loading state from the scenario store
     * @returns {Boolean} True if scenarios are being loaded, false otherwise
     */
    const loading = computed(() => scenarioStore.isLoading)

    /**
     * @computed error
     * @description Retrieves any error state from the scenario store
     * @returns {String|null} Error message or null if no error
     */
    const error = computed(() => scenarioStore.getError)

    /**
     * @computed scenarios
     * @description Gets the list of all scenarios from the store
     * @returns {Array} List of scenario objects
     */
    const scenarios = computed(() => scenarioStore.getAllScenarios)

    /**
     * @constant {Object} iconMap
     * @description Maps icon names to their corresponding component references
     * Used for dynamically displaying the correct icon for each scenario
     */
    const iconMap = {
      AlertTriangle,
      AlertOctagon,
      Droplets,
      Flame,
      Wind,
      Thermometer,
      Zap,
      ShieldAlert,
      Bomb,
      Waves,
    }

    /**
     * @function getIconComponent
     * @description Retrieves the appropriate icon component based on icon name
     * @param {String} iconName - The name of the icon to retrieve
     * @returns {Component} The icon component or a default if not found
     */
    const getIconComponent = (iconName) => {
      return iconMap[iconName] || AlertTriangle
    }

    /**
     * @function onMounted
     * @description Lifecycle hook that fetches scenarios when component mounts
     */
    onMounted(() => {
      fetchScenarios()
    })

    /**
     * @function fetchScenarios
     * @description Retrieves all scenarios from the store
     * @async
     */
    const fetchScenarios = async () => {
      await scenarioStore.fetchAllScenarios()
    }

    /**
     * @function addNewScenario
     * @description Navigates to the new scenario creation page
     */
    const addNewScenario = () => {
      router.push('/admin-scenarios/new')
    }

    /**
     * @function editScenario
     * @description Navigates to the edit page for a specific scenario
     * @param {Number} id - The ID of the scenario to edit
     */
    const editScenario = (id) => {
      router.push(`/admin-scenarios/${id}`)
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
  <div class="max-w-7xl mx-auto p-5">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Scenarioer</h1>
      <Button
        @click="addNewScenario"
        variant="outline"
        class="text-white border-white bg-[#2c3e50] hover:bg-blue-600 hover:text-white"
      >
        <CirclePlus class="w-4 h-4 mr-2" />
        Legg til nytt scenario
      </Button>
    </div>

    <div v-if="loading" class="text-center py-10">
      <p>Laster...</p>
    </div>

    <div v-else-if="error" class="text-center py-10">
      <p class="text-red-600">Det oppstod en feil: {{ error }}</p>
      <Button
        @click="fetchScenarios"
        class="bg-green-500 hover:bg-green-600 text-white font-medium rounded mt-4 px-5 py-3"
      >
        Prøv på nytt
      </Button>
    </div>

    <div v-else-if="scenarios.length === 0" class="text-center py-10">
      <p>Ingen scenarioer funnet</p>
      <Button
        @click="addNewScenario"
        class="bg-green-500 hover:bg-green-600 text-white font-medium rounded mt-4 px-5 py-3"
      >
        <CirclePlus class="w-4 h-4 mr-2" />
        Legg til nytt scenario
      </Button>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <div
        v-for="scenario in scenarios"
        :key="scenario.id"
        class="bg-white rounded-lg shadow-md border border-gray-200 h-[150px] relative"
      >
        <div class="absolute top-3 right-3">
          <Button
            @click="editScenario(scenario.id)"
            variant="outline"
            class="text-white border-white bg-[#2c3e50] hover:bg-blue-600 hover:text-white"
          >
            <Pencil class="w-3 h-3" />
            Rediger
          </Button>
        </div>
        <div class="flex flex-col items-center justify-center h-full p-5 gap-2.5">
          <component :is="getIconComponent(scenario.iconName)" size="32" class="text-blue-500" />
          <h2 class="text-lg font-medium text-center m-0">{{ scenario.name }}</h2>
        </div>
      </div>
    </div>
  </div>
</template>

