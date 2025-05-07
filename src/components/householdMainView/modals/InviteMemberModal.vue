<script setup>
import { ref } from 'vue'
import { useHouseholdStore } from '@/stores/HouseholdStore'
import { toast } from '@/components/ui/toast'

const emit = defineEmits(['close'])
const store = useHouseholdStore()

const email = ref('')
const error = ref('')
const loading = ref(false)

async function invite() {
  error.value = ''

  if (!email.value.trim() || !validateEmail(email.value)) {
    error.value = 'Vennligst oppgi en gyldig e-postadresse'
    return
  }

  const alreadyInvited = store.sentInvitations
    .some(inv => inv.email.toLowerCase() === email.value.trim().toLowerCase() && inv.status === 'PENDING')
  if (alreadyInvited) {
    error.value = 'Du har allerede sendt en invitasjon til denne e‑posten'
    return
  }

  const alreadyMember = store.members.registered
    .some(m => m.email.toLowerCase() === email.value.trim().toLowerCase())
  if (alreadyMember) {
    error.value = 'Denne brukeren er allerede medlem av husstanden'
    return
  }

  loading.value = true
  try {
    await store.inviteMember(email.value)

    toast({
      title: 'Invitasjon sendt',
      description: `En invitasjon ble sendt til ${email.value}.`,
      variant: 'success'
    })

    const emit = defineEmits(['close','invite-error'])
  } catch (e) {
    const backendMsg = e.response?.data || ''
    if (backendMsg.includes('User with email not found')) {
      error.value = 'Invitasjonen feilet. Det finnes ingen registrert bruker med denne e‑postadressen.'
    } else {
      error.value = 'Invitasjonen feilet. Prøv igjen senere.'
    }
    emit('invite-error', error.value)
  } finally {
    loading.value = false
  }
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
      <h3 class="text-xl font-semibold">Inviter medlem</h3>

      <input
        v-model="email"
        type="email"
        placeholder="E-postadresse"
        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        @keyup.enter="invite"
      />

      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>

      <div class="flex justify-end space-x-2">
        <button @click="emit('close')" class="px-3 py-1 border rounded hover:bg-gray-100">
          Avbryt
        </button>
        <button
          @click="invite"
          :disabled="loading"
          class="px-4 py-1 bg-primary text-white rounded hover:bg-[hsl(var(--primary-hover))] disabled:opacity-50"
        >
          {{ loading ? 'Sender…' : 'Send invitasjon' }}
        </button>
      </div>
    </div>
  </div>
</template>
