<script setup>
import { ref } from 'vue'
import { Home } from 'lucide-vue-next'
import { useHouseholdStore } from '@/stores/HouseholdStore'
import AlreadyInHousehold from '@/components/householdMainView/AlreadyInHousehold.vue'

const joinHouseholdId = ref('')
const joinError      = ref('')
const joinSuccess    = ref('')
const joinIsLoading  = ref(false)
const foundHousehold = ref(null)
const requestSent    = ref(false)

const householdStore = useHouseholdStore()

// On every keystroke: uppercase, strip non-alphanumeric, cap at 8 chars, clear messages
function onInput(e) {
  joinHouseholdId.value = e.target.value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8)
  joinError.value = ''
  joinSuccess.value = ''
  foundHousehold.value = null
  requestSent.value = false
}

// Paste handling: same cleaning
function onPaste(e) {
  e.preventDefault()
  const pasted = (e.clipboardData || window.clipboardData).getData('text')
  const cleaned = pasted.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const input = e.target
  const { value, selectionStart, selectionEnd } = input
  const newValue = (value.slice(0, selectionStart) + cleaned + value.slice(selectionEnd))
    .slice(0, 8)
  input.value = newValue
  input.dispatchEvent(new Event('input'))
}

// On blur: re-clean just in case
function onBlur(e) {
  e.target.value = e.target.value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8)
  e.target.dispatchEvent(new Event('input'))
}

async function searchForHousehold() {
  // reset
  joinError.value = ''
  joinSuccess.value = ''
  foundHousehold.value = null
  requestSent.value = false

  if (joinHouseholdId.value.length !== 8) {
    joinError.value = 'Husstands-ID må være 8 tegn'
    return
  }

  joinIsLoading.value = true
  try {
    const found = await householdStore.searchHouseholdById(joinHouseholdId.value)
    if (found && found.id) {
      foundHousehold.value = found
      joinSuccess.value = `Husstand funnet: ${found.name || 'Husstand ' + found.id}`
    } else {
      joinError.value = 'Ingen husstand funnet'
    }
  } catch (err) {
    console.error(err)
    joinError.value = householdStore.error || 'Kunne ikke finne husstand'
  } finally {
    joinIsLoading.value = false
  }
}

async function sendJoinRequest() {
  if (!foundHousehold.value) {
    joinError.value = 'Du må først søke etter en gyldig husstand'
    return
  }

  joinIsLoading.value = true
  joinError.value = ''
  joinSuccess.value = ''
  try {
    await householdStore.sendJoinRequest(foundHousehold.value.id)
    joinSuccess.value = 'Forespørsel om å bli med i husstand sendt!'
    requestSent.value = true
    foundHousehold.value = null
  } catch (err) {
    console.error(err)
    joinError.value = householdStore.error || 'Kunne ikke sende forespørsel'
  } finally {
    joinIsLoading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
    <!-- If already in a household, show that component -->
    <AlreadyInHousehold v-if="householdStore.hasHousehold" />

    <!-- Otherwise, show the join form -->
    <div v-else class="w-full max-w-md space-y-4 text-center">
      <Home class="w-20 h-20 text-blue-700 mb-4 mx-auto" />

      <h1 class="text-2xl font-bold mb-2">Søk om å bli med i husstand</h1>
      <p class="text-teal-800 mb-4">Skriv inn 8-tegns husstands-ID:</p>

      <!-- Input + inline error -->
      <div>
        <label for="joinHouseholdId" class="block text-sm font-medium text-gray-700 mb-1">
          Husstands ID
        </label>
        <input
          id="joinHouseholdId"
          v-model="joinHouseholdId"
          @input="onInput"
          @paste="onPaste"
          @blur="onBlur"
          type="text"
          inputmode="text"
          maxlength="8"
          placeholder="ABCD1234"
          class="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <p v-if="joinError" class="mt-1 text-red-600 text-sm">
          {{ joinError }}
        </p>
      </div>

      <!-- Search button -->
      <button
        @click="searchForHousehold"
        :disabled="joinIsLoading"
        class="w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-800 transition"
      >
        <span v-if="joinIsLoading">Søker...</span>
        <span v-else>Søk</span>
      </button>

      <!-- Found household + send request -->
      <div v-if="foundHousehold" class="p-4 bg-white border rounded shadow-sm space-y-2">
        <h3 class="text-lg font-semibold mb-2">Husstand funnet!</h3>
        <p class="text-sm text-gray-700">
          <strong>Navn:</strong>
          <span class="text-gray-900">{{ foundHousehold.name || 'Ukjent navn' }}</span>
        </p>
        <p class="text-sm text-gray-700">
          <strong>ID:</strong>
          <span class="text-gray-900">{{ foundHousehold.id }}</span>
        </p>
        <button
          @click="sendJoinRequest"
          :disabled="joinIsLoading"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          <span v-if="joinIsLoading">Sender forespørsel...</span>
          <span v-else>Send forespørsel om å bli med</span>
        </button>
      </div>

      <!-- Success message -->
      <div v-if="joinSuccess" class="p-2 bg-green-50 border border-green-200 rounded">
        <p class="text-green-600 text-sm">{{ joinSuccess }}</p>
      </div>
    </div>
  </div>
</template>
