<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Search, Copy, Edit } from 'lucide-vue-next'
import HouseholdMember from '@/components/HouseholdMember.vue'
import { useHouseholdStore } from '@/stores/HouseholdStore'
import { useUserStore } from '@/stores/UserStore'

const route = useRoute()
const router = useRouter()
const householdStore = useHouseholdStore()
const userStore = useUserStore()

// UI state
const activeTab = ref('members')
const searchHousehold = ref('')
const perPage = 5
const page = ref(1)
const showAddForm = ref(false)
const newMemberName = ref('')
const newMemberEmail = ref('')
const error = ref('')
const formError = ref('') // New error state specifically for forms
const addingMember = ref(false)
const searchQuery = ref('')

// Edit household modal state
const showEditForm = ref(false)
const editHouseholdName = ref('')
const editHouseholdAddress = ref('')
const updatingHousehold = ref(false)

// Ownership management
const ownershipName = ref('')
const selectedOwnershipUser = ref(null)
const hoveredIndex = ref(-1)
const invitationEmail = ref('')
const showInviteForm = ref(false)
const inviting = ref(false)

// Load household data
onMounted(async () => {
  try {
    const hasHousehold = await householdStore.checkCurrentHousehold()
    if (!hasHousehold) {
      error.value = 'Ingen husstand funnet.'
    }
    if (hasHousehold) {
      await householdStore.fetchSentInvitations(); 
      await householdStore.fetchJoinRequests(); 
      
      // Initialize edit form with current values
      editHouseholdName.value = householdStore.currentHousehold?.name || ''
      editHouseholdAddress.value = householdStore.currentHousehold?.address || ''
    }
  } catch (err) {
    error.value = err.message || 'Kunne ikke laste husholdningsdata'
  }
})


// Computed properties
const members = computed(() => householdStore.allMembers)
const registeredMembers = computed(() => householdStore.members.registered)
const unregisteredMembers = computed(() => householdStore.members.unregistered)
const householdId = computed(() => householdStore.currentHousehold?.id || '')
const householdName = computed(() => householdStore.currentHousehold?.name || 'Ingen husstand')
const householdAddress = computed(() => householdStore.currentHousehold?.address || '')
const isLoading = computed(() => householdStore.isLoading)

const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value
  const query = searchQuery.value.toLowerCase()
  return members.value.filter(member => 
    member.fullName.toLowerCase().includes(query)
  )
})

const displayedMembers = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredMembers.value.slice(start, start + perPage)
})

const totalPages = computed(() => Math.ceil(filteredMembers.value.length / perPage) || 1)

const filteredOwnershipSuggestions = computed(() => {
  if (!ownershipName.value) return []
  const query = ownershipName.value.toLowerCase()
  return registeredMembers.value.filter(m =>
    m.name.toLowerCase().includes(query)
  ).slice(0, 5)
})

// Actions
const resetPagination = () => {
  page.value = 1
}

const watchSearchQuery = () => {
  resetPagination()
}

// Copy household ID to clipboard
const copyHouseholdId = async () => {
  try {
    await navigator.clipboard.writeText(householdId.value)
    alert('Husstands-ID kopiert til utklippstavlen!')
  } catch (err) {
    alert('Kunne ikke kopiere ID')
  }
}

// Member actions
const removeMember = async (member) => {
  try {
    await householdStore.removeMember(member.id, member.isRegistered)
  } catch (err) {
    error.value = err.message || 'Kunne ikke fjerne medlem'
  }
}

const addMember = async () => {
  if (!newMemberName.value) {
    formError.value = 'Vennligst fyll ut navn'
    return
  }
  
  addingMember.value = true
  formError.value = ''

  try {
    const newMember = {
      name: newMemberName.value,
      fullName: newMemberName.value, 
      email: newMemberEmail.value || null
    }
    
    await householdStore.addMember(newMember)
    
    // Reset form
    newMemberName.value = ''
    newMemberEmail.value = ''
    showAddForm.value = false
  } catch (err) {
    formError.value = err.message || 'Kunne ikke legge til medlem'
  } finally {
    addingMember.value = false
  }
}

