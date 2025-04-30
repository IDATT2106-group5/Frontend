<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Search, Copy } from 'lucide-vue-next'
import HouseholdMember from '@/components/HouseholdMember.vue'

const route = useRoute()
const router = useRouter()

const householdId = ref('HUS123456')
const activeTab = ref('members')
const searchHousehold = ref('')
const perPage = 5
const page = ref(1)
const showAddForm = ref(false)
const newMemberName = ref('')
const newMemberEmail = ref('')
const error = ref('')
const addingMember = ref(false)
const searchQuery = ref('')

// Household data
const registered = ref([
  { id: 1, name: 'Ola Nordmann', email: 'ola1@example.com', tlf:12342122 , isRegistered: true },
  { id: 2, name: 'Kari Nordmann', email: 'kari@example.com', isRegistered: true },
  { id: 3, name: 'Petter Smart', email: 'petter@example.com', isRegistered: true },
  { id: 4, name: 'Marie Nordmann', email: 'Bob@example.com', isRegistered: true },
  { id: 5, name: 'Johan Nordmann', email: 'Tets@mail.com', isRegistered: true },
  { id: 6, name: 'Anne Nordmann', email: 'adushd@test.com', isRegistered: true },
])

const unregistered = ref([
  { id: 7, name: 'Ukjent Bruker', email: null, isRegistered: false },
  { id: 8, name: 'Test Person', email: null, isRegistered: false }
])

const invitations = ref([
  { email: 'marie@example.com', date: '25.04.2025', status: 'Venter' },
  { email: 'johan@example.com', date: '23.04.2025', status: 'Godkjent' }
])

const ownershipRequests = ref([
  { id: 101, name: 'Anders Andersen' },
  { id: 102, name: 'Berit Berntsen' }
])

// Members management
const members = computed(() => [...registered.value, ...unregistered.value])

const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value
  const query = searchQuery.value.toLowerCase()
  return members.value.filter(member => 
    member.name.toLowerCase().includes(query) || 
    (member.email && member.email.toLowerCase().includes(query))
  )
})

const displayedMembers = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredMembers.value.slice(start, start + perPage)
})

const resetPagination = () => {
  page.value = 1
}

const watchSearchQuery = () => {
  resetPagination()
}

// Member actions
const removeMember = (member) => {
  const list = member.isRegistered ? registered.value : unregistered.value
  const index = list.findIndex(m => m.id === member.id)
  if (index !== -1) list.splice(index, 1)
}

const addMember = async () => {
  if (!newMemberName.value && !newMemberEmail.value) {
    error.value = 'Vennligst fyll ut enten navn eller e-post'
    return
  }
  
  addingMember.value = true
  
  const member = {
    name: newMemberName.value,
    email: newMemberEmail.value || null,
    isRegistered: !!newMemberEmail.value,
    id: registered.value.length + unregistered.value.length + 1
  }
  
  const list = member.isRegistered ? registered.value : unregistered.value
  list.push(member)
  
  newMemberName.value = ''
  newMemberEmail.value = ''
  showAddForm.value = false
  error.value = ''
  addingMember.value = false
}

// method to cope the household ID
const copyHouseholdId = async () => {
  try {
    await navigator.clipboard.writeText(householdId.value)
    alert('Husstands-ID kopiert til utklippstavlen!')
  } catch (err) {
    alert('Kunne ikke kopiere ID')
  }
}

// Search functionality
const joinHousehold = () => {
  alert(`Bli med i husstand med ID: ${searchHousehold.value}`)
}

// Ownership search logic
const ownershipName = ref('')
const selectedOwnershipUser = ref(null)
const hoveredIndex = ref(-1)

const filteredOwnershipSuggestions = computed(() => {
  if (!ownershipName.value) return []
  const query = ownershipName.value.toLowerCase()
  return members.value.filter(m =>
    m.isRegistered &&
    m.name.toLowerCase().includes(query)
  ).slice(0, 5)
})

const selectOwnershipName = (name) => {
  const selected = members.value.find(
    m => m.name === name && m.isRegistered
  )
  if (selected) {
    ownershipName.value = selected.name
    selectedOwnershipUser.value = selected
    hoveredIndex.value = -1
  }
}

