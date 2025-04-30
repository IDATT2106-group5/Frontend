<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { useHouseholdStore } from '@/stores/HouseholdStore'
import { useUserStore } from '@/stores/UserStore'

const route = useRoute()
const router = useRouter()

const activeTab = ref('members')
const page = ref(1)
const perPage = 5
const searchHousehold = ref('')
const showAddForm = ref(false)
const newMemberName = ref('')
const newMemberEmail = ref('')
const error = ref('')
const addingMember = ref(false)

const householdStore = useHouseholdStore()
onMounted(async () => {
  await householdStore.fetchMembers()
})

const members = computed(() => [
  ...householdStore.members.registered,
  ...householdStore.members.unregistered
])

const displayedMembers = computed(() => {
  const start = (page.value - 1) * perPage
  return members.value.slice(start, start + perPage)
})

const invitations = ref([
  { email: 'marie@example.com', date: '25.04.2025', status: 'Venter' },
  { email: 'johan@example.com', date: '23.04.2025', status: 'Godkjent' }
])

const ownershipRequests = ref([
  { id: 101, name: 'Anders Andersen' },
  { id: 102, name: 'Berit Berntsen' }
])

const joinHousehold = () => alert(`Join household with ID: ${searchHousehold.value}`)

const addMember = async () => {
  if (!newMemberName.value && !newMemberEmail.value) {
    error.value = 'Vennligst fyll ut enten navn eller e-post'
    return
  }

  try {
    addingMember.value = true
    const memberData = {
      name: newMemberName.value,
      email: newMemberEmail.value || null,
      isRegistered: !!newMemberEmail.value
    }
    await householdStore.addMember(memberData)
    newMemberName.value = ''
    newMemberEmail.value = ''
    showAddForm.value = false
    error.value = ''
  } catch (err) {
    error.value = err.message || 'Kunne ikke legge til medlem'
  } finally {
    addingMember.value = false
  }
}

const removeMember = async (member) => {
  try {
    await householdStore.removeMember(member.id, member.isRegistered)
  } catch (err) {
    error.value = err.message || 'Kunne ikke fjerne medlem'
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#f3f3f3]">
    <div class="max-w-3xl mx-auto p-6 space-y-4">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">🏠 Nordmann Husstand</h1>
          <p class="text-sm text-gray-600">Storgata 1, 0182 Oslo</p>
        </div>
        <div class="space-x-2">
          <Button variant="outline">Forlat husstand</Button>
          <Button variant="destructive">Slett husstand</Button>
        </div>
      </div>

      <div class="border-b border-gray-300 flex space-x-4 mt-4">
        <button @click="activeTab = 'members'" :class="activeTab === 'members' ? 'font-semibold border-b-2 border-blue-500' : 'text-gray-500'">
          Se medlemmer
        </button>
        <button @click="activeTab = 'search'" :class="activeTab === 'search' ? 'font-semibold border-b-2 border-blue-500' : 'text-gray-500'">
          Søk husstand
        </button>
      </div>

      <div v-if="activeTab === 'members'" class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="font-semibold text-lg">Medlemmer i husstanden: {{ members.length }}</h2>
          <div class="space-x-2">
            <Button>+ Send invitasjon</Button>
            <Button class="bg-green-600 text-white hover:bg-green-700" @click="showAddForm = true">+ Legg til medlem</Button>
          </div>
        </div>

        <div v-for="member in displayedMembers" :key="member.id" class="flex justify-between bg-white shadow p-3 rounded-md">
          <div>
            <p class="font-medium">{{ member.name }}</p>
            <p class="text-sm text-gray-600">{{ member.email || '(Ikke registrert)' }}</p>
          </div>
          <Button variant="destructive" @click="removeMember(member)">Fjern</Button>
        </div>

        <div class="flex justify-center items-center space-x-2">
          <Button :disabled="page === 1" @click="page--">&larr;</Button>
          <span>Side {{ page }}</span>
          <Button :disabled="page * perPage >= members.length" @click="page++">&rarr;</Button>
        </div>

        <div v-if="showAddForm" class="bg-white p-4 rounded shadow">
          <h3 class="font-medium mb-2">Legg til medlem</h3>
          <input v-model="newMemberName" placeholder="Navn" class="w-full mb-2 px-3 py-2 border rounded" />
          <input v-model="newMemberEmail" placeholder="E-post (valgfritt)" class="w-full mb-2 px-3 py-2 border rounded" />
          <div class="flex gap-2">
            <Button variant="outline" @click="showAddForm = false">Avbryt</Button>
            <Button class="bg-blue-900 text-white" :disabled="addingMember" @click="addMember">
              {{ addingMember ? 'Legger til...' : 'Legg til' }}
            </Button>
          </div>
          <p class="text-red-500 mt-2" v-if="error">{{ error }}</p>
        </div>

        <div>
          <h3 class="font-medium mt-6 mb-2">Forespørsler</h3>
          <div v-for="request in ownershipRequests" :key="request.id" class="flex justify-between bg-white p-3 rounded-md mb-2 shadow-sm">
            <span>{{ request.name }}</span>
            <div class="space-x-2">
              <Button class="bg-green-500 text-white">Godta</Button>
              <Button variant="destructive">Avslå</Button>
            </div>
          </div>
        </div>

        <div>
          <h3 class="font-medium mt-6 mb-2">Sendte invitasjoner</h3>
          <div class="grid grid-cols-3 font-semibold mb-1 text-sm text-gray-600">
            <span>E-post</span>
            <span>Dato sendt</span>
            <span>Status</span>
          </div>
          <div v-for="invite in invitations" :key="invite.email" class="grid grid-cols-3 items-center bg-white rounded-md p-2 mb-1 shadow-sm text-sm">
            <span>{{ invite.email }}</span>
            <span>{{ invite.date }}</span>
            <span class="flex items-center gap-2">
              <span :class="{
                'text-yellow-600': invite.status === 'Venter',
                'text-green-600': invite.status === 'Godkjent'
              }">{{ invite.status }}</span>
              <Button variant="destructive" size="sm">Avbryt</Button>
            </span>
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
