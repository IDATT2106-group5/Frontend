<script>
import { ref, computed, onMounted } from 'vue'
import { useScenarioStore } from '@/stores/ScenarioStore'
import { useRoute, useRouter } from 'vue-router'
import {
  AlertTriangle, AlertOctagon, Droplets, Flame, Wind, Thermometer, Zap, ShieldAlert, Trash2, Bomb,
  Waves, Car, ThermometerSun, Nfc, CloudDrizzle, FlashlightOff, Footprints, Snowflake, Swords,
  MountainSnow, CloudLightning, FlaskRound, LightbulbOff, FlaskConical, Syringe, Atom, DropletOff,
} from 'lucide-vue-next'

export default {
  name: 'ScenarioInfo',

  /**
   * @function setup
   * @description Vue Composition API setup function that handles component logic
   * @returns {Object} Reactive properties and methods for the component template
   */
  setup() {
    const scenarioStore = useScenarioStore()
    const route = useRoute()
    const router = useRouter()

    /**
     * @computed loading
     * @description Tracks the loading state from the scenario store
     * @returns {Boolean} True if the scenario is being loaded, false otherwise
     */
    const loading = computed(() => scenarioStore.isLoading)

    /**
     * @computed error
     * @description Retrieves any error state from the scenario store
     * @returns {String|null} Error message or null if no error
     */
    const error = computed(() => scenarioStore.getError)

    /**
     * @computed scenario
     * @description Gets the currently selected scenario from the store
     * @returns {Object|null} The scenario object or null if none is selected
     */
    const scenario = computed(() => scenarioStore.getSelectedScenario)

    /**
     * @constant {Object} iconMap
     * @description Maps icon names to their corresponding component references
     * Used for dynamically displaying the correct icon for the scenario
     */
    const iconMap = {
      AlertTriangle, AlertOctagon, Droplets, Flame, Wind, Thermometer, Zap, ShieldAlert, Trash2, Bomb,
      Waves, Car, ThermometerSun, Nfc, CloudDrizzle, FlashlightOff, Footprints, Snowflake, Swords,
      MountainSnow, CloudLightning, FlaskRound, LightbulbOff, FlaskConical, Syringe, Atom, DropletOff,
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
     * @function goBackToScenarios
     * @description Navigates back to the scenarios list page
     */
    const goBackToScenarios = () => {
      router.push('/scenarios')
    }

    /**
     * @function onMounted
     * @description Lifecycle hook that fetches the specific scenario when component mounts
     * Extracts the scenario ID from route parameters and loads the corresponding scenario
     * @async
     */
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