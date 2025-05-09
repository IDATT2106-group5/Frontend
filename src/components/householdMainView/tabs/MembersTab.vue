<script setup>
import { ref, watch, computed } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import { useHouseholdStore } from '@/stores/HouseholdStore'
import HouseholdMember from '@/components/householdMainView/HouseholdMember.vue'
import Pagination from '../widgets/Pagination.vue'
import OwnerShipManager from '../widgets/OwnerShipManager.vue'
import RequestList from '../widgets/RequestList.vue'
import InvitationsList from '../widgets/InvitationsList.vue'

/**
 * Emits events to parent component
 * @type {function[]}
 * @property {function} open-add - Emitted when "Add Member" action is requested
 * @property {function} open-invite - Emitted when "Invite Member" action is requested
 */
const emit = defineEmits(['open-add', 'open-invite'])

/**
 * Household store instance
 * @type {import('@/stores/HouseholdStore').HouseholdStore}
 */
const store = useHouseholdStore()

/**
 * User store instance
 * @type {import('@/stores/UserStore').UserStore}
 */
const userStore = useUserStore()

/**
 * Computed property that determines if current user is the household owner
 * @type {import('vue').ComputedRef<boolean>}
 */
const isOwner = computed(() => store.isCurrentUserOwner)

/**
 * Search query for filtering members
 * @type {import('vue').Ref<string>}
 */
const searchQuery = ref('')

/**
 * Current page for pagination
 * @type {import('vue').Ref<number>}
 */
const page = ref(1)

/**
 * Number of members to display per page
 * @type {number}
 * @constant
 */
const perPage = 5

/**
 * All members in the household
 * @type {import('vue').ComputedRef<Array<Object>>}
 * @property {string} id - Member ID
 * @property {string} fullName - Member's full name
 * @property {boolean} isRegistered - Whether the member is registered in the system
 */
const allMembers = computed(() => store.allMembers)

/**
 * Filtered and sorted list of members based on search query
 *
 * Sorting priority:
 * 1. Owner
 * 2. Current user
 * 3. Registered users
 * 4. Unregistered users
 *
 * @type {import('vue').ComputedRef<Array<Object>>}
 */
const filteredMembers = computed(() => {
  const query = searchQuery.value.toLowerCase()

  const members = allMembers.value.filter(m =>
    m.fullName.toLowerCase().includes(query)
  )

  const ownerId = store.currentHousehold?.ownerId
  const currentUserId = userStore.user?.id

  /**
   * Ranking function for member sorting
   * @param {Object} member - The member to rank
   * @returns {number} Lower numbers are displayed first
   */
  const rank = (member) => {
    if (member.id === ownerId) return 0
    if (member.id === currentUserId) return 1
    if (member.isRegistered) return 2
    return 3
  }

  return members.sort((a, b) => rank(a) - rank(b))
})

/**
 * Members to display on the current page
 * @type {import('vue').ComputedRef<Array<Object>>}
 */
const displayedMembers = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredMembers.value.slice(start, start + perPage)
})

/**
 * Total number of pages for pagination
 * @type {import('vue').ComputedRef<number>}
 */
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredMembers.value.length / perPage))
)

/**
 * Reset to first page when search query changes
 */
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
