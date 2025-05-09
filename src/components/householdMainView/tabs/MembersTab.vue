<script setup>
import { ref, watch, computed } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import { useHouseholdStore } from '@/stores/HouseholdStore'
import HouseholdMember from '@/components/householdMainView/HouseholdMember.vue'
import Pagination from '../widgets/Pagination.vue'
import OwnerShipManager from '../widgets/OwnerShipManager.vue'
import RequestList from '../widgets/RequestList.vue'
import InvitationsList from '../widgets/InvitationsList.vue'

const emit = defineEmits(['open-add', 'open-invite'])

const store = useHouseholdStore()
const userStore = useUserStore()
const isOwner = computed(() => store.isCurrentUserOwner)

const searchQuery = ref('')
const page = ref(1)
const perPage = 5

const allMembers = computed(() => store.allMembers)

const filteredMembers = computed(() => {
  const query = searchQuery.value.toLowerCase()

  const members = allMembers.value.filter(m =>
    m.fullName.toLowerCase().includes(query)
  )

  const ownerId = store.currentHousehold?.ownerId
  const currentUserId = userStore.user?.id

  const rank = (member) => {
    if (member.id === ownerId) return 0
    if (member.id === currentUserId) return 1
    if (member.isRegistered) return 2
    return 3
  }

  return members.sort((a, b) => rank(a) - rank(b))
})

const displayedMembers = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredMembers.value.slice(start, start + perPage)
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredMembers.value.length / perPage))
)

watch(searchQuery, () => {
  page.value = 1
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold">Medlemmer ({{ allMembers.length }})</h2>
      <div v-if="isOwner" class="flex space-x-2">
        <button
          @click="$emit('open-invite')"
          class="px-3 py-1 bg-primary text-white rounded hover:bg-[hsl(var(--primary-hover))]"
        >
          + Send invitasjon
        </button>
        <button
          @click="$emit('open-add')"
          class="px-3 py-1 text-white rounded bg-[#27AE60] hover:bg-[#219653]"
        >
          + Legg til medlem
        </button>
      </div>
    </div>

    <!-- Search -->
    <input
      v-model="searchQuery"
      data-cy="search-member-input"
      type="text"
      placeholder="Søk etter medlemmer…"
      class="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <!-- Member list -->
    <div v-if="displayedMembers.length" class="bg-white rounded shadow divide-y">
      <HouseholdMember
        v-for="m in displayedMembers"
        :key="m.id"
        :member="m"
        :is-owner="m.id === store.currentHousehold?.ownerId"
        @remove-member="store.removeMember(m.id, m.isRegistered)"
      />
    </div>
    <div v-else class="text-center py-8 text-gray-500">Ingen medlemmer funnet</div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center">
      <Pagination
        :current-page="page"
        :total-pages="totalPages"
        @change-page="page = $event"
      />
    </div>

    <!-- Ownership manager / requests / invitations -->
    <div v-if="isOwner" class="mt-6">
      <OwnerShipManager />
    </div>
    <div class="mt-6">
      <RequestList />
    </div>
    <div class="mt-6">
      <InvitationsList />
    </div>
  </div>
</template>
