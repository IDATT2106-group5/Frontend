<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Input } from '@/components/ui/input'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, sameAs, helpers } from '@vuelidate/validators'
import { Mail, KeySquare, Eye, EyeOff } from 'lucide-vue-next'
import { useUserStore } from '@/stores/UserStore'

const router = useRouter()
const userStore = useUserStore()

const formData = reactive({
  email: '',
  fullName: '',
  password: '',
  confirmPassword: '',
  tlf: '',
  privacyPolicy: false
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const status = reactive({
  loading: false,
  success: false,
  error: false,
  errorMessage: ''
})

const rules = computed(() => {
  return {
    email: {
      required: helpers.withMessage('E-post er påkrevd', required),
      email: helpers.withMessage('Vennligst oppgi en gyldig e-postadresse', email)
    },
    fullName: {
      required: helpers.withMessage('Navn er påkrevd', required),
      onlyLetters: helpers.withMessage(
      'Navnet kan kun inneholde bokstaver og mellomrom',
      (value) => /^[A-Za-zÆØÅæøå\s]+$/.test(value)
    )
    },
    password: {
      required: helpers.withMessage('Passord er påkrevd', required),
      minLength: helpers.withMessage('Passordet må være minst 8 tegn', minLength(8))
    },
    confirmPassword: {
      required: helpers.withMessage('Bekreft passord er påkrevd', required),
      sameAsPassword: helpers.withMessage('Passordene må være like', sameAs(formData.password))
    },
    tlf: {
      tlfFormat: helpers.withMessage(
        'Telefonnummer må være 8 siffer',
        (value) => !value || value.replace(/\s/g, '').length === 8
      )
    },
    privacyPolicy: {
      isChecked: helpers.withMessage('Du må godta personvernerklæringen', (value) => value === true)
    }
  }
})

const v$ = useVuelidate(rules, formData)

const getErrorMessage = (field) => {
  if (!field.$errors || field.$errors.length === 0) return '';
  return field.$errors[0].$message;
}

const onSubmit = async () => {
  const result = await v$.value.$validate()

  if (!result) {
    console.log('Validation errors:', v$.value.$errors)
    return
  }
  
  status.loading = true
  status.error = false
  status.success = false
  
  try {
    const userData = {
      email: formData.email,
      fullName: formData.fullName,
      password: formData.password,
      tlf: formData.tlf ? formData.tlf.replace(/\s/g, '') : ''
    }

    const success = await userStore.register(userData)
    
    if (userStore.error) {
      status.error = true
      status.errorMessage = userStore.error
    } else if (success) {
      router.push('/verify-email')
    }
  } catch (error) {
    status.error = true
    status.errorMessage = error.message || 'Det oppstod en feil under registrering. Vennligst prøv igjen.'
    console.error('Registration error:', error)
  } finally {
    status.loading = false
  }
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-white p-4">
    <div class="w-full max-w-2xl">
      <h1 class="text-4xl font-bold text-center mb-8">Opprett Bruker</h1>

      <div v-if="status.loading" class="p-3 rounded bg-gray-200 text-blue-900 mb-4 text-center">
        Registrerer bruker...
      </div>
      
      <div v-if="status.success" class="p-3 rounded bg-green-100 text-green-800 mb-4 text-center">
        Registrering vellykket! Omdirigerer til innlogging...
      </div>
      
      <div v-if="status.error" class="p-3 rounded bg-red-100 text-red-700 mb-4 text-center">
        {{ status.errorMessage }}
      </div>

      <form @submit.prevent="onSubmit">
        <div class="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
          <!-- Email Input -->
          <div class="flex flex-col mb-6">
            <label for="email" class="text-base font-medium mb-2 flex">
              E-mail<span class="text-red-500 ml-0.5">*</span>
            </label>
            <div class="relative flex items-center">
              <div class="absolute left-3 text-gray-400 pointer-events-none">
                <Mail class="w-5 h-5" />
              </div>
              <Input
                id="email"
                v-model="v$.email.$model"
                type="email"
                placeholder="E-post"
                class="pl-10"
                :class="{'border-red-500': v$.email.$error}"
                @input="v$.email.$touch()"
                @blur="v$.email.$touch()"
              />
            </div>
            <div v-if="v$.email.$error" class="text-red-500 text-xs mt-1">
              {{ getErrorMessage(v$.email) }}
            </div>
          </div>

          <!-- Name Input -->
          <div class="flex flex-col mb-6">
            <label for="fullName" class="text-base font-medium mb-2 flex">
              Navn<span class="text-red-500 ml-0.5">*</span>
            </label>
            <Input
              id="fullName"
              v-model="v$.fullName.$model"
              type="text"
              placeholder="Fornavn Etternavn"
              :class="{'border-red-500': v$.fullName.$error}"
              @input="v$.fullName.$touch()"
              @blur="v$.fullName.$touch()"
            />
            <div v-if="v$.fullName.$error" class="text-red-500 text-xs mt-1">
              {{ getErrorMessage(v$.fullName) }}
            </div>
          </div>

          <!-- Password Input -->
          <div class="flex flex-col mb-6">
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
                placeholder="Laget passord"
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
          </div>

          <!-- Phone Number Input -->
          <div class="flex flex-col mb-6">
            <label for="tlf" class="text-base font-medium mb-2">Telefon nummer</label>
            <Input
              id="tlf"
              v-model="v$.tlf.$model"
              v-mask="'### ## ###'"
              placeholder="123 45 678"
              @input="v$.tlf.$touch()"
              @blur="v$.tlf.$touch()"
              :class="{'border-red-500': v$.tlf.$error}"
            />
            <div v-if="v$.tlf.$error" class="text-red-500 text-xs mt-1">
              {{ getErrorMessage(v$.tlf) }}
            </div>
          </div>

          <!-- Confirm Password Input -->
          <div class="flex flex-col mb-6">
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
        </div>

        <div class="flex flex-col gap-4 mb-6">
         
          <div class="flex items-start">
            <input
              id="privacy"
              v-model="v$.privacyPolicy.$model"
              type="checkbox"
              class="w-4 h-4 mt-1 border border-gray-300 rounded"
              @change="v$.privacyPolicy.$touch()"
            />
            <label for="privacy" class="ml-2 text-sm text-gray-600">
              Jeg har lest og godtar <a href="#" class="text-blue-600 hover:underline">personvernerklæringen</a>.
            </label>
          </div>
          <div v-if="v$.privacyPolicy.$error" class="text-red-500 text-xs">
            {{ getErrorMessage(v$.privacyPolicy) }}
          </div>
        </div>

        <!-- Register Button -->
        <button 
          type="submit" 
          class="w-full bg-blue-900 hover:bg-blue-950 text-white font-medium py-3 px-4 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mb-4" 
          :disabled="v$.$invalid || status.loading"
        >
          {{ status.loading ? 'Registrerer...' : 'Registrer' }}
        </button>

        <!-- Login Link -->
        <div class="text-center text-sm text-gray-600">
          <p>
            Har du en konto?
            <router-link to="/login" class="text-blue-600 hover:underline">Logg inn</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>