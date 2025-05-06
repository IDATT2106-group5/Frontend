// component to display a list of ownership requests for the current household
<script setup>
import { ref, computed } from 'vue'
import { useHouseholdStore } from '@/stores/HouseholdStore'
import Pagination from './Pagination.vue'

const store = useHouseholdStore()
const isOwner = computed(() => store.isCurrentUserOwner)

const page = ref(1)
const perPage = 5

const totalPages = computed(() =>
  Math.max(1, Math.ceil(store.ownershipRequests.length / perPage))
)

const displayedRequests = computed(() => {
  const start = (page.value - 1) * perPage
  return store.ownershipRequests.slice(start, start + perPage)
})

const acceptRequestAndAddUser = async (request) => {
  try {
    await store.updateJoinRequestStatus(request.id, 'ACCEPTED');

    if (request.userId) {
      await store.addUserToHousehold(request.userId);
    } else {
      console.warn('Bruker-ID mangler – kunne ikke legge til bruker i husstand.');
    }
  } catch (err) {
    console.error('Feil under godkjenning/legge til bruker:', err);
  }
};
</script>

<template>
  <div class="bg-white rounded shadow p-4">
    <h3 class="text-lg font-semibold mb-2">Forespørsler</h3>

    <div v-if="displayedRequests.length" class="space-y-2">
      <div
        v-for="r in displayedRequests"
        :key="r.id"
        class="flex justify-between items-center"
      >
        <span>{{ r.email }}</span>

        <div v-if="r.status === 'PENDING' && isOwner" class="flex space-x-2">
          <button
            @click="acceptRequestAndAddUser(r)"
            class="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Godta
          </button>
          <button
            @click="store.updateJoinRequestStatus(r.id, 'REJECTED')"
            class="px-2 py-1 border rounded hover:bg-gray-100"
          >
            Avslå
          </button>
        </div>

        <span
          v-else
          :class="{
            'text-yellow-600': r.status === 'PENDING',
            'text-green-600': r.status === 'ACCEPTED',
            'text-red-600':   r.status === 'REJECTED'
          }"
        >
          {{ r.status }}
        </span>
      </div>
    </div>

    <p v-else class="italic text-gray-500">Ingen forespørsler</p>

    <Pagination
      v-if="totalPages > 1"
      :current-page="page"
      :total-pages="totalPages"
      @change-page="page = $event"
    />
  </div>
</template>
