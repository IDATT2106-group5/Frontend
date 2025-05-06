<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAdminStore } from '@/stores/AdminStore'

const adminStore = useAdminStore()

onMounted(() => {
  adminStore.fetchIncidents()
  adminStore.fetchAdmins()
})

const crisisCount = computed(() => adminStore.incidents.length)
const adminCount = computed(() => adminStore.admins.length)

const crisisTypes = ref([
  { name: 'Flom', count: 1, color: 'bg-blue-500' },
  { name: 'Strømbrudd', count: 1, color: 'bg-orange-400' },
  { name: 'Vannforsyning', count: 1, color: 'bg-blue-200' }
])

const adminButtons = [
  { label: 'LEGG TIL NY KRISE', isPrimary: true },
  { label: 'Aktive kriser' },
  { label: 'Kart markører' },
  { label: 'Nyhetshåndtering' },
  { label: 'Scenarier' },
  { label: 'Gamification' },
  { label: 'Admin brukere' }
]
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-6 font-sans">
    <h1 class="text-3xl font-bold text-blue-900 mb-8">Admin dashbord</h1>

    <!-- Button Grid -->
    <div class="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
      <button
        v-for="btn in adminButtons"
        :key="btn.label"
        :class="[
          'w-full h-16 px-4 text-left font-bold border rounded flex justify-between items-center bg-white shadow-sm',
          btn.isPrimary ? 'text-red-600 col-span-2 border-2 border-red-600' : 'text-gray-800'
        ]"
      >
        {{ btn.label }}
        <span class="text-xl font-bold">&gt;</span>
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 max-w-4xl mx-auto mt-10">
      <div class="bg-white border rounded p-4 text-center shadow-sm">
        <div class="text-gray-600 text-sm">Aktive kriser</div>
        <div class="text-2xl font-bold">{{ crisisCount }}</div>
      </div>

      <div class="bg-white border rounded p-4 text-center shadow-sm">
        <div class="text-gray-600 text-sm">Admin brukere</div>
        <div class="text-2xl font-bold">{{ adminCount }}</div>
      </div>

      <div class="bg-white border rounded p-4 shadow-sm">
        <div class="text-gray-600 text-sm mb-2 font-semibold">Krisetyper</div>
        <div
          v-for="type in crisisTypes"
          :key="type.name"
          class="text-sm mb-1 flex justify-between items-center"
        >
          <span>{{ type.name }}</span>
          <div class="flex items-center gap-2">
            <div :class="[type.color, 'h-2 w-16 rounded']"></div>
            <span class="font-semibold">{{ type.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
