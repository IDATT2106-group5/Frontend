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
import BeforeStepIndicator from '@/components/BeforeStepIndicator.vue'

export default {
  name: 'ScenarioList',
  components: {
    BeforeStepIndicator
  },
  setup() {
    const scenarioStore = useScenarioStore()
    const router = useRouter()

    /**
     * Indicates whether scenario data is currently being loaded.
     * 
     * @type {import('vue').ComputedRef<boolean>}
     */
    const loading = computed(() => scenarioStore.isLoading)

    /**
     * Stores any error that occurred during scenario fetching.
     * 
     * @type {import('vue').ComputedRef<string | null>}
     */
    const error = computed(() => scenarioStore.getError)

     /**
     * Contains all fetched scenarios.
     * 
     * @type {import('vue').ComputedRef<Array>}
     */
    const scenarios = computed(() => scenarioStore.getAllScenarios)

    /**
     * Navigates to a specific scenario's detail page using its ID.
     *
     * @param {string|number} id - The scenario ID.
     * @returns {void}
     */
    const goToScenarioPage = (id) => {
      router.push(`/scenarios/${id}`)
    }

    /**
     * Navigates to the "Before Crisis" overview page.
     *
     * @returns {void}
     */
    const goToOverview = () => {
      router.push('/before')
    }

    /**
     * Maps icon names to their corresponding component from lucide-vue-next.
     *
     * @type {Record<string, object>}
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
    }

    /**
     * Returns the icon component matching a given name.
     *
     * @param {string} iconName - The name of the icon to resolve.
     * @returns {object} The Vue component for the icon.
     */
    const getIconComponent = (iconName) => {
      return iconMap[iconName] || AlertTriangle
    }

    onMounted(() => {
      fetchScenarios()
    })
    
    /**
     * Fetches all scenarios from the store.
     *
     * @returns {Promise<void>}
     */
    const fetchScenarios = async () => {
      await scenarioStore.fetchAllScenarios()
    }

    return {
      loading,
      error,
      scenarios,
      getIconComponent,
      fetchScenarios,
      goToScenarioPage,
      goToOverview
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
        class="bg-white rounded-lg shadow-md border border-gray-200 h-[150px] relative cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-[#2c3e50] hover:border-3"
      >
        <div class="flex flex-col items-center justify-center h-full p-5 gap-2.5">
          <component :is="getIconComponent(scenario.iconName)" size="32" class="text-blue-500" />
          <h2 class="text-lg font-medium text-center m-0">{{ scenario.name }}</h2>
        </div>
      </div>
    </div>

    <!-- Step indicator and Oversikt button at bottom -->
    <div class="mt-16 flex flex-col items-center gap-4">
      <BeforeStepIndicator :currentStep="1" />
      <button
        @click="goToOverview"
        class="flex items-center gap-2 text-[#2c3e50] hover:underline text-sm"
      >
        <span class="text-xl">←</span> Oversikt
      </button>
    </div>
  </div>
</template>