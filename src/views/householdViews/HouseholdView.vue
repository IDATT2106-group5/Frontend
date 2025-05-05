// Main view for household page 
// Check householdMainView in components to see the components used in this view
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Copy, Edit } from 'lucide-vue-next'
import { toast } from '@/components/ui/toast'

import useHousehold from '@/components/householdMainView/useHouseholdViewModel.js'
import MembersTab from '@/components/householdMainView/tabs/MembersTab.vue'
import SearchTab from '@/components/householdMainView/tabs/SearchTab.vue'
import AddMemberModal from '@/components/householdMainView/modals/AddMemberModal.vue'
import InviteMemberModal from '@/components/householdMainView/modals/InviteMemberModal.vue'
import EditHouseholdModal from '@/components/householdMainView/modals/EditHouseholdModal.vue'
import ConfirmModal from '@/components/householdMainView/modals/ConfirmModal.vue'

const router = useRouter()
const {
  isLoading,
  error,
  hasHousehold,
  householdName,
  householdAddress,
  householdId,
  isOwner,
  showAddForm,
  showInviteForm,
  showEditForm,
  openAddMemberForm,
  openInviteForm,
  openEditHouseholdForm,
  deleteHousehold,
  leaveHousehold
} = useHousehold()

const activeTab = ref('members')
const confirmLeaveOpen = ref(false)
const confirmDeleteOpen = ref(false)

const goCreate = () => router.push('/household/create')
const goJoin = () => router.push('/household/join')

async function copyHouseholdId() {
  try {
    await navigator.clipboard.writeText(householdId.value)
    alert('Husstands-ID kopiert!')
  } catch {
    alert('Kunne ikke kopiere ID')
  }
}

async function handleLeave() {
  confirmLeaveOpen.value = false
  try {
    await leaveHousehold()
    toast({
      title: 'Du har forlatt husstanden',
      description: 'Du er ikke lenger medlem av husstanden.',
      variant: 'success'
    })
  } catch (err) {
    toast({
      title: 'Feil',
      description: 'Klarte ikke å forlate husstanden.',
      variant: 'destructive'
    })
  }
}

async function handleDelete() {
  confirmDeleteOpen.value = false
  try {
    await deleteHousehold()
    toast({
      title: 'Husstand slettet',
      description: 'Husstanden ble slettet permanent.',
      variant: 'success'
    })
  } catch (err) {
    toast({
      title: 'Feil',
      description: 'Klarte ikke å slette husstanden.',
      variant: 'destructive'
    })
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-3xl mx-auto p-6 space-y-4">
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto mb-4"></div>
        <p>Laster inn…</p>
      </div>

      <div v-else-if="error && hasHousehold" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        {{ error }}
      </div>

      <div v-else-if="!hasHousehold" class="text-center py-12 bg-white rounded-lg shadow">
        <h2 class="text-xl font-bold mb-4">Ingen husstand funnet</h2>
        <p class="mb-6">Du er ikke tilknyttet en husstand ennå.</p>
        <div class="flex justify-center space-x-4">
          <button @click="goCreate" class="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">
            Opprett husstand
          </button>
          <button @click="goJoin" class="px-4 py-2 border border-gray-700 rounded shadow hover:bg-gray-100">
            Søk husstand
          </button>
        </div>
      </div>

      <div v-else>
        <div class="flex justify-between items-center">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-bold">🏠 {{ householdName }}</h1>
              <button v-if="isOwner" @click="openEditHouseholdForm" class="p-1 rounded hover:bg-gray-200">
                <Edit class="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <p class="text-sm text-gray-600">{{ householdAddress }}</p>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <span>ID: {{ householdId }}</span>
              <button @click="copyHouseholdId" class="hover:text-gray-700">
                <Copy class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div class="flex space-x-2">
            <button
              v-if="isOwner"
              @click="confirmDeleteOpen = true"
              class="px-3 py-1 border border-red-500 text-red-600 rounded hover:bg-red-50"
            >
              Slett husstand
            </button>
            <button
              @click="confirmLeaveOpen = true"
              class="px-3 py-1 border border-gray-700 text-gray-700 rounded hover:bg-gray-100"
            >
              Forlat husstand
            </button>
          </div>
        </div>

        <hr class="border-gray-300 my-4" />
        <div class="flex space-x-4 border-b border-gray-200 mb-4">
          <button @click="activeTab = 'members'" :class="activeTab === 'members' ? 'text-blue-600 border-b-2 border-blue-500 pb-2' : 'text-gray-500 pb-2 hover:text-gray-700'">
            Se medlemmer
          </button>
          <button @click="activeTab = 'search'" :class="activeTab === 'search' ? 'text-blue-600 border-b-2 border-blue-500 pb-2' : 'text-gray-500 pb-2 hover:text-gray-700'">
            Søk husstand
          </button>
        </div>

        <MembersTab v-if="activeTab === 'members'" @open-add="openAddMemberForm" @open-invite="openInviteForm" />
        <SearchTab v-else />

        <AddMemberModal v-if="showAddForm" @close="showAddForm = false" />
        <InviteMemberModal v-if="showInviteForm" @close="showInviteForm = false" />
        <EditHouseholdModal v-if="showEditForm" @close="showEditForm = false" />

        <!-- Confirmation Modals -->
        <ConfirmModal
          v-if="confirmDeleteOpen"
          title="Slett husstand"
          description="Er du sikker på at du vil slette husstanden? Dette kan ikke angres."
          @cancel="confirmDeleteOpen = false"
          @confirm="handleDelete"
        />

        <ConfirmModal
          v-if="confirmLeaveOpen"
          title="Forlat husstand"
          description="Er du sikker på at du vil forlate husstanden?"
          @cancel="confirmLeaveOpen = false"
          @confirm="handleLeave"
        />
      </div>
    </div>
  </div>
</template>