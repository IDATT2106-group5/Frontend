<script setup>
import { ref } from 'vue'
import { User } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import HouseholdMember from '@/components/HouseholdMember.vue'

const members = ref([
  {
    name: 'Ola Nordmann',
    email: 'test@hotmail.com',
    phone: '+123456789',
    isRegistered: true,
    expandable: true
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
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-start p-6 bg-gradient-to-b from-white to-gray-100">
    <!-- Header -->
    <div class="flex items-center gap-2 text-lg font-semibold text-blue-950 mb-6">
      <User class="w-6 h-6" />
      <span>Medlemmer i husstanden: <span class="font-bold">{{ members.length }}</span></span>
    </div>

    <!-- Member List -->
    <div class="w-full max-w-md space-y-4">
      <HouseholdMember
        v-for="(member, index) in members"
        :key="index"
        :name="member.name"
        :email="member.email"
        :phone="member.phone"
        :is-registered="member.isRegistered"
        :expandable="member.expandable"
      />

      <!-- Unregistered status + Add button -->
      <div class="flex flex-col items-center gap-2">
        <span class="text-xs text-white bg-red-500 px-2 py-1 rounded-full">Ikke registrert</span>
        <Button variant="outline" class="bg-blue-900 text-white hover:bg-blue-950">Legg til medlem</Button>
      </div>
    </div>

    <!-- Send Invitation -->
    <Button class="mt-8 bg-blue-900 text-white hover:bg-blue-950 text-sm">+ Send Invitasjon</Button>
  </div>
</template>
