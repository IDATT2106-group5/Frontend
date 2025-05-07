<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Copy, Edit, User } from 'lucide-vue-next'
import { toast } from '@/components/ui/toast'

import { useHouseholdStore } from '@/stores/HouseholdStore'
import useHousehold from '@/components/householdMainView/useHouseholdViewModel.js'
import MembersTab from '@/components/householdMainView/tabs/MembersTab.vue'
import SearchTab from '@/components/householdMainView/tabs/SearchTab.vue'
import AddMemberModal from '@/components/householdMainView/modals/AddMemberModal.vue'
import InviteMemberModal from '@/components/householdMainView/modals/InviteMemberModal.vue'
import EditHouseholdModal from '@/components/householdMainView/modals/EditHouseholdModal.vue'
import ConfirmModal from '@/components/householdMainView/modals/ConfirmModal.vue'

const router = useRouter()
const houseStore = useHouseholdStore()
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

// Fetch invitations if not in a household
onMounted(async () => {
  if (!hasHousehold.value) {
    try {
      await houseStore.fetchReceivedInvitations()
    } catch (err) {
      console.error('Failed to fetch invitations:', err)
    }
  }
})

function copyHouseholdId() {
  navigator.clipboard.writeText(householdId.value)
    .then(() => alert('Husstands-ID kopiert!'))
    .catch(() => alert('Kunne ikke kopiere ID'))
}

async function handleLeave() {
  confirmLeaveOpen.value = false
  try {
    await leaveHousehold()
    toast({ title: 'Du har forlatt husstanden', description: 'Du er ikke lenger medlem av husstanden.', variant: 'success' })
  } catch {
    toast({ title: 'Feil', description: 'Klarte ikke å forlate husstanden.', variant: 'destructive' })
  }
}

async function handleDelete() {
  confirmDeleteOpen.value = false
  try {
    await deleteHousehold()
    toast({ title: 'Husstand slettet', description: 'Husstanden ble slettet permanent.', variant: 'success' })
  } catch {
    toast({ title: 'Feil', description: 'Klarte ikke å slette husstanden.', variant: 'destructive' })
  }
}

const goCreate = () => router.push('/household/create')
const goJoin = () => router.push('/household/join')

// Accept/decline invitation handlers
const acceptInvitation = async (invId) => {
  if (isOwner.value) {
    return toast({ title: 'Ikke tillatt', description: 'Husstandseiere kan ikke akseptere invitasjoner.', variant: 'destructive' })
  }
  try {
    await houseStore.acceptInvitation(invId)
    await houseStore.loadHouseholdData()
    toast({ title: 'Invitasjon akseptert', description: 'Du har blitt med i husstanden.', variant: 'success' })
  } catch {
    toast({ title: 'Feil', description: 'Kunne ikke akseptere invitasjonen.', variant: 'destructive' })
  }
}

const declineInvitation = async (invId) => {
  try {
    await houseStore.declineInvitation(invId)
    toast({ title: 'Invitasjon avslått', description: 'Du har avslått invitasjonen.', variant: 'default' })
  } catch {
    toast({ title: 'Feil', description: 'Kunne ikke avslå invitasjonen.', variant: 'destructive' })
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-3xl mx-auto p-6 space-y-4">
      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto mb-4"></div>
        <p>Laster inn…</p>
      </div>

      <!-- Error when already in household -->
      <div v-else-if="error && hasHousehold" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        {{ error }}
      </div>

      <!-- No household: create/join + invitations -->
      <div v-else-if="!hasHousehold" class="text-center py-16 bg-base">
        <h2 class="text-3xl font-bold text-black mb-4">
          Du er ikke medlem i en<br />
          eksisterende husstand
        </h2>
        <p class="text-primary mb-8 font-medium">
          Velg om du vil opprette en ny husstand<br />
          eller bli med i en eksisterende
        </p>

        <div class="flex justify-center gap-12">
          <div>
            <h3 class="font-semibold text-lg mb-2">Opprett ny husstand</h3>
            <button @click="goCreate" class="flex items-center gap-2 px-5 py-2 rounded-md bg-primary text-white font-medium shadow hover:opacity-90">
              <span class="text-xl">+</span> Opprett husstand
            </button>
          </div>
          <div>
            <h3 class="font-semibold text-lg mb-2">Bli med i husstand</h3>
            <button @click="goJoin" class="flex items-center gap-2 px-5 py-2 rounded-md bg-primary text-white font-medium shadow hover:opacity-90">
              <User class="w-5 h-5" /> Bli med i husstand
            </button>
          </div>
        </div>

        <!-- Invitations -->
        <div class="max-w-md mx-auto mt-10">
          <h3 class="text-xl font-semibold text-center mb-4">Invitasjoner mottatt</h3>
          <div v-if="houseStore.receivedInvitations.length === 0" class="text-center text-gray-500 italic">
            Ingen invitasjoner mottatt
          </div>
          <div v-for="inv in houseStore.receivedInvitations" :key="inv.id" class="bg-white rounded-md p-4 border border-gray-200 mb-4">
            <div class="text-sm space-y-1 mb-2">
              <p><strong>Husstands-ID:</strong> {{ inv.householdId }}</p>
              <p><strong>Navn:</strong> {{ inv.householdName }}</p>
            </div>
            <div class="flex gap-2 justify-end">
              <button @click="acceptInvitation(inv.id)" class="px-4 py-1 rounded bg-primary text-white hover:opacity-90">Aksepter</button>
              <button @click="declineInvitation(inv.id)" class="px-4 py-1 rounded border border-gray-400 hover:bg-gray-100">Avslå</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Household main content -->
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
            <button v-if="isOwner" @click="confirmDeleteOpen = true" class="px-3 py-1 border border-red-500 text-red-600 rounded hover:bg-red-50">
              Slett husstand
            </button>
            <button @click="confirmLeaveOpen = true" class="px-3 py-1 border border-gray-700 text-gray-700 rounded hover:bg-gray-100">
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