<script setup>
import { ref, reactive, computed, onMounted, onBeforeMount } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/stores/UserStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, sameAs, helpers } from '@vuelidate/validators'
import { KeySquare, Eye, EyeOff } from 'lucide-vue-next'
import PasswordRequirementsList from "@/components/passwordRequirement/PasswordRequirementsList.vue"

const props = defineProps({
  email: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  emailMissing: Boolean,
  tokenMissing: Boolean
})

const router = useRouter()
const userStore = useUserStore()

/**
 * Logs out the user when mounting the component to ensure fresh state.
 */
onBeforeMount(() => {
  userStore.logout()
})

/**
 * Redirects to log in if email or token props are missing.
 */
if (props.emailMissing || props.tokenMissing) {
  router.replace('/login');
}

const formData = reactive({
  password: '',
  confirmPassword: '',
  hCaptchaToken: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const status = reactive({
  loading: userStore.isLoading,
  error: false,
  errorMessage: ''
})

/**
 * Validation rules for the password and confirmation fields.
 * Includes length, character requirements, and matching.
 */
const rules = computed(() => {
  return {
    password: {
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
      sameAsPassword: helpers.withMessage('Passordene må være like', sameAs(formData.password))
    }
  }
})

const v$ = useVuelidate(rules, formData)

/**
 * Returns the first validation error message for a given field.
 * 
 * @param {import('@vuelidate/core').Validation} field
 * @returns {string}
 */
const getErrorMessage = (field) => {
  if (!field.$errors || field.$errors.length === 0) return '';
  return field.$errors[0].$message;
}

/**
 * Initializes hCaptcha rendering and token callbacks on mount.
 */
onMounted(() => {
  window.hcaptchaCallback = (token) => {
    formData.hCaptchaToken = token
  }

  window.hcaptchaReset = () => {
    formData.hCaptchaToken = ''
  }

  const renderCaptcha = () => {
    if (window.hcaptcha) {
      window.hcaptcha.render(document.querySelector('.h-captcha'), {
        sitekey: '739ed064-cf88-460a-8a86-4906b3243888',
        callback: window.hcaptchaCallback,
        'expired-callback': window.hcaptchaReset,
        'error-callback': window.hcaptchaReset
      });
    } else {
      setTimeout(renderCaptcha, 300);
    }
  }

  renderCaptcha();
});

/**
 * Validates the form and submits the admin registration request.
 * Handles hCaptcha verification, error feedback, and redirect on success.
 */
const onSubmit = async () => {
  const result = await v$.value.$validate()

  if (!result) {
    return
  }

  if (!formData.hCaptchaToken) {
    status.error = true
    status.errorMessage = 'Vennligst bekreft at du ikke er en robot.'
    return
  }

  status.loading = true
  status.error = false

  try {
    const userData = {
      token: props.token,
      password: formData.password
    }

    const success = await userStore.registerAdmin(userData)

    if (userStore.error) {
      status.error = true
      status.errorMessage = userStore.error
    } else if (success) {
      router.push('/login')
    }
  } catch (error) {
    status.error = true
    status.errorMessage = error.message || 'Det oppstod en feil under registrering. Vennligst prøv igjen.'
  } finally {
    status.loading = false
  }
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-white p-4">
    <div class="w-full max-w-md">
      <h1 class="text-3xl font-bold text-center mb-6">Opprett administratorkonto</h1>

      <div v-if="status.loading" class="p-3 rounded bg-gray-200 text-blue-900 mb-4 text-center">
        Oppretter konto...
      </div>

      <div v-if="status.error" class="p-3 rounded bg-red-100 text-red-700 mb-4 text-center">
        {{ status.errorMessage }}
      </div>

      <form @submit.prevent="onSubmit" class="space-y-6">
        <div class="flex flex-col">
          <label for="email" class="text-base font-medium mb-2">
            E-post
          </label>
          <Input
            id="email"
            type="email"
            :modelValue="props.email"
            class="bg-gray-100"
            readonly
          />
        </div>

        <!-- Password Input -->
        <div class="flex flex-col">
          <label for="password" class="text-base font-medium mb-2 flex">
            Passord<span class="text-red-500 ml-0.5">*</span>
          </label>
          <div class="relative flex items-center">
            <div class="absolute left-3 text-gray-400 pointer-events-none">
              <KeySquare class="w-5 h-5" />
            </div>
            <Input
              id="password"
              v-model="v$.password.$model"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Lag et passord"
              class="pl-10"
              :class="{'border-red-500': v$.password.$error}"
              @input="v$.password.$touch()"
              @blur="v$.password.$touch()"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 bg-transparent border-none cursor-pointer text-gray-500"
            >
              <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
            </button>
          </div>
          <div v-if="v$.password.$error" class="text-red-500 text-xs mt-1">
            {{ getErrorMessage(v$.password) }}
          </div>
          <PasswordRequirementsList
          :password="formData.password"
          :validator="v$.password"
          />
        </div>

        <!-- Confirm Password Input -->
        <div class="flex flex-col">
          <label for="confirmPassword" class="text-base font-medium mb-2 flex">
            Bekreft Passord<span class="text-red-500 ml-0.5">*</span>
          </label>
          <div class="relative flex items-center">
            <div class="absolute left-3 text-gray-400 pointer-events-none">
              <KeySquare class="w-5 h-5" />
            </div>
            <Input
              id="confirmPassword"
              v-model="v$.confirmPassword.$model"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Skriv passordet igjen"
              class="pl-10"
              :class="{'border-red-500': v$.confirmPassword.$error}"
              @input="v$.confirmPassword.$touch()"
              @blur="v$.confirmPassword.$touch()"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-3 bg-transparent border-none cursor-pointer text-gray-500"
            >
            <component :is="showConfirmPassword ? EyeOff : Eye" class="w-5 h-5" />
            </button>
          </div>
          <div v-if="v$.confirmPassword.$error" class="text-red-500 text-xs mt-1">
            {{ getErrorMessage(v$.confirmPassword) }}
          </div>
        </div>

        <div class="h-captcha mb-6"></div>

        <Button
          type="submit"
          class="w-full bg-black text-white"
          :disabled="v$.$invalid || status.loading"
        >
          {{ status.loading ? 'Oppretter konto...' : 'Opprett konto' }}
        </Button>
      </form>
    </div>
  </div>
</template>
