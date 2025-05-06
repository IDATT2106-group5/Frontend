<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, sameAs, helpers } from '@vuelidate/validators'
import { Eye, EyeOff } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const token = ref(route.query.token || '')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const error = ref('')
const success = ref('')
const isLoading = ref(false)
const tokenValid = ref(false)

// Validation
const rules = computed(() => ({
  newPassword: {
    required: helpers.withMessage('Passord er påkrevd', required),
    minLength: helpers.withMessage('Passordet må være minst 8 tegn', minLength(8))
  },
  confirmPassword: {
    required: helpers.withMessage('Bekreft passord er påkrevd', required),
    sameAs: helpers.withMessage('Passordene må være like', sameAs(newPassword))
  }
}))

const v$ = useVuelidate(rules, { newPassword, confirmPassword })

const getErrorMessage = (field) => {
  const errors = field?.$errors
  return errors?.length ? errors[0].$message : ''
}

onMounted(async () => {
  if (!token.value) {
    error.value = 'Mangler token i lenken.'
    return
  }

  const result = await userStore.validateResetToken(token.value)
  tokenValid.value = result.success
  if (!result.success) {
    error.value = 'Lenken er ugyldig eller har utløpt.'
  }
})

const resetPassword = async () => {
  error.value = ''
  success.value = ''
  const valid = await v$.value.$validate()
  if (!valid) return

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
  <div class="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
    <RouterLink to="/" class="absolute top-4 left-6">
      <img src="/src/assets/icons/Krisefikser.png" alt="Krisefikser Logo" class="w-12 hover:opacity-80" />
    </RouterLink>
    <h1 class="text-2xl font-bold mb-4">Lag nytt passord</h1>
    <p class="text-gray-700 mb-4">Fyll inn nytt passord for å tilbakestille kontoen din.</p>

    <!-- Form -->
    <div v-if="tokenValid" class="w-full max-w-md space-y-4">
      <!-- New password -->
      <div class="relative">
        <input
          v-model="v$.newPassword.$model"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Nytt passord"
          class="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 pr-10"
          @blur="v$.newPassword.$touch()"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute top-2.5 right-2 text-gray-500"
        >
          <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
        </button>
        <p v-if="v$.newPassword.$error" class="text-sm text-red-600 mt-1">
          {{ getErrorMessage(v$.newPassword) }}
        </p>
      </div>

      <!-- Confirm password -->
      <div class="relative">
        <input
          v-model="v$.confirmPassword.$model"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="Bekreft passord"
          class="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 pr-10"
          @blur="v$.confirmPassword.$touch()"
        />
        <button
          type="button"
          @click="showConfirmPassword = !showConfirmPassword"
          class="absolute top-2.5 right-2 text-gray-500"
        >
          <component :is="showConfirmPassword ? EyeOff : Eye" class="w-5 h-5" />
        </button>
        <p v-if="v$.confirmPassword.$error" class="text-sm text-red-600 mt-1">
          {{ getErrorMessage(v$.confirmPassword) }}
        </p>
      </div>

      <!-- Submit button -->
      <button
        @click="resetPassword"
        :disabled="isLoading"
        class="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700"
      >
        <span v-if="isLoading">Sender inn...</span>
        <span v-else>Tilbakestill passord</span>
      </button>
    </div>

    <!-- Error message -->
    <p v-if="error" class="text-sm text-red-600 mt-4">{{ error }}</p>

    <!-- Success message -->
    <div
      v-if="success"
      class="p-2 mt-4 bg-green-50 border border-green-200 rounded max-w-md w-full"
    >
      <p class="text-green-600 text-sm">{{ success }}</p>
    </div>

    <!-- Login link -->
    <RouterLink
      to="/login"
      class="mt-4 text-sm text-blue-700 hover:underline"
    >
      ← Tilbake til innlogging
    </RouterLink>
  </div>
</template>