watch(invitationEmail, () => {
  formError.value = '' // Clear form error when email changes
})

// Invite member
const inviteMember = async () => {
  if (!invitationEmail.value) {
    formError.value = 'Vennligst oppgi e-postadresse'
    return
  }

  inviting.value = true
  formError.value = ''

  try {
    await householdStore.inviteMember(invitationEmail.value)
    formError.value = ''
    alert('Invitasjon sendt!')
    invitationEmail.value = ''
    showInviteForm.value = false 
  } catch (err) {
    formError.value = err.message || 'Ingen registrert bruker funnet med denne e-postadressen'
  } finally {
    inviting.value = false
  }
}

const invitePage = ref(1)
const perPageInvites = 5

const displayedInvitations = computed(() => {
  const start = (invitePage.value - 1) * perPageInvites
  return householdStore.sentInvitations.slice(start, start + perPageInvites)
})

const totalInvitePages = computed(() =>
  Math.ceil(householdStore.sentInvitations.length / perPageInvites)
)

// Join household
const joinHousehold = async () => {
  if (!searchHousehold.value) {
    error.value = 'Vennligst oppgi husstands-ID'
    return
  }
  
  try {
    // Logic to join household would go here
    // This would typically involve a call to your HouseholdService
    alert(`Søker etter husstand med ID: ${searchHousehold.value}`)
  } catch (err) {
    error.value = err.message || 'Kunne ikke bli med i husstand'
  }
}

// Leave household
const leaveHousehold = async () => {
  if (confirm('Er du sikker på at du vil forlate husstanden?')) {
    try {
      await householdStore.leaveHousehold()
      alert('Du har forlatt husstanden')
    } catch (err) {
      error.value = err.message || 'Kunne ikke forlate husstand'
    }
  }
}

// Reset form errors when opening forms
const openAddMemberForm = () => {
  formError.value = ''
  showAddForm.value = true
}

const openInviteForm = () => {
  formError.value = ''
  showInviteForm.value = true
}

// Edit household form
const openEditHouseholdForm = () => {
  formError.value = ''
  editHouseholdName.value = householdStore.currentHousehold?.name || ''
  editHouseholdAddress.value = householdStore.currentHousehold?.address || ''
  showEditForm.value = true
}

const updateHousehold = async () => {
  if (!editHouseholdName.value) {
    formError.value = 'Vennligst fyll ut navn på husstand'
    return
  }
  
  updatingHousehold.value = true
  formError.value = ''

  try {
    await householdStore.updateHousehold({
      id: householdId.value,
      name: editHouseholdName.value,
      address: editHouseholdAddress.value
    })
    
    // Close form
    showEditForm.value = false
    alert('Husstand oppdatert!')
  } catch (err) {
    formError.value = err.message || 'Kunne ikke oppdatere husstand'
  } finally {
    updatingHousehold.value = false
  }
}

// Ownership management
const selectOwnershipName = (name) => {
  const selected = registeredMembers.value.find(m => m.name === name)
  if (selected) {
    ownershipName.value = selected.name
    selectedOwnershipUser.value = selected
    hoveredIndex.value = -1
  }
}

watch(ownershipName, (val) => {
  const matched = registeredMembers.value.find(m => m.name === val)
  selectedOwnershipUser.value = matched || null
})

const handleOwnershipKeyDown = (e) => {
  if (!filteredOwnershipSuggestions.value.length) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    hoveredIndex.value = (hoveredIndex.value + 1) % filteredOwnershipSuggestions.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    hoveredIndex.value = (hoveredIndex.value - 1 + filteredOwnershipSuggestions.value.length) % filteredOwnershipSuggestions.value.length
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (hoveredIndex.value >= 0) {
      const selected = filteredOwnershipSuggestions.value[hoveredIndex.value]
      selectOwnershipName(selected.name)
    }
  }
}

