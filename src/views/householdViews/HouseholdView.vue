<script setup>
import { ref, onMounted, computed } from 'vue'
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

// Function to truncate text with ellipsis
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Computed property for truncated household name
const truncatedHouseholdName = computed(() => {
  return truncateText(householdName.value, 20);
})

// Computed property for truncated household address
const truncatedHouseholdAddress = computed(() => {
  return truncateText(householdAddress.value, 30);
})

const activeTab = ref('members')
const confirmLeaveOpen = ref(false)
const confirmDeleteOpen = ref(false)
const ownerLeaveErrorOpen = ref(false)

const joinHouseholdId = ref('')
const joinError = ref('')
const joinSuccess = ref('')
const joinIsLoading = ref(false)
const foundHousehold = ref(null)
const requestSent = ref(false)

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
      toast({ title: 'Husstands-ID kopiert', description: 'Husstands-ID er nå i utklippstavlen.', variant: 'success' })
    })
    .catch(() => {
      toast({ title: 'Kunne ikke kopiere', description: 'Det skjedde en feil ved kopiering av husstands-ID.', variant: 'destructive' })
    })
}

function handleLeaveButtonClick() {
  isOwner.value ? ownerLeaveErrorOpen.value = true : confirmLeaveOpen.value = true
}

function onJoinHouseholdIdInput(e) {
  joinHouseholdId.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
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

async function searchForHousehold() {
  joinError.value = ''
  joinSuccess.value = ''
  foundHousehold.value = null
  requestSent.value = false
  joinIsLoading.value = true

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
    if (found?.id) {
      foundHousehold.value = { 
        id: found.id, 
        name: found.name || 'Ukjent navn',
        truncatedName: truncateText(found.name, 20) || 'Ukjent navn'
      }
      joinSuccess.value = `Husstand funnet: ${found.name || found.id}`
    } else {
      joinError.value = 'Ingen husstand funnet'
    }
  } catch (err) {
    joinError.value = 'Ingen husstand funnet'
  } finally {
    joinIsLoading.value = false
  }
}

