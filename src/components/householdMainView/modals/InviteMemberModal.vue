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
  
  if (!email.value.trim()) {
    error.value = 'Vennligst skriv inn en e-postadresse'
    return
  }
  
  if (!validateEmail(email.value)) {
    error.value = 'Ugyldig e-postformat'
    return
  }

  const cleanEmail = email.value.trim().toLowerCase()

  if (store.sentInvitations.some(inv => 
    inv.email.toLowerCase() === cleanEmail && 
    inv.status === 'PENDING'
  )) {
    error.value = 'Allerede sendt invitasjon til denne e-posten'
    return
  }

  if (store.members.registered.some(m => 
    m.email.toLowerCase() === cleanEmail
  )) {
    error.value = 'Denne brukeren er allerede medlem'
    return
  }

  loading.value = true
  try {
    await store.inviteMember(cleanEmail)    
    toast({
      title: 'Invitasjon sendt',
      description: `En invitasjon ble sendt til ${cleanEmail}`,
      variant: 'success'
    })
    emit('close')
  } catch (e) {
    const backendError = e.response?.data?.message || 
                        e.response?.data?.error || 
                        e.response?.data || 
                        'Ukjent feil'
    
    let userMessage = backendError
    if (backendError.includes('User with email not found')) {
      userMessage = `Fant ingen bruker med e-post: ${cleanEmail}`
    }

    error.value = userMessage

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
        :class="{ 'border-red-500': error }"
        @keyup.enter="invite"
      />

      <p v-if="error" class="text-red-600 text-sm animate-fade-in">
        {{ error }}
      </p>

      <div class="flex justify-end space-x-2">
        <button 
          @click="emit('close')" 
          class="px-3 py-1 border rounded hover:bg-gray-100"
          :disabled="loading"
        >
          Avbryt
        </button>
        <button
          @click="invite"
          :disabled="loading"
          class="px-4 py-1 bg-primary text-white rounded hover:bg-[hsl(var(--primary-hover))] disabled:opacity-50 relative"
        >
          <span :class="{ 'invisible': loading }">Send invitasjon</span>
          <span v-if="loading" class="absolute inset-0 flex items-center justify-center">
            <svg 
              class="animate-spin h-5 w-5 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>