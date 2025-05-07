<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useScenarioStore } from '@/stores/ScenarioStore'
// Import Lucide icons
import {
  AlertTriangle, AlertOctagon, Droplets, Flame, Wind,
  Thermometer, Zap, ShieldAlert
} from 'lucide-vue-next'

export default {
  name: 'ScenarioList',

  setup() {
    const router = useRouter()
    const scenarioStore = useScenarioStore()

    const loading = computed(() => scenarioStore.isLoading)
    const error = computed(() => scenarioStore.getError)
    const scenarios = computed(() => scenarioStore.getAllScenarios)

    // Map icon names to components
    const iconMap = {
      AlertTriangle,
      AlertOctagon,
      Droplets,
      Flame,
      Wind,
      Thermometer,
      Zap,
      ShieldAlert
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
      editScenario
    }
  }
}
</script>

<template>
  <div class="scenario-list">
    <div class="header">
      <h1>Scenarioer</h1>
      <button @click="addNewScenario" class="add-button">+ Legg til nytt scenario</button>
    </div>

    <div v-if="loading" class="loading">
      <p>Laster...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>Det oppstod en feil: {{ error }}</p>
      <button @click="fetchScenarios" class="primary-button">Prøv på nytt</button>
    </div>

    <div v-else-if="scenarios.length === 0" class="empty-state">
      <p>Ingen scenarioer funnet</p>
      <button @click="addNewScenario" class="primary-button">Legg til nytt scenario</button>
    </div>

    <div v-else class="scenario-grid">
      <div v-for="scenario in scenarios" :key="scenario.id" class="scenario-card">
        <div class="scenario-content">
          <component :is="getIconComponent(scenario.icon)" size="32" class="scenario-icon" />
          <h2>{{ scenario.name }}</h2>
        </div>
        <div class="scenario-actions">
          <button @click="editScenario(scenario.id)" class="edit-button">Rediger</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scenario-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.add-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.loading, .error, .empty-state {
  text-align: center;
  padding: 40px 0;
}

.error {
  color: #d32f2f;
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.scenario-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid #e0e0e0;
  height: 150px;
}

.scenario-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  gap: 10px;
}

.scenario-icon {
  color: #2196f3;
}

.scenario-content h2 {
  font-size: 18px;
  text-align: center;
  margin: 0;
}

.scenario-actions {
  padding: 10px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #e0e0e0;
}

.edit-button {
  background-color: #f0f0f0;
  color: #333;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.edit-button:hover {
  background-color: #e0e0e0;
}

.primary-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.primary-button:hover {
  background-color: #45a049;
}
</style>