<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { useHouseholdStore } from '@/stores/HouseholdStore'

const householdStore = useHouseholdStore()
const router = useRouter()

const isLoading = ref(true)

onMounted(async () => {
  isLoading.value = true
  await householdStore.checkCurrentHousehold()
  isLoading.value = false
})

const goToMembers = () => {
  router.push('/household/members')
}

const leaveHousehold = async () => {
  await householdStore.leaveHousehold()
  await householdStore.checkCurrentHousehold()
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center p-6 bg-gradient-to-b from-white to-gray-100">

    <div v-if="isLoading" class="w-full max-w-md text-center py-8">
      <p>Laster...</p>
    </div>

    <div v-else>

      <div v-if="!householdStore.hasHousehold" class="text-center space-y-6">
        <h1 class="text-2xl font-bold text-black mb-2">
          Du er ikke medlem i en eksisterende husstand
        </h1>
        <p class="text-blue-700">
          Velg om du vil starte en ny husstand eller bli med i en eksisterende
        </p>

        <div class="flex justify-center gap-6 mt-8">
          <div class="flex flex-col items-center space-y-2">
            <h2 class="text-xl font-bold">Opprett ny husstand</h2>
            <Button class="bg-blue-900 text-white hover:bg-blue-700">
              + Opprett husstand
            </Button>
          </div>

          <div class="flex flex-col items-center space-y-2">
            <h2 class="text-xl font-bold">Bli med i husstand</h2>
            <Button class="bg-blue-900 text-white hover:bg-blue-700">
              👤 Bli med i husstand
            </Button>
          </div>
        </div>
      </div>

      <div v-else class="text-center space-y-6">
        <h1 class="text-2xl font-bold text-black">
          {{ householdStore.currentHousehold.name }}
        </h1>

        <div class="space-y-4">
          <div class="flex items-center justify-center gap-2">
            <input
              type="text"
              :value="`id: ${householdStore.currentHousehold.id}`"
              disabled
              class="border border-gray-400 rounded-md px-3 py-2 text-center"
            />
            <Button class="bg-blue-900 text-white hover:bg-blue-700">
              Bli med
            </Button>
          </div>

          <div>
            <Button
              variant="outline"
              class="w-full text-blue-900 border-blue-900 hover:bg-blue-100"
              @click="goToMembers"
            >
              👥 Se medlemmer
            </Button>
          </div>

          <div>
            <Button
              class="w-full bg-blue-900 text-white hover:bg-blue-700"
              @click="leaveHousehold"
            >
              👤 Forlat husstand
            </Button>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>
