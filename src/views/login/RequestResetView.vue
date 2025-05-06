<script setup>
import { ref } from 'vue'
import { Mail } from 'lucide-vue-next'
import { useUserStore } from '@/stores/UserStore'

const email = ref('')
const error = ref('')
const success = ref('')
const isLoading = ref(false)
const userStore = useUserStore()

const checkEmailAndSendResetLink = async () => {
  error.value = ''
  success.value = ''
  isLoading.value = true

  if (!email.value || !email.value.includes('@')) {
    error.value = 'Vennligst skriv inn en gyldig e-postadresse'
    isLoading.value = false
    return
  }

  try {
    const result = await userStore.requestPasswordReset(email.value)

    if (result?.success) {
      success.value = 'En lenke for tilbakestilling av passord er sendt til e-posten din'
    } else {
      error.value = userStore.error || 'E-posten er ikke registrert'
    }
  } catch (err) {
    console.error('Password reset error:', err)
    error.value = userStore.error || 'Noe gikk galt, prøv igjen senere'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-white">
    <RouterLink to="/" class="absolute top-4 left-6">
      <img src="/src/assets/icons/Krisefikser.png" alt="Krisefikser Logo" class="w-12 hover:opacity-80" />
    </RouterLink>
    <Mail class="w-20 h-20 text-blue-700 mb-4" />

    <h1 class="text-2xl font-bold mb-2">Tilbakestill passord</h1>
    <p class="text-teal-800 mb-4">Skriv inn din registrerte e-postadresse:</p>

    <div class="w-full max-w-md space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          E-post
        </label>
        <input
          v-model="email"
          id="email"
          type="email"
          class="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="din@epost.no"
        />
      </div>

      <button
        @click="checkEmailAndSendResetLink"
        class="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition"
        :disabled="isLoading"
      >
        <span v-if="isLoading">Sender e-post...</span>
        <span v-else>Send tilbakestillingslenke</span>
      </button>

      <div v-if="error" class="p-2 bg-red-50 border border-red-200 rounded">
        <p class="text-red-600 text-sm">{{ error }}</p>
      </div>

      <div v-if="success" class="p-2 bg-green-50 border border-green-200 rounded">
        <p class="text-green-600 text-sm">{{ success }}</p>
      </div>
      <RouterLink
        to="/login"
        class="mt-4 text-sm text-blue-700 hover:underline"
      >
        ← Tilbake til innlogging
      </RouterLink>
    </div>
  </div>
</template>