watch(ownershipName, (val) => {
  const matched = members.value.find(
    m => m.name === val && m.isRegistered
  )
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

const giveOwnership = (user) => {
  alert(`Gi eierskap til ${user.name}`)
}

const acceptRequest = (request) => {
  const index = ownershipRequests.value.findIndex(r => r.id === request.id)
  if (index !== -1) ownershipRequests.value.splice(index, 1)
  alert(`Godkjent forespørsel fra ${request.name}`)
}

const declineRequest = (request) => {
  const index = ownershipRequests.value.findIndex(r => r.id === request.id)
  if (index !== -1) ownershipRequests.value.splice(index, 1)
  alert(`Avslått forespørsel fra ${request.name}`)
}

const cancelInvitation = (invitation) => {
  const index = invitations.value.findIndex(i => i.email === invitation.email)
  if (index !== -1) invitations.value.splice(index, 1)
  alert(`Avbrutt invitasjon til ${invitation.email}`)
}
</script>

<template>
  <div class="min-h-screen bg-[#f3f3f3]">
    <div class="max-w-3xl mx-auto p-6 space-y-4">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">🏠 Nordmann Husstand</h1>
          <p class="text-sm text-gray-600">Storgata 1, 0182 Oslo</p>
          <div class="flex items-center gap-2 text-xs text-gray-500">
         <span>ID: {{ householdId }}</span>
        <button @click="copyHouseholdId" class="hover:text-gray-700">
          <Copy class="w-4 h-4" />
        </button>
    </div>  
        </div>
        <div class="space-x-2">
          <Button variant="outline">Forlat husstand</Button>
          <Button variant="destructive">Slett husstand</Button>
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
            <Button>+ Send invitasjon</Button>
            <Button class="bg-green-600 text-white hover:bg-green-700" @click="showAddForm = true">+ Legg til medlem</Button>
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
          <span>Side {{ page }} av {{ Math.ceil(filteredMembers.length / perPage) || 1 }}</span>
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

            <div class="flex justify-end gap-2">
              <Button variant="outline" @click="showAddForm = false">Avbryt</Button>
              <Button class="bg-green-600 text-white" :disabled="addingMember" @click="addMember">
                {{ addingMember ? 'Legger til...' : 'Legg til' }}
              </Button>
            </div>

            <p class="text-red-500 mt-2" v-if="error">{{ error }}</p>
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
              class="absolute top-1/2 -translate-y-1/2 right-1 rounded-l-none"
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

        <!-- Requests -->
        <div>
          <h3 class="font-bold mt-6 mb-2">Forespørsler</h3>
          <div v-for="request in ownershipRequests" :key="request.id" class="flex justify-between bg-white p-3 rounded-md mb-2 shadow-sm">
            <span>{{ request.name }}</span>
            <div class="space-x-2">
              <Button class="bg-green-500 text-white" @click="acceptRequest(request)">Godta</Button>
              <Button variant="destructive" @click="declineRequest(request)">Avslå</Button>
            </div>
          </div>
        </div>

        <!-- Invitations -->
        <div>
          <h3 class="font-bold mt-6 mb-2">Sendte invitasjoner</h3>

          <div class="font-semibold text-sm text-black grid grid-cols-3 px-4 py-2 border-b border-gray-200 bg-white rounded-t-md">
            <span>E-post</span>
            <span>Dato sendt</span>
            <span>Status</span>
          </div>

          <div class="bg-white divide-y divide-gray-200 rounded-b-md">
            <div
              v-for="invite in invitations"
              :key="invite.email"
              class="grid grid-cols-3 items-center px-4 py-3 text-sm"
            >
              <span>{{ invite.email }}</span>
              <span>{{ invite.date }}</span>
              <div class="flex justify-between items-center">
                <span :class="{
                  'text-yellow-600': invite.status === 'Venter',
                  'text-green-600': invite.status === 'Godkjent'
                }">
                  {{ invite.status }}
                </span>
                <Button
                  v-if="invite.status === 'Venter'"
                  variant="destructive"
                  size="sm"
                  class="ml-2"
                  @click="cancelInvitation(invite)"
                >
                  Avbryt
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'search'" class="space-y-4">
        <h2 class="font-semibold">Søk husstand</h2>
        <input v-model="searchHousehold" placeholder="Søk husstand..." class="w-full px-3 py-2 border rounded" />
        <div class="flex items-center justify-between bg-gray-100 px-4 py-2 mt-2 rounded shadow">
          <span class="text-blue-700 font-semibold">Id: 123456</span>
          <Button @click="joinHousehold">Bli med</Button>
        </div>
      </div>
    </div>
  </div>
</template>