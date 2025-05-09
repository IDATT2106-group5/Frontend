<script setup>
import { ref, onMounted } from 'vue'
import { Home } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useHouseholdStore } from '@/stores/HouseholdStore'
import { useUserStore } from '@/stores/UserStore'
import AlreadyInHousehold from '@/components/householdMainView/AlreadyInHousehold.vue'

const router = useRouter()
const householdStore = useHouseholdStore()
const userStore = useUserStore()

const householdName = ref('')
const address = ref('')
const errorMessage = ref('')
const isLoading = ref(true)

const MAX_NAME_LENGTH = 20
const MAX_ADDRESS_LENGTH = 50

onMounted(async () => {
  try {
    await householdStore.checkCurrentHousehold()
  } catch {
    errorMessage.value = 'Kunne ikke hente husstandsinformasjon.'
  } finally {
    isLoading.value = false
  }
})

const createHousehold = async () => {
  if (!householdName.value.trim()) {
    errorMessage.value = 'Husstandsnavn kan ikke være tomt.'
    return
  }
  
  if (householdName.value.length > MAX_NAME_LENGTH) {
    errorMessage.value = `Navn kan ikke være lenger enn ${MAX_NAME_LENGTH} tegn.`
    return
  }

  if (address.value.length > MAX_ADDRESS_LENGTH) {
    errorMessage.value = `Adresse kan ikke være lenger enn ${MAX_ADDRESS_LENGTH} tegn.`
    return
  }
  
  errorMessage.value = ''
  try {
    await householdStore.createHousehold({
      name: householdName.value,
      address: address.value,
      ownerId: userStore.user.id,
    })
    router.push('/household')
  } catch {
    errorMessage.value = householdStore.error || 'Noe gikk galt under opprettelsen.'
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
    <!-- Loading state -->
    <div v-if="isLoading" class="text-center">
      <p class="text-gray-600">Laster inn...</p>
    </div>

    <!-- Already in household -->
    <AlreadyInHousehold v-else-if="householdStore.hasHousehold" />

    <!-- Create household form -->
    <div v-else class="w-full max-w-md">
      <Home class="w-20 h-20 text-blue-700 mb-4 mx-auto" />

      <h1 class="text-2xl font-bold mb-2 text-center">Opprett ny husstand</h1>
      <p class="text-teal-800 mb-4 text-center">
        Fyll inn informasjonen om din husstand:
      </p>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Navn på husstand
          </label>
          <input
            v-model="householdName"
            type="text"
            maxlength="20"
            class="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="F.eks. 'Familien Hansen'"
          />
          <div class="text-xs text-gray-500 mt-1 flex justify-between">
            <span>Maks {{ MAX_NAME_LENGTH }} tegn</span>
            <span>{{ householdName.length }}/{{ MAX_NAME_LENGTH }}</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Adresse
          </label>
          <input
            v-model="address"
            type="text"
            maxlength="50"
            class="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="F.eks. 'Storgata 1, 0000 Oslo'"
          />
          <div class="text-xs text-gray-500 mt-1 flex justify-between">
            <span>Maks {{ MAX_ADDRESS_LENGTH }} tegn</span>
            <span>{{ address.length }}/{{ MAX_ADDRESS_LENGTH }}</span>
          </div>
        </div>

        <p v-if="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</p>

        <button
          @click="createHousehold"
          class="w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Opprett husstand
        </button>
      </div>
    </div>
  </div>
</template>
