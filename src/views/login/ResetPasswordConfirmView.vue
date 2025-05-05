<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const token = ref(route.query.token || '')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const isLoading = ref(false)
const tokenValid = ref(false)

onMounted(async () => {
  if (!token.value) {
    error.value = 'Mangler token i lenken.'
    return
  }

  const result = await userStore.validateResetToken(token.value)
  if (result.success) {
    tokenValid.value = true
  } else {
    error.value = 'Lenken er ugyldig eller har utløpt.'
  }
})

const resetPassword = async () => {
  error.value = ''
  success.value = ''

  if (!token.value) {
    error.value = 'Token mangler fra lenken.'
    return
  }

  if (newPassword.value.length < 6) {
    error.value = 'Passordet må være minst 6 tegn.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passordene er ikke like.'
    return
  }

  isLoading.value = true
  const result = await userStore.resetPassword(token.value, newPassword.value)

  if (result.success) {
    success.value = result.message || 'Passordet ble tilbakestilt.'
    setTimeout(() => router.push('/login'), 3000)
  } else {
    error.value = userStore.error || 'Noe gikk galt.'
  }

  isLoading.value = false
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
    <h1 class="text-2xl font-bold mb-4">Lag nytt passord</h1>
    <p class="text-gray-700 mb-4">Fyll inn nytt passord for å tilbakestille kontoen din.</p>

    <!-- Form vises bare hvis tokenet er gyldig -->
    <div v-if="tokenValid" class="w-full max-w-md space-y-4">
      <input
        v-model="newPassword"
        type="password"
        class="w-full px-4 py-2 border rounded shadow-sm"
        placeholder="Nytt passord"
      />
      <input
        v-model="confirmPassword"
        type="password"
        class="w-full px-4 py-2 border rounded shadow-sm"
        placeholder="Bekreft passord"
      />

      <button
        @click="resetPassword"
        :disabled="isLoading"
        class="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700"
      >
        <span v-if="isLoading">Sender inn...</span>
        <span v-else>Tilbakestill passord</span>
      </button>
    </div>

    <!-- Meldinger -->
    <p v-if="error" class="text-sm text-gray-700 mt-4">{{ error }}</p>
    <div v-if="success" class="p-2 mt-4 bg-green-50 border border-green-200 rounded max-w-md w-full">
      <p class="text-green-600 text-sm">{{ success }}</p>
    </div>

    <!-- Tilbake til innlogging -->
    <RouterLink
      to="/login"
      class="mt-4 text-sm text-blue-700 hover:underline"
    >
      ← Tilbake til innlogging
    </RouterLink>
  </div>
</template>
