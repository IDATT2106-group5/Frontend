<script setup>
import { ref } from 'vue'
import { User, Plus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import HouseholdMember from '@/components/HouseholdMember.vue'

const members = ref([
  {
    name: 'Ola Nordmann',
    email: 'test@hotmail.com',
    phone: '+123456789',
    isRegistered: true,
  },
  {
    name: 'Ola Nordmann',
    email: 'test@hotmail.com',
    isRegistered: true,
  },
  {
    name: 'Ola Nordmann',
    email: 'test123@hotmail.com',
    isRegistered: true,
  },
  {
    name: 'Ola Nordmann',
    isRegistered: true
  },
  {
    name: 'Ola Nordmann',
    isRegistered: true
  },
  {
    name: 'Ola Nordmann',
    isRegistered: false
  }
])

const showAddForm = ref(false)
const newMember = ref({
  name: '',
  isRegistered: false
})

const addMember = () => {
  if (newMember.value.name.trim()) {
    members.value.push({
      ...newMember.value
    })
    newMember.value = {
      name: '',
      isRegistered: false
    }
    showAddForm.value = false
  }
}

const updateMember = (index, data) => {
  if (index >= 0 && index < members.value.length) {
    members.value[index] = {
      ...members.value[index],
      ...data
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-start p-6 bg-gradient-to-b from-white to-gray-100">
    <div class="flex items-center gap-2 text-lg font-semibold text-blue-950 mb-6">
      <User class="w-6 h-6" />
      <span>Medlemmer i husstanden: <span class="font-bold">{{ members.length }}</span></span>
    </div>

    <div class="w-full max-w-md space-y-4">
      <HouseholdMember
        v-for="(member, index) in members"
        :key="index"
        :name="member.name"
        :email="member.email"
        :phone="member.phone"
        :is-registered="member.isRegistered"
        :expandable="member.isRegistered"
        :index="index"
        @update="updateMember"
      />

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
            <Button 
              variant="outline" 
              class="text-sm"
              @click="showAddForm = false"
            >
              Avbryt
            </Button>
            <Button 
              class="bg-blue-900 text-white hover:bg-blue-700 text-sm"
              @click="addMember"
            >
              Legg til
            </Button>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-end gap-2" v-if="!showAddForm">
        <span class="text-xs text-white bg-red-500 px-2 py-1 rounded-full">Ikke registrert</span>
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