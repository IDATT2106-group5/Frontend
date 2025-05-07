<script setup>
import { ref } from 'vue'
import { Home } from 'lucide-vue-next'
import { useHouseholdStore } from '@/stores/HouseholdStore'

const householdId = ref('')
const error = ref('')
const success = ref('')
const isLoading = ref(false)
const foundHousehold = ref(null)
const householdStore = useHouseholdStore()
const requestSent = ref(false)

const searchForHousehold = async () => {
  error.value = ''
  success.value = ''
  requestSent.value = false
  foundHousehold.value = null
  isLoading.value = true

  if (!householdId.value || householdId.value <= 0) {
    error.value = 'Husstands-ID må være et positivt tall'
    isLoading.value = false
    return
  }

  // Validate that householdId is a positite number 
  if (isNaN(Number(householdId.value)) || Number(householdId.value) <= 0) {
    error.value = 'Husstands-ID må være et positivt tall'
    isLoading.value = false
    return
  }

  try {
    const found = await householdStore.searchHouseholdById(householdId.value)
    if (found && found.id) {
      foundHousehold.value = found
      success.value = `Husstand funnet: ${found.name || 'Husstand ' + found.id}`
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

// Function to send a join request to the found household
const sendJoinRequest = async () => {
  if (!foundHousehold.value || !foundHousehold.value.id) {
    error.value = 'Du må først søke etter en gyldig husstand'
    return
  }

  isLoading.value = true
  error.value = ''
  success.value = ''

  try {
    await householdStore.sendJoinRequest(foundHousehold.value.id)
    success.value = 'Forespørsel om å bli med i husstand sendt!'
    requestSent.value = true
    foundHousehold.value = null
  } catch (err) {
    console.error('Error sending join request:', err)
    error.value = householdStore.error || 'Kunne ikke sende forespørsel om å bli med i husstand'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <Home class="w-20 h-20 text-blue-700 mb-4" />
    
    <h1 class="text-2xl font-bold mb-2">Søk om å bli med i husstand</h1>
    <p class="text-teal-800 mb-4">Skriv inn husstands-ID for å søke etter husstand:</p>
    
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
      
      <button
        @click="searchForHousehold"
        class="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition"
        :disabled="isLoading"
      >
        <span v-if="isLoading">Søker...</span>
        <span v-else>Søk</span>
      </button>

      <div v-if="error" class="p-2 bg-red-50 border border-red-200 rounded">
        <p class="text-red-600 text-sm">{{ error }}</p>
      </div>

      <!-- Display found household info -->
      <div v-if="foundHousehold && !requestSent" class="p-4 bg-white border rounded shadow-sm space-y-2">
      <h3 class="text-lg font-semibold mb-2">Husstand funnet!</h3>
      <p class="text-sm text-gray-700">Husstandsnavn: <span class="text-gray-900">{{ foundHousehold.name || 'Ukjent navn' }}</span></p>
      <p class="text-sm text-gray-700">Husstands-ID: <span class="text-gray-900">{{ foundHousehold.id }}</span></p>
        
        <button
          @click="sendJoinRequest"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Sender forespørsel...</span>
          <span v-else>Send forespørsel om å bli med</span>
        </button>
      </div>

      <div v-if="success" class="p-2 bg-green-50 border border-green-200 rounded">
        <p class="text-green-600 text-sm">{{ success }}</p>
      </div>
    </div>
  </div>
</template>