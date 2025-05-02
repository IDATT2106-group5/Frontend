<script setup>
import { ref } from 'vue'
import { Home } from 'lucide-vue-next'
import { useHouseholdStore } from '@/stores/HouseholdStore'

const householdId = ref('')
const error = ref('')
const success = ref('')
const isLoading = ref(false)
const householdStore = useHouseholdStore()

const searchForHousehold = async () => {
  error.value = ''
  success.value = ''
  isLoading.value = true

  if (!householdId.value || householdId.value <= 0) {
  error.value = 'Husstands-ID må være et positivt tall';
  isLoading.value = false;
  return;
}

  
  // Validate that the input is a number
  if (isNaN(Number(householdId.value)) || Number(householdId.value) <= 0) {
    error.value = 'Husstands-ID må være et positivt tall'
    isLoading.value = false
    return
  }

  try {
    const found = await householdStore.searchHouseholdById(householdId.value)
    if (found && found.id) {
      success.value = `Husstand funnet med ID: ${found.id}`
    } else {
      error.value = 'Ingen husstand funnet'
    }
  } catch (err) {
    console.error('Search error:', err)
    error.value = householdStore.error || 'Kunne ikke finne husstand'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <Home class="w-20 h-20 text-blue-700 mb-4" />
    
    <h1 class="text-2xl font-bold mb-2">Søk om å bli med i husstand</h1>
    <p class="text-teal-800 mb-4">Skriv inn husstands-ID og trykk send forespørsel:</p>
    
    <div class="w-full max-w-md space-y-4">
      <div>
        <label for="householdId" class="block text-sm font-medium text-gray-700 mb-1">
          Husstands ID
        </label>
        <input
          v-model="householdId"
          id="householdId"
          type="number"
          min="1"
          class="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      
      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      <p v-if="success" class="text-green-600 text-sm">{{ success }}</p>
      
      <button
        @click="searchForHousehold"
        class="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition"
        :disabled="isLoading"
      >
        <span v-if="isLoading">Søker...</span>
        <span v-else>Send forespørsel</span>
      </button>
    </div>
  </div>
</template>