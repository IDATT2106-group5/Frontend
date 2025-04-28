<script setup>
import { ref, onMounted, computed } from 'vue'
import { User, Plus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast/use-toast'
import HouseholdMember from '@/components/HouseholdMember.vue'
import { useHouseholdStore } from '@/stores/HouseholdStore'

const householdStore = useHouseholdStore()
const { toast } = useToast()

const showAddForm = ref(false)
const newMember = ref({
  name: '',
  isRegistered: false
})

onMounted(async () => {
  await householdStore.fetchMembers()
})

function showSuccessToast(title, description) {
  toast({
    title,
    description,
    variant: 'success'
  })
}

function showErrorToast(title, description) {
  toast({
    title,
    description,
    variant: 'destructive'
  })
}

const addMember = async () => {
  if (newMember.value.name.trim()) {
    try {
      await householdStore.addMember({ ...newMember.value })
      showSuccessToast('Medlem lagt til', `${newMember.value.name} har blitt lagt til i husstanden.`)
      newMember.value = { name: '', isRegistered: false }
      showAddForm.value = false
    } catch (error) {
      showErrorToast('Feil', `Kunne ikke legge til ${newMember.value.name}.`)
    }
  }
}

const updateMember = async (member, data) => {
  try {
    await householdStore.updateMember(member.id, data, member.isRegistered)
    showSuccessToast('Medlem oppdatert', `${member.name} har blitt oppdatert.`)
  } catch (error) {
    showErrorToast('Feil', `Kunne ikke oppdatere ${member.name}.`)
  }
}

const removeMember = async (member) => {
  try {
    await householdStore.removeMember(member.id, member.isRegistered)
    showSuccessToast('Medlem fjernet', `${member.name} har blitt fjernet fra husstanden.`)
  } catch (error) {
    showErrorToast('Feil', `Kunne ikke fjerne ${member.name}.`)
  }
}

const inviteMember = async (member) => {
  try {
    await householdStore.inviteMember(member.id)
    showSuccessToast('Invitasjon sendt', 'Invitasjonen har blitt sendt.')
  } catch (error) {
    showErrorToast('Feil', 'Kunne ikke sende invitasjon.')
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center p-6 bg-gradient-to-b from-white to-gray-100">

    <div class="flex items-center gap-2 text-lg font-semibold text-blue-950 mb-6">
      <User class="w-6 h-6" />
      <span>Medlemmer i husstanden</span>
    </div>

    <div v-if="householdStore.isLoading" class="w-full max-w-md text-center py-8">
      <p>Laster medlemmer...</p>
    </div>

    <div v-else-if="householdStore.error" class="w-full max-w-md text-center py-8">
      <p class="text-red-500">{{ householdStore.error }}</p>
      <Button @click="householdStore.fetchMembers" class="mt-4">Prøv igjen</Button>
    </div>

    <div v-else class="w-full max-w-md space-y-6">

      <!-- Registered Members Section -->
      <div v-if="householdStore.members.registered.length">
        <h3 class="text-lg font-semibold text-blue-950 mb-2">Registrerte medlemmer</h3>
        <div class="space-y-3">
          <HouseholdMember
            v-for="(member, index) in householdStore.members.registered"
            :key="member.id || index"
            :name="member.name"
            :email="member.email"
            :phone="member.phone"
            :is-registered="true"
            :expandable="true"
            @update="(data) => updateMember(member, data)"
            @remove="() => removeMember(member)"
          />
        </div>
      </div>

      <!-- Unregistered Members Section -->
      <div v-if="householdStore.members.unregistered.length">
        <h3 class="text-lg font-semibold text-red-600 mb-2">Ikke registrerte medlemmer</h3>
        <div class="space-y-3">
          <HouseholdMember
            v-for="(member, index) in householdStore.members.unregistered"
            :key="member.id || index"
            :name="member.name"
            :email="member.email"
            :phone="member.phone"
            :is-registered="false"
            :expandable="false"
            @update="(data) => updateMember(member, data)"
            @remove="() => removeMember(member)"
          />
        </div>
      </div>

      <!-- Add New Member Form -->
      <div v-if="showAddForm" class="border rounded-lg bg-white shadow-sm p-4">
        <h3 class="font-medium text-blue-950 mb-3">Legg til nytt medlem</h3>
        <div class="space-y-3">
          <div>
            <label for="memberName" class="block text-sm font-medium text-gray-700 mb-1">Navn</label>
            <input
              id="memberName"
              v-model="newMember.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Skriv inn navn"
            />
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <Button variant="outline" class="text-sm" @click="showAddForm = false">Avbryt</Button>
            <Button class="bg-blue-900 text-white hover:bg-blue-700 text-sm" @click="addMember">Legg til</Button>
          </div>
        </div>
      </div>

      <div v-if="!showAddForm" class="flex flex-col gap-2">
        <Button
          variant="outline"
          class="bg-blue-900 text-white hover:bg-blue-700 flex items-center gap-1"
          @click="showAddForm = true"
        >
          <Plus class="w-4 h-4" />
          Legg til medlem
        </Button>
      </div>

    </div>

    <RouterLink to="/household/invite">
      <Button class="mt-8 bg-blue-900 text-white hover:bg-blue-700 text-sm">+ Send Invitasjon</Button>
    </RouterLink>

  </div>
</template>
