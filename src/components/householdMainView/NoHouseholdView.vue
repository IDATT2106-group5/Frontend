<script setup>
import { computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { User } from 'lucide-vue-next'
import { toast } from '@/components/ui/toast'
import { useUserStore } from '@/stores/UserStore'
import { useHouseholdStore } from '@/stores/HouseholdStore'

const router = useRouter()

const houseStore = useHouseholdStore()
const userStore = useUserStore()

const isAuthenticated = computed(() => userStore.isLoggedIn)

/**
 * Accept a received household invitation.
 * @param {string} invId - The ID of the invitation to accept.
 */
const acceptInvitation = async (invId) => {
  try {
    await houseStore.acceptInvitation(invId)
    await houseStore.loadHouseholdData()
    toast({ title: 'Invitasjon akseptert', description: 'Du har blitt med i husstanden.', variant: 'success' })
  } catch {
    toast({ title: 'Feil', description: 'Kunne ikke akseptere invitasjonen.', variant: 'destructive' })
  }
}

/**
 * Decline a received household invitation.
 * @param {string} invId - The ID of the invitation to decline.
 */
const declineInvitation = async (invId) => {
  try {
    await houseStore.declineInvitation(invId)
    toast({ title: 'Invitasjon avslått', description: 'Du har avslått invitasjonen.', variant: 'default' })
  } catch {
    toast({ title: 'Feil', description: 'Kunne ikke avslå invitasjonen.', variant: 'destructive' })
  }
}

/**
 * Navigate to the household creation view.
 */
const goCreate = () => router.push('/household/create')

/**
 * Navigate to the household join view.
 */
const goJoin = () => router.push('/household/join')
</script>

<template>
  <div class="text-center py-16 bg-base min-h-screen">
    <!-- Hvis ikke logget inn -->
      <div v-if="!isAuthenticated" class="text-center py-16 bg-base min-h-screen">
    <p class="text-lg font-medium text-red-600 mb-4">
      Logg inn for å bli med eller opprette husstand.
    </p>
    <RouterLink to="/login">
      <button
        class="px-6 py-2 bg-primary text-white rounded shadow hover:opacity-90"
      >
        Login
      </button>
    </RouterLink>
  </div>

    <!-- Hvis logget inn -->
    <div v-else>
      <h2 class="text-3xl font-bold text-black mb-4">
        Du er ikke medlem i en<br/>
        eksisterende husstand
      </h2>
      <p class="text-primary mb-8 font-medium">
        Velg om du vil opprette en ny husstand<br/>
        eller bli med i en eksisterende
      </p>

      <div class="flex justify-center gap-12 mb-12">
        <!-- Opprett ny husstand -->
        <div>
          <h3 class="font-semibold text-lg mb-2">Opprett ny husstand</h3>
          <button
            @click="goCreate"
            class="flex items-center gap-2 px-5 py-2 rounded-md bg-primary text-white font-medium shadow hover:opacity-90"
          >
            <span class="w-5 h-5 flex items-center justify-center">+</span>
            Opprett husstand
          </button>
        </div>

        <!-- Bli med i husstand -->
        <div>
          <h3 class="font-semibold text-lg mb-2">Bli med i husstand</h3>
          <button
            @click="goJoin"
            class="flex items-center gap-2 px-5 py-2 rounded-md bg-primary text-white font-medium shadow hover:opacity-90"
          >
            <User class="w-5 h-5"/> Bli med i husstand
          </button>
        </div>
      </div>

      <!-- Invitasjoner -->
      <div class="max-w-md mx-auto">
        <h3 class="text-xl font-semibold text-center mb-4">Invitasjoner mottatt</h3>
        <div v-if="houseStore.receivedInvitations.length === 0"
             class="text-center text-gray-500 italic">
          Ingen invitasjoner mottatt
        </div>
        <div
          v-for="inv in houseStore.receivedInvitations"
          :key="inv.id"
          class="bg-white rounded-md p-4 border border-gray-200 mb-4"
        >
          <div class="text-sm space-y-1 mb-2">
            <p><strong>Husstands-ID:</strong> {{ inv.householdId }}</p>
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
</template>