const sendJoinRequest = async () => {
  if (!foundHousehold.value?.id) {
    joinError.value = 'Du må først søke etter en gyldig husstand'
    return
  }

  joinIsLoading.value = true
  joinError.value = ''
  joinSuccess.value = ''

  if (isOwner.value) {
    joinError.value = 'Du er eier av en husstand. Forlat først din nåværende husstand.'
    joinIsLoading.value = false
    return
  }

  try {
    await houseStore.sendJoinRequest(foundHousehold.value.id)
    joinSuccess.value = 'Forespørsel sendt!'
    requestSent.value = true
    foundHousehold.value = null
  } catch (err) {
    joinError.value = err.message || 'Kunne ikke sende forespørsel'
  } finally {
    joinIsLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin h-10 w-10 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto mb-3"></div>
        <p>Laster inn…</p>
      </div>

      <div v-else-if="error && hasHousehold && activeTab==='members'" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
        {{ error }}
      </div>

      <NoHouseholdView v-else-if="!hasHousehold" />

      <div v-else>
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl sm:text-2xl font-bold">🏠 {{ truncatedHouseholdName }}</h1>
              <button v-if="isOwner" @click="openEditHouseholdForm" class="p-1 rounded hover:bg-gray-200">
                <Edit class="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <p class="text-xs sm:text-sm text-gray-600">{{ truncatedHouseholdAddress }}</p>
            <div class="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <span>ID: {{ householdId }}</span>
              <button @click="copyHouseholdId" class="hover:text-gray-700">
                <Copy class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button v-if="isOwner" @click="confirmDeleteOpen = true" class="px-3 py-1 text-sm border border-red-500 text-red-600 rounded hover:bg-red-50">
              Slett
            </button>
            <button @click="handleLeaveButtonClick" class="px-3 py-1 text-sm border border-gray-700 text-gray-700 rounded hover:bg-gray-100">
              Forlat
            </button>
          </div>
        </div>

        <div class="mt-6 flex space-x-4 border-b border-gray-200 overflow-x-auto"> 
          <button
            @click="activeTab = 'members'"
            :class="activeTab === 'members' ? 'text-blue-600 border-b-2 border-blue-500 pb-1' : 'text-gray-500 pb-1 hover:text-gray-700'"
            class="flex-shrink-0"
          >
            Medlemmer
          </button>
          <button
            @click="activeTab = 'search'"
            :class="activeTab === 'search' ? 'text-blue-600 border-b-2 border-blue-500 pb-1' : 'text-gray-500 pb-1 hover:text-gray-700'"
            class="flex-shrink-0"
          >
            Søk husstand
          </button>
        </div>

        <div class="mt-4">
          <MembersTab
            v-if="activeTab === 'members'"
            @open-add="openAddMemberForm"
            @open-invite="openInviteForm"
          />

          <div v-else-if="activeTab === 'search'" class="space-y-6">
            <div class="text-center px-2">
              <h2 class="text-lg font-bold mb-1">Søk å bli med</h2>
              <p class="text-teal-800 text-sm">Skriv inn husstands‑ID:</p>
              <p v-if="isOwner" class="text-orange-600 text-xs mt-1">
                En husstands eier kan ikke sende eller akseptere invitasjoner om å bli med i andre husstander. Vennligst slett husstanden eller gi eierskap til noen andre.
              </p>
            </div>
            <div class="space-y-4">
              <div>
                <label for="joinHouseholdId" class="block text-xs font-medium text-gray-700 mb-1">
                  Husstands‑ID
                </label>
                <input
                  v-model="joinHouseholdId"
                  @input="onJoinHouseholdIdInput"
                  id="joinHouseholdId"
                  data-cy="join-household-id-input"
                  type="text"
                  placeholder="ABCD1234"
                  maxlength="8"
                  class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <p v-if="joinError" class="text-red-600 text-xs">
                {{ joinError }}
              </p>
              <button
                @click="searchForHousehold"
                data-cy="search-household-button"
                class="w-full text-sm bg-gray-700 text-white py-2 rounded hover:bg-gray-800"
                :disabled="joinIsLoading"
              >
                <span v-if="joinIsLoading">Søker...</span>
                <span v-else>Søk</span>
              </button>

              <div v-if="foundHousehold && !requestSent" class="p-3 bg-white border rounded shadow-sm space-y-2">
                <h3 class="text-sm font-semibold">Husstand funnet</h3>
                <p class="text-xs">Navn: <span class="font-medium">{{ foundHousehold.truncatedName }}</span></p>
                <p class="text-xs">ID: <span class="font-medium">{{ foundHousehold.id }}</span></p>
                <button
                  @click="sendJoinRequest"
                  class="w-full text-sm bg-blue-600 text-white py-1 rounded hover:bg-blue-700"
                  :disabled="joinIsLoading || isOwner"
                >
                  <span v-if="joinIsLoading">Sender...</span>
                  <span v-else>Send forespørsel</span>
                </button>
              </div>

              <div v-if="joinSuccess" class="p-2 bg-green-50 border border-green-200 rounded">
                <p class="text-green-600 text-xs">{{ joinSuccess }}</p>
              </div>

              <div>
                <h3 class="text-sm font-semibold text-center mb-2">Invitasjoner</h3>
                <div v-if="houseStore.receivedInvitations.length === 0" class="text-center text-gray-500 italic text-xs">
                  Ingen invitasjoner
                </div>
                <div
                  v-for="inv in houseStore.receivedInvitations"
                  :key="inv.id"
                  class="bg-white rounded p-3 border mb-3 space-y-2"
                >
                  <p class="text-xs"><strong>ID:</strong> {{ inv.householdId }}</p>
                  <p class="text-xs"><strong>Navn:</strong> {{ truncateText(inv.householdName, 20) }}</p>
                  <div class="flex gap-2 justify-center">
                    <button
                      @click="acceptInvitation(inv.id)"
                      :disabled="isOwner"
                      :title="isOwner
                        ? 'En husstandseier kan ikke akseptere invitasjoner. Vennligst slett husstanden eller gi noen andre eierskap.'
                        : ''"
                      class="flex-1 text-xs py-1 rounded bg-primary text-white
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Aksepter
                    </button>
                    <button @click="declineInvitation(inv.id)" class="flex-1 text-xs py-1 rounded border border-gray-400">
                      Avslå
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AddMemberModal v-if="showAddForm" @close="showAddForm = false" />
        <InviteMemberModal v-if="showInviteForm" @close="showInviteForm = false" />
        <EditHouseholdModal v-if="showEditForm" @close="showEditForm = false" />

        <ConfirmModal v-if="confirmDeleteOpen" title="Slett husstand" description="Er du sikker? Dette kan ikke angres." @cancel="confirmDeleteOpen = false" @confirm="handleDelete" />
        <ConfirmModal v-if="confirmLeaveOpen" title="Forlat husstand" description="Er du sikker?" @cancel="confirmLeaveOpen = false" @confirm="handleLeave" />
        <ConfirmModal v-if="ownerLeaveErrorOpen" title="Kan ikke forlate" description="Overfør eierskap eller slett husstanden først." confirmText="OK" :showCancel="false" @confirm="ownerLeaveErrorOpen = false" />
      </div>
    </div>
  </div>
</template>
