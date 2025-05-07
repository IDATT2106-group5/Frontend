<script setup>
import { ref } from 'vue'
import { Home } from 'lucide-vue-next'
import { useHouseholdStore } from '@/stores/HouseholdStore'

const householdId = ref('')
const error = ref('')
const success = ref('')
const isLoading = ref(false)
const foundHousehold = ref(null)
const requestSent = ref(false)
const householdStore = useHouseholdStore()

// Force input to be numbers only
function restrictToNumbersOnly(e) {
  const key = e.key
  if (
    e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
    e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
    e.key === 'Home' || e.key === 'End' ||
    e.key === 'Delete' || e.key === 'Backspace' ||
    e.key === 'Tab' || e.key === 'Escape' || e.key === 'Enter' ||
    (e.ctrlKey && ['a','c','v','x'].includes(e.key))
  ) {
    return
  }
  if (!/^\d$/.test(key)) {
    e.preventDefault()
  }
}

// Clean input value to ensure it contains only numbers
function cleanInputValue(inputElement) {
  if (!inputElement) return
  inputElement.value = inputElement.value.replace(/[^\d]/g, '')
}

// Handle paste events to only allow numbers
function handlePaste(e) {
  e.preventDefault()
  const pastedData = (e.clipboardData || window.clipboardData).getData('text')
  const numbersOnly = pastedData.replace(/[^\d]/g, '')
  const input = e.target
  const { value, selectionStart, selectionEnd } = input
  const newValue = value.slice(0, selectionStart) + numbersOnly + value.slice(selectionEnd)
  input.value = newValue
  input.dispatchEvent(new Event('input'))
  setTimeout(() => {
    input.selectionStart = input.selectionEnd = selectionStart + numbersOnly.length
  }, 0)
}

// On blur, clean any stray non-numeric
function onInputBlur(e) {
  cleanInputValue(e.target)
  e.target.dispatchEvent(new Event('input'))
}

const searchForHousehold = async () => {
  error.value = ''
  success.value = ''
  requestSent.value = false
  foundHousehold.value = null
  isLoading.value = true

  if (!householdId.value || Number(householdId.value) <= 0) {
    error.value = 'Husstands-ID må være et positivt tall'
    isLoading.value = false
    return
  }

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
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          @keydown="restrictToNumbersOnly"
          @paste="handlePaste"
          @blur="onInputBlur"
          class="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <button
        @click="searchForHousehold"
        class="w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-800 transition"
        :disabled="isLoading"
      >
        <span v-if="isLoading">Søker...</span>
        <span v-else>Søk</span>
      </button>

      <div v-if="error" class="p-2 bg-red-50 border border-red-200 rounded">
        <p class="text-red-600 text-sm">{{ error }}</p>
      </div>

      <div v-if="foundHousehold && !requestSent" class="p-4 bg-white border rounded shadow-sm space-y-2">
        <h3 class="text-lg font-semibold mb-2">Husstand funnet!</h3>
        <p class="text-sm text-gray-700">
          Husstandsnavn:
          <span class="text-gray-900">{{ foundHousehold.name || 'Ukjent navn' }}</span>
        </p>
        <p class="text-sm text-gray-700">
          Husstands-ID:
          <span class="text-gray-900">{{ foundHousehold.id }}</span>
        </p>

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
