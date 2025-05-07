<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useScenarioStore } from '@/stores/ScenarioStore'

const route = useRoute()
const scenarioStore = useScenarioStore()

// Get scenario ID from route
const scenarioId = route.params.id

// Fetch scenario from store when component mounts
onMounted(async () => {
  await scenarioStore.fetchScenarioById(scenarioId)
})

// Get the scenario from the store by ID
const scenario = computed(() => scenarioStore.getScenarioById(scenarioId))
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-4">Scenario: {{ scenario?.name }}</h1>
    <p class="text-gray-700 mb-4">{{ scenario?.description || 'Ingen beskrivelse tilgjengelig.' }}</p>

    <!-- Add more details as needed -->
    <div class="text-sm text-gray-500">Scenario ID: {{ scenarioId }}</div>
  </div>
</template>
