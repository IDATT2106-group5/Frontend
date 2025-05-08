<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Copy, Edit, Home } from 'lucide-vue-next'
import { toast } from '@/components/ui/toast'

import { useHouseholdStore } from '@/stores/HouseholdStore'
import useHousehold from '@/components/householdMainView/useHouseholdViewModel.js'
import MembersTab from '@/components/householdMainView/tabs/MembersTab.vue'
import AddMemberModal from '@/components/householdMainView/modals/AddMemberModal.vue'
import InviteMemberModal from '@/components/householdMainView/modals/InviteMemberModal.vue'
import EditHouseholdModal from '@/components/householdMainView/modals/EditHouseholdModal.vue'
import ConfirmModal from '@/components/householdMainView/modals/ConfirmModal.vue'
import NoHouseholdView from '@/components/householdMainView/NoHouseholdView.vue'

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
const ownerLeaveErrorOpen = ref(false)

// Join household functionality
const joinHouseholdId = ref('')
const joinError = ref('')
const joinSuccess = ref('')
const joinIsLoading = ref(false)
const foundHousehold = ref(null)
const requestSent = ref(false)

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
    .then(() => {
      toast({
        title: 'Husstands-ID kopiert',
        description: 'Husstands-ID er nå i utklippstavlen.',
        variant: 'success'
      })
    })
    .catch(() => {
      toast({
        title: 'Kunne ikke kopiere',
        description: 'Det skjedde en feil ved kopiering av husstands-ID.',
        variant: 'destructive'
      })
    })
}

function handleLeaveButtonClick() {
  if (isOwner.value) {
    ownerLeaveErrorOpen.value = true
  } else {
    confirmLeaveOpen.value = true
  }
}

function onJoinHouseholdIdInput(e) {
  const cleaned = e.target.value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')

  joinHouseholdId.value = cleaned
  joinError.value = ''
}

