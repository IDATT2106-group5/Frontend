// Component to display a list of sent invitations 
<script setup>
import { ref, computed } from 'vue'
import { useHouseholdStore } from '@/stores/HouseholdStore'
import Pagination from '../widgets/Pagination.vue'

const store = useHouseholdStore()
const page = ref(1)
const per = 5

const pendingInvitations = computed(() =>
  store.sentInvitations.filter(inv => inv.status === 'PENDING')
)

const total = computed(() =>
  Math.max(1, Math.ceil(pendingInvitations.value.length / per))
)

const displayed = computed(() => {
  const start = (page.value - 1) * per
  return pendingInvitations.value.slice(start, start + per)
})
</script>


<template>
  <div class="bg-white rounded shadow p-4">
    <h3 class="text-lg font-semibold mb-2">Sendte invitasjoner</h3>

    <table class="w-full text-left text-sm">
      <thead class="border-b">
        <tr>
          <th class="py-2">E-post</th>
          <th class="py-2">Dato</th>
          <th class="py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="inv in displayed"
          :key="inv.email"
          class="border-b"
        >
          <td class="py-1">{{ inv.email }}</td>
          <td class="py-1">{{ inv.date }}</td>
          <td class="py-1">
            <span
              :class="{
                'text-yellow-600': inv.status === 'PENDING',
                'text-green-600': inv.status === 'ACCEPTED',
                'text-red-600':   inv.status === 'DECLINED'
              }"
              class="font-medium"
            >
              {{ inv.status }}
            </span>
          </td>
        </tr>
        <tr v-if="!displayed.length">
          <td colspan="3" class="py-4 text-center text-gray-500 italic">
            Ingen invitasjoner
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Reusable pagination -->
    <Pagination
      :current-page="page"
      :total-pages="total"
      @change-page="page = $event"
      class="mt-4"
    />
  </div>
</template>