const giveOwnership = async (user) => {
  if (!user) return
  
  if (confirm(`Er du sikker på at du vil gi eierskap til ${user.name}?`)) {
    try {
      alert(`Eierskap overført til ${user.name}`)
    } catch (err) {
      error.value = err.message || 'Kunne ikke overføre eierskap'
    }
  }
}

</script>

<template>
  <div class="min-h-screen bg-[#f3f3f3]">
    <div class="max-w-3xl mx-auto p-6 space-y-4">
      <!-- Loading indicator -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Laster inn...</p>
      </div>
      
      <!-- Error message -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        {{ error }}
        
        <div class="mt-4" v-if="!householdStore.hasHousehold">
          <Button @click="router.push('/create-household')">Opprett ny husstand</Button>
        </div>
      </div>
      
      <div v-else-if="householdStore.hasHousehold">
        <!-- Household header -->
        <div class="flex justify-between items-center">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-bold">🏠 {{ householdName }}</h1>
              <button @click="openEditHouseholdForm" class="ml-2 p-1 rounded hover:bg-gray-200">
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
          <div class="space-x-2">
            <Button variant="outline" @click="leaveHousehold">Forlat husstand</Button>
          </div>
        </div>

        <!-- Top separation line -->
        <hr class="border-t border-gray-300 mb-2" />

        <!-- Tab buttons -->
        <div class="flex space-x-4 border-b border-gray-200">
          <button
            @click="activeTab = 'members'"
            :class="[
              'text-sm px-4 py-2 font-medium transition',
              activeTab === 'members'
                ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50 rounded-t'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Se medlemmer
          </button>
          <button
            @click="activeTab = 'search'"
            :class="[
              'text-sm px-4 py-2 font-medium transition',
              activeTab === 'search'
                ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50 rounded-t'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Søk husstand
          </button>
        </div>

        <div v-if="activeTab === 'members'" class="space-y-4">
          <!-- Header -->
          <div class="flex justify-between items-center">
            <h2 class="font-bold text-lg">Medlemmer i husstanden: {{ members.length }}</h2>
            <div class="space-x-2">
              <Button @click="openInviteForm">+ Send invitasjon</Button>
              <Button class="bg-green-600 text-white hover:bg-green-700" @click="openAddMemberForm">+ Legg til medlem</Button>
            </div>
          </div>

          <!-- Search bar -->
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-5 w-5 text-gray-400" />
            </div>
            <input
              v-model="searchQuery"
              @input="watchSearchQuery"
              type="text"
              placeholder="Søk etter medlemmer..."
              class="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            />
          </div>

          <!-- Member list -->
          <div v-if="displayedMembers.length > 0">
            <HouseholdMember 
              v-for="member in displayedMembers" 
              :key="member.id" 
              :member="member" 
              @remove-member="removeMember"
            />
          </div>

          <!-- No results message -->
          <div v-else class="bg-white p-4 text-center rounded-md shadow">
            <p>Ingen medlemmer funnet</p>
          </div>

          <!-- Pagination -->
          <div class="flex justify-center items-center space-x-2">
            <Button :disabled="page === 1" @click="page--">&larr;</Button>
            <span>Side {{ page }} av {{ totalPages }}</span>
            <Button :disabled="page * perPage >= filteredMembers.length" @click="page++">&rarr;</Button>
          </div>

          <!-- Add member form -->
          <div v-if="showAddForm" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h3 class="text-xl font-bold mb-4">Legg til medlem</h3>

              <label class="block text-sm font-medium text-gray-700 mb-1">Navn på medlem</label>
              <input v-model="newMemberName" placeholder="Navn på medlem" class="w-full px-3 py-2 border rounded mb-3" />

              <p class="text-sm text-gray-600 mb-4">
                Dette vil legge til et ikke-registrert medlem i husstanden.<br />
                For å invitere registrerte brukere, bruk <strong>Send Invitasjon</strong>.
              </p>

              <!-- Show form-specific error message -->
              <p class="text-red-500 text-sm mb-3" v-if="formError">{{ formError }}</p>

              <div class="flex justify-end gap-2">
                <Button variant="outline" @click="showAddForm = false">Avbryt</Button>
                <Button class="bg-green-600 text-white" :disabled="addingMember" @click="addMember">
                  {{ addingMember ? 'Legger til...' : 'Legg til' }}
                </Button>
              </div>
            </div>
          </div>
          
          <!-- Invite member form -->
          <div v-if="showInviteForm" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h3 class="text-xl font-bold mb-4">Inviter medlem</h3>

              <label class="block text-sm font-medium text-gray-700 mb-1">E-post</label>
              <input 
                v-model="invitationEmail" 
                type="email" 
                placeholder="bruker@eksempel.no" 
                class="w-full px-3 py-2 border rounded mb-3" 
              />

              <p class="text-sm text-gray-600 mb-4">
                Fyll inn eposten til medlemmet du ønsker å invitere.
              </p>

              <!-- Show form-specific error message -->
              <p class="text-red-500 text-sm mb-3" v-if="formError">{{ formError }}</p>

              <div class="flex justify-end gap-2">
                <Button variant="outline" @click="showInviteForm = false">Avbryt</Button>
                <Button class="bg-blue-600 text-white" :disabled="inviting" @click="inviteMember">
                  {{ inviting ? 'Sender...' : 'Send invitasjon' }}
                </Button>
              </div>
            </div>
          </div>
          
          <!-- Edit household form -->
          <div v-if="showEditForm" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h3 class="text-xl font-bold mb-4">Rediger husstand</h3>

              <label class="block text-sm font-medium text-gray-700 mb-1">Navn på husstand</label>
              <input 
                v-model="editHouseholdName" 
                placeholder="Navn på husstand" 
                class="w-full px-3 py-2 border rounded mb-3" 
              />

              <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input 
                v-model="editHouseholdAddress" 
                placeholder="Adresse (valgfri)" 
                class="w-full px-3 py-2 border rounded mb-3" 
              />

              <!-- Show form-specific error message -->
              <p class="text-red-500 text-sm mb-3" v-if="formError">{{ formError }}</p>

              <div class="flex justify-end gap-2">
                <Button variant="outline" @click="showEditForm = false">Avbryt</Button>
                <Button class="bg-blue-600 text-white" :disabled="updatingHousehold" @click="updateHousehold">
                  {{ updatingHousehold ? 'Lagrer...' : 'Lagre' }}
                </Button>
              </div>
            </div>
          </div>

          <!-- Ownership input -->
          <div class="mb-4">
            <label class="block text-sm font-semibold mb-1">Gi eierskap til et medlem</label>
            <div class="relative">
              <input
                v-model="ownershipName"
                @keydown="handleOwnershipKeyDown"
                type="text"
                placeholder="Skriv inn navn på medlem"
                class="w-full rounded-md border p-2 pr-28"
              />
              <Button
                class="absolute top-1/2 -translate-y-1/2 right-1"
                :disabled="!selectedOwnershipUser"
                @click="giveOwnership(selectedOwnershipUser)"
              >
                Gi eierskap
              </Button>

              <!-- Suggestions dropdown -->
              <div
                v-if="filteredOwnershipSuggestions.length"
                class="absolute z-10 bg-white shadow-md border w-full mt-1 rounded-md overflow-hidden"
              >
                <div
                  v-for="(suggestion, index) in filteredOwnershipSuggestions"
                  :key="suggestion.id"
                  class="px-3 py-2 cursor-pointer"
                  :class="{
                    'bg-gray-100': hoveredIndex === index,
                    'hover:bg-gray-100': hoveredIndex !== index
                  }"
                  @click="selectOwnershipName(suggestion.name)"
                >
                  <p class="font-medium">{{ suggestion.name }}</p>
                  <p class="text-sm text-gray-500" v-if="suggestion.email">{{ suggestion.email }}</p>
                  <p class="text-sm text-gray-400 italic" v-else>Ikke registrert</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Forespørsler -->
          <h3 class="text-lg font-semibold mb-2">Forespørsler</h3>
          <div class="bg-white rounded p-4 shadow">
            <div v-if="householdStore.ownershipRequests.length">
              <div v-for="request in householdStore.ownershipRequests" :key="request.id" class="flex justify-between items-center mb-2">
                <span>{{ request.email }}</span>
                <div v-if="request.status === 'PENDING'" class="flex gap-2">
                  <Button 
                    class="bg-green-600 text-white hover:bg-green-700" 
                    size="sm" 
                    @click="householdStore.updateJoinRequestStatus(request.id, 'ACCEPTED')"
                  >
                    Godta
                  </Button>
                  <Button
                    variant="outline"
                    class="text-red-600 border-red-500 hover:bg-red-50"
                    size="sm"
                    @click="householdStore.updateJoinRequestStatus(request.id, 'REJECTED')"
                  >
                    Avslå
                  </Button>                
                </div>
                <span v-else-if="request.status === 'ACCEPTED'" class="text-green-600 font-medium">Godtatt</span>
                <span v-else-if="request.status === 'REJECTED'" class="text-red-600 font-medium">Avslått</span>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500 italic">Ingen forespørsler</p>
          </div>

          <!-- Sendte invitasjoner -->
          <h3 class="text-lg font-semibold mb-2">Sendte invitasjoner</h3>
          <div class="bg-white rounded p-4 shadow">
            <table class="w-full text-sm text-left">
              <thead>
                <tr class="text-gray-700 border-b">
                  <th class="py-2 text-black">E-post</th>
                  <th class="py-2 text-black">Dato sendt</th>
                  <th class="py-2 text-black">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="invite in displayedInvitations" :key="invite.email" class="border-b">
                  <td class="py-2">{{ invite.email }}</td>
                  <td class="py-2">{{ invite.date }}</td>
                  <td class="py-2">
                    <span 
                        :class="{
                        'text-yellow-600 font-medium': invite.status === 'PENDING',
                        'text-green-600 font-medium': invite.status === 'ACCEPTED',
                        'text-red-600 font-medium': invite.status === 'DECLINED'
                      }"
                    >
                      {{ invite.status }}
                    </span>
                  </td>
                </tr>
                <tr v-if="Array.isArray(householdStore.sentInvitations) && householdStore.sentInvitations.length === 0">
                  <td colspan="4" class="py-2 text-gray-500 italic text-center">Ingen sendte invitasjoner</td>
                </tr>
              </tbody>
            </table>
            <!-- Pagination for invitations -->
            <div class="flex justify-center items-center space-x-2 mt-4">
              <Button :disabled="invitePage === 1" @click="invitePage--">&larr;</Button>
              <span>Side {{ invitePage }} av {{ totalInvitePages }}</span>
              <Button :disabled="invitePage * perPageInvites >= householdStore.sentInvitations.length" @click="invitePage++">&rarr;</Button>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'search'" class="space-y-4">
          <h2 class="font-semibold">Søk husstand</h2>
          <input 
            v-model="searchHousehold" 
            placeholder="Søk husstand..." 
            class="w-full px-3 py-2 border rounded" 
          />
          <Button @click="joinHousehold" class="w-full">Bli med</Button>
        </div>
      </div>
      
      <div v-else>
        <div class="text-center py-12 bg-white rounded-lg shadow">
          <h2 class="text-xl font-bold mb-4">Ingen husstand funnet</h2>
          <p class="mb-6">Du er ikke tilknyttet en husstand ennå.</p>
          <div class="space-x-4">
            <Button @click="router.push('/create-household')">Opprett husstand</Button>
            <Button variant="outline" @click="activeTab = 'search'">Søk husstand</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>