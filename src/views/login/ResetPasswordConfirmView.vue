<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'
import { useVuelidate } from '@vuelidate/core'
import { helpers, minLength, required, sameAs } from '@vuelidate/validators'
import { Eye, EyeOff } from 'lucide-vue-next'
import PasswordRequirementsList from '@/components/passwordRequirement/PasswordRequirementsList.vue'
import { Input } from '@/components/ui/input/index.js'
import { Button } from '@/components/ui/button/index.js'

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
      minLength: helpers.withMessage('Passordet må være minst 8 tegn', minLength(8)),
      containsUppercase: helpers.withMessage(
        'Passordet må inneholde minst én stor bokstav',
        helpers.regex(/[A-Z]/)
      ),
      containsLowercase: helpers.withMessage(
        'Passordet må inneholde minst én liten bokstav',
        helpers.regex(/[a-z]/)
      ),
      containsNumber: helpers.withMessage(
        'Passordet må inneholde minst ett tall',
        helpers.regex(/[0-9]/)
      ),
      containsSpecial: helpers.withMessage(
        'Passordet må inneholde minst ett spesialtegn (f.eks. !@#$%^&*)',
        helpers.regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/)
      )
  },
  confirmPassword: {
    required: helpers.withMessage('Bekreft passord er påkrevd', required),
    sameAs: helpers.withMessage('Passordene må være like', sameAs(newPassword)),
  },
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
      <img
        src="/src/assets/icons/Krisefikser.png"
        alt="Krisefikser Logo"
        class="w-12 hover:opacity-80"
      />
    </RouterLink>

    <h1 class="text-2xl font-bold mb-4">Lag nytt passord</h1>
    <p class="text-gray-700 mb-4">Fyll inn nytt passord for å tilbakestille kontoen din.</p>

    <!-- Form -->
    <div v-if="tokenValid" class="w-full max-w-md space-y-4">
      <!-- New password -->
      <div class="space-y-2">
        <div class="relative">
          <Input
            id="newPassword"
            v-model="newPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Lag et passord"
            class="pr-10"
            :class="{ 'border-red-500': v$.newPassword.$error }"
            @input="v$.newPassword.$touch()"
            @blur="v$.newPassword.$touch()"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-500"
          >
            <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
          </button>
        </div>
        <div v-if="v$.newPassword.$error" class="text-red-500 text-xs">
          {{ getErrorMessage(v$.newPassword) }}
        </div>
        <PasswordRequirementsList :password="newPassword" :validator="v$.newPassword" />
      </div>

      <!-- Confirm password -->
      <div class="space-y-2">
        <div class="relative">
          <Input
            id="confirmPassword"
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Bekreft passord"
            class="pr-10"
            :class="{ 'border-red-500': v$.confirmPassword.$error }"
            @input="v$.confirmPassword.$touch()"
            @blur="v$.confirmPassword.$touch()"
          />
          <button
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-500"
          >
            <component :is="showConfirmPassword ? EyeOff : Eye" class="w-5 h-5" />
          </button>
        </div>
        <div v-if="v$.confirmPassword.$error" class="text-red-500 text-xs">
          {{ getErrorMessage(v$.confirmPassword) }}
        </div>
      </div>

      <!-- Submit button -->
      <Button
        @click="resetPassword"
        :disabled="isLoading"
        class="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700"
      >
        <span v-if="isLoading">Sender inn...</span>
        <span v-else>Tilbakestill passord</span>
      </Button>

      <!-- Error message -->
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <!-- Success message -->
      <div v-if="success" class="p-2 bg-green-50 border border-green-200 rounded">
        <p class="text-green-600 text-sm">{{ success }}</p>
      </div>
    </div>

    <!-- Show error if token is invalid -->
    <div v-if="!tokenValid && error" class="w-full max-w-md mt-4">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <!-- Login link -->
    <RouterLink to="/login" class="mt-4 text-sm text-blue-700 hover:underline">
      ← Tilbake til innlogging
    </RouterLink>
  </div>
</template>
