// Component tab for searching for another household to join while being a member of a household
<script setup>
import { ref } from 'vue'
import { useHouseholdStore } from '@/stores/HouseholdStore'

const store = useHouseholdStore()
const searchHousehold = ref('')

async function joinHousehold() {
  if (!searchHousehold.value) {
    alert('Vennligst oppgi husstands-ID')
    return
  }

  // Placeholder logic 
  alert(`Søker etter husstand: ${searchHousehold.value}`)
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold">Søk husstand</h2>
    <input
      v-model="searchHousehold"
      type="text"
      placeholder="Husstands-ID…"
      class="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      @click="joinHousehold"
      class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Bli med
    </button>
  </div>
</template>