const acceptInvitation = async (invId) => {
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

// Join household functionality
async function searchForHousehold() {
  joinError.value      = ''
  joinSuccess.value    = ''
  foundHousehold.value = null
  requestSent.value    = false
  joinIsLoading.value  = true

  if (!joinHouseholdId.value) {
    joinError.value = 'Husstands-ID kan ikke være tomt'
    joinIsLoading.value = false
    return
  }
  if (joinHouseholdId.value === householdId.value) {
    joinError.value = 'Dette er din nåværende husstand'
    joinIsLoading.value = false
    return
  }

  try {
    const found = await houseStore.searchHouseholdById(joinHouseholdId.value)

    if (found && found.id) {
      foundHousehold.value = {
        id:   found.id,
        name: found.name || 'Ukjent navn'
      }
      joinSuccess.value = `Husstand funnet: ${found.name || found.id}`
    } else {
      joinError.value = 'Ingen husstand funnet'
    }

  } catch (err) {
    if (
      err.message === 'Ingen husstand funnet' ||
      err.message === 'Ugyldig husstands-ID' ||
      err.response?.status === 400 ||
      err.response?.status === 404
    ) {
      joinError.value = 'Ingen husstand funnet'
    } else {
      console.error('Search error:', err)
      joinError.value = 'Ingen hustand funnet'
    }
  } finally {
    joinIsLoading.value = false
  }
}


const sendJoinRequest = async () => {
  if (!foundHousehold.value || !foundHousehold.value.id) {
    joinError.value = 'Du må først søke etter en gyldig husstand'
    return
  }

  joinIsLoading.value = true
  joinError.value = ''
  joinSuccess.value = ''

  if (isOwner.value) {
    joinIsLoading.value = false
    joinError.value = 'Du er eier av en husstand. Du må forlate din nåværende husstand før du kan bli med i en annen.'
    return
  }

  try {
    await houseStore.sendJoinRequest(foundHousehold.value.id)
    joinSuccess.value = 'Forespørsel om å bli med i husstand sendt!'
    requestSent.value = true
    foundHousehold.value = null
  } catch (err) {
    console.error('Error sending join request:', err)
    joinError.value = err.message || houseStore.error || 'Kunne ikke sende forespørsel om å bli med i husstand'
  } finally {
    joinIsLoading.value = false
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
      <div v-else-if="error && hasHousehold && activeTab==='members'" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        {{ error }}
      </div>

      <!-- No household view component -->
      <NoHouseholdView v-else-if="!hasHousehold" />

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
            <button @click="handleLeaveButtonClick" class="px-3 py-1 border border-gray-700 text-gray-700 rounded hover:bg-gray-100">
              Forlat husstand
            </button>
          </div>
        </div>

        <hr class="border-gray-300 my-4" />
        <div class="flex space-x-4 border-b border-gray-200 mb-4">
          <button
            @click="activeTab = 'members'"
            :class="activeTab === 'members' ? 'text-blue-600 border-b-2 border-blue-500 pb-2' : 'text-gray-500 pb-2 hover:text-gray-700'"
          >
            Se medlemmer
          </button>
          <button
            @click="activeTab = 'search'"
            :class="activeTab === 'search' ? 'text-blue-600 border-b-2 border-blue-500 pb-2' : 'text-gray-500 pb-2 hover:text-gray-700'"
          >
            Søk husstand
          </button>
        </div>

        <!-- Tab content -->
        <div class="mt-6">
          <MembersTab
            v-if="activeTab === 'members'"
            @open-add="openAddMemberForm"
            @open-invite="openInviteForm"
          />

          <!-- SEARCH TAB (only when in a household) -->
          <div v-else-if="activeTab === 'search'" class="p-6 rounded-lgspace-y-6">
            <div class="text-center">
              <h2 class="text-xl font-bold mb-2">Søk om å bli med i et annet husstand</h2>
              <p class="text-teal-800 mb-4">Skriv inn husstands‑ID for å søke etter husstand:</p>
              <!-- Warning for household owners -->
              <p v-if="isOwner" class="text-orange-600 mb-4 font-medium">
                Obs! Som hustandseier må du først forlate din nåværende husstand før du kan bli med i en annen.
              </p>
            </div>
            <div class="max-w-md mx-auto space-y-4">
              <div>
                <label for="joinHouseholdId" class="block text-sm font-medium text-gray-700 mb-1">
                  Husstands ID
                </label>
                  <input
                    v-model="joinHouseholdId"
                    @input="onJoinHouseholdIdInput"
                    id="joinHouseholdId"
                    type="text"
                    placeholder="ABCD1234"
                    inputmode="text"
                    pattern="[A-Z0-9]*"
                    maxlength="8"
                    class="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
              </div>
              <p v-if="joinError" class="mt-1 text-red-600 text-sm">
                {{ joinError }}
              </p>
              <button
                @click="searchForHousehold"
                class="w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-800 transition"
                :disabled="joinIsLoading"
              >
                <span v-if="joinIsLoading">Søker...</span>
                <span v-else>Søk</span>
              </button>

              <div v-if="foundHousehold && !requestSent" class="p-4 bg-white border rounded shadow-sm space-y-2">
                <h3 class="text-lg font-semibold mb-2">Husstand funnet!</h3>
                <p class="text-sm text-gray-700">
                  Husstandsnavn: <span class="text-gray-900">{{ foundHousehold.name || 'Ukjent navn' }}</span>
                </p>
                <p class="text-sm text-gray-700">
                  Husstands‑ID: <span class="text-gray-900">{{ foundHousehold.id }}</span>
                </p>
                <button
                  @click="sendJoinRequest"
                  class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                  :disabled="joinIsLoading || isOwner"
                >
                  <span v-if="joinIsLoading">Sender forespørsel...</span>
                  <span v-else-if="isOwner">Kan ikke sende forespørsel som eier</span>
                  <span v-else>Send forespørsel om å bli med</span>
                </button>
              </div>

              <div v-if="joinSuccess" class="p-2 bg-green-50 border border-green-200 rounded">
                <p class="text-green-600 text-sm">{{ joinSuccess }}</p>
              </div>              
              <!-- Invitations -->
              <div class="max-w-md mx-auto">
                <h3 class="text-xl font-semibold text-center mb-4">Invitasjoner mottatt</h3>
                <div v-if="houseStore.receivedInvitations.length === 0" class="text-center text-gray-500 italic">
                  Ingen invitasjoner mottatt
                </div>
                <div
                  v-for="inv in houseStore.receivedInvitations"
                  :key="inv.id"
                  class="bg-white rounded-md p-4 border border-gray-200 mb-4"
                >
                  <div class="text-sm space-y-1 mb-2">
                    <p><strong>Husstands‑ID:</strong> {{ inv.householdId }}</p>
                    <p><strong>Navn:</strong> {{ inv.householdName }}</p>
                  </div>
                  <div class="flex gap-2 justify-end">
                    <button
                      @click="acceptInvitation(inv.id)"
                      class="px-4 py-1 rounded bg-primary text-white hover:opacity-90"
                    >Aksepter</button>
                    <button
                      @click="declineInvitation(inv.id)"
                      class="px-4 py-1 rounded border border-gray-400 hover:bg-gray-100"
                    >Avslå</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modals -->
        <AddMemberModal v-if="showAddForm" @close="showAddForm = false" />
        <InviteMemberModal v-if="showInviteForm" @close="showInviteForm = false" />
        <EditHouseholdModal v-if="showEditForm" @close="showEditForm = false" />

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

        <!-- Owner error modal when trying to leave -->
        <ConfirmModal
          v-if="ownerLeaveErrorOpen"
          title="Kan ikke forlate husstand"
          description="En hustandseier kan ikke forlate hustanden. Vennligst overfør eierskapet til en annen medlem eller slett husstanden."
          confirmText="OK"
          :showCancel="false"
          @confirm="ownerLeaveErrorOpen = false"
        />
      </div>
    </div>
  </div>
</template>