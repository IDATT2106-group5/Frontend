// Component tab for searching for another household to join while being a member of a household
<script setup>
import { ref } from 'vue'
import { useHouseholdStore } from '@/stores/HouseholdStore'
import { toast } from '@/components/ui/toast'

const store = useHouseholdStore()
const searchHousehold = ref('')

async function joinHousehold() {
  if (!searchHousehold.value) {
    toast({
      title: 'Feil',
      description: 'Vennligst oppgi husstands-ID.',
      variant: 'destructive'
    })
    return
  }

  // Placeholder logic
  toast({
    title: 'Søker…',
    description: `Søker etter husstand med ID: ${searchHousehold.value}`,
    variant: 'default'
  })
}

async function acceptInvitation(invitationId) {
  try {
    await store.acceptInvitation(invitationId)
    toast({
      title: 'Invitasjon akseptert',
      description: 'Du har blitt med i husstanden.',
      variant: 'success'
    })
  } catch (err) {
    toast({
      title: 'Feil',
      description: 'Kunne ikke akseptere invitasjonen.',
      variant: 'destructive'
    })
  }
}

async function declineInvitation(invitationId) {
  try {
    await store.declineInvitation(invitationId)
    toast({
      title: 'Invitasjon avslått',
      description: 'Du har avslått invitasjonen.',
      variant: 'default'
    })
  } catch (err) {
    toast({
      title: 'Feil',
      description: 'Kunne ikke avslå invitasjonen.',
      variant: 'destructive'
    })
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Search household -->
    <div class="space-y-4">
      <h2 class="text-xl font-semibold">Søk husstand</h2>
      <input
        v-model="searchHousehold"
        type="text"
        placeholder="Husstands-ID…"
        class="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        @click="joinHousehold"
        class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Bli med
      </button>
    </div>

    <!-- Invitasjoner mottatt -->
    <div>
      <h3 class="text-xl font-semibold text-center mb-4">Invitasjoner mottatt</h3>
      <div v-if="store.receivedInvitations.length === 0" class="text-center text-gray-500 italic">
        Ingen invitasjoner mottatt
      </div>
      <div
        v-for="invitasjon in store.receivedInvitations"
        :key="invitasjon.id"
        class="bg-white rounded-md p-4 max-w-md mx-auto border border-gray-200 mb-4"
      >
        <div class="text-sm space-y-1 mb-4">
          <p><strong>Husstands-ID:</strong> {{ invitasjon.householdId }}</p>
          <p><strong>Navn:</strong> {{ invitasjon.householdName }}</p>
        </div>
        <div class="flex gap-2 justify-end">
          <button
            @click="acceptInvitation(invitasjon.id)"
            class="px-4 py-1 rounded bg-primary text-white hover:opacity-90"
          >
            Aksepter
          </button>
          <button
            @click="declineInvitation(invitasjon.id)"
            class="px-4 py-1 rounded border border-gray-400 hover:bg-gray-100"
          >
            Avslå
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

