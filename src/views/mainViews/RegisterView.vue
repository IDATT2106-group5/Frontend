<template>
  <div class="form-container">
    <div class="form-wrapper">
      <h1 class="form-title">Opprett Bruker</h1>

      <form @submit.prevent="onSubmit">
        <div class="form-grid">
          <!-- Email Input -->
          <div class="form-group">
            <label for="email" class="form-label">
              E-mail<span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <div class="input-icon">
                <Mail class="icon" />
              </div>
              <Input
                id="email"
                v-model="v$.email.$model"
                type="email"
                placeholder="E-post"
                class="input-with-icon"
                :class="{'input-error': v$.email.$error}"
              />
            </div>
            <div v-if="v$.email.$error" class="error-message">
              {{ v$.email.$errors[0].$message }}
            </div>
          </div>

          <!-- Name Input -->
          <div class="form-group">
            <label for="name" class="form-label">
              Navn<span class="required">*</span>
            </label>
            <Input
              id="name"
              v-model="v$.name.$model"
              type="text"
              placeholder="Fornavn Etternavn"
              :class="{'input-error': v$.name.$error}"
            />
            <div v-if="v$.name.$error" class="error-message">
              {{ v$.name.$errors[0].$message }}
            </div>
          </div>

          <!-- Password Input -->
          <div class="form-group">
            <label for="password" class="form-label">
              Passord<span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <div class="input-icon">
                <KeySquare class="icon" />
              </div>
              <Input
                id="password"
                v-model="v$.password.$model"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Laget passord"
                class="input-with-icon"
                :class="{'input-error': v$.password.$error}"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
              >
                <component :is="showPassword ? 'EyeOff' : 'Eye'" class="icon" />
              </button>
            </div>
            <div v-if="v$.password.$error" class="error-message">
              {{ v$.password.$errors[0].$message }}
            </div>
          </div>

          <!-- Phone Number Input -->
          <div class="form-group">
            <label for="phone" class="form-label">Telefon nummer</label>
            <Input
              id="phone"
              v-model="v$.phone.$model"
              v-mask="'+## ### ## ###'"
              placeholder="+47 123 45 678"
              @blur="v$.phone.$touch()"
              :class="{'input-error': v$.phone.$error}"
            />
            <div v-if="v$.phone.$error" class="error-message">
              {{ v$.phone.$errors[0].$message }}
            </div>
          </div>

          <!-- Confirm Password Input -->
          <div class="form-group">
            <label for="confirmPassword" class="form-label">
              Bekreft Passord<span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <div class="input-icon">
                <KeySquare class="icon" />
              </div>
              <Input
                id="confirmPassword"
                v-model="v$.confirmPassword.$model"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Skriv passordet igjen"
                class="input-with-icon"
                :class="{'input-error': v$.confirmPassword.$error}"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="password-toggle"
              >
                <component :is="showConfirmPassword ? 'EyeOff' : 'Eye'" class="icon" />
              </button>
            </div>
            <div v-if="v$.confirmPassword.$error" class="error-message">
              {{ v$.confirmPassword.$errors[0].$message }}
            </div>
          </div>

          <!-- Address Input -->
          <div class="form-group">
            <label for="address" class="form-label">Adresse</label>
            <Input
              id="address"
              v-model="v$.address.$model"
              type="text"
              placeholder="Høgskoleringen 1, 7053"
              :class="{'input-error': v$.address.$error}"
            />
            <div v-if="v$.address.$error" class="error-message">
              {{ v$.address.$errors[0].$message }}
            </div>
          </div>
        </div>

        <!-- Newsletter & Privacy Policy -->
        <div class="checkbox-section">
          <div class="checkbox-container">
            <input
              id="newsletter"
              v-model="formData.newsletter"
              type="checkbox"
              class="checkbox"
            />
            <label for="newsletter" class="checkbox-label">
              Jeg ønsker å motta nyhetsbrev og annen relevant informasjon på e-post.
            </label>
          </div>

          <div class="checkbox-container">
            <input
              id="privacy"
              v-model="v$.privacyPolicy.$model"
              type="checkbox"
              class="checkbox"
            />
            <label for="privacy" class="checkbox-label">
              Jeg har lest og godtar <a href="#" class="link">personvernerklæringen</a>.
            </label>
          </div>
          <div v-if="v$.privacyPolicy.$error" class="error-message">
            {{ v$.privacyPolicy.$errors[0].$message }}
          </div>
        </div>

        <!-- Register Button -->
        <button type="submit" class="register-button">Registrer</button>

        <!-- Login Link -->
        <div class="login-link">
          <p>
            Har du en konto?
            <a href="#" class="link">Logg inn</a>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Input } from '@/components/ui/input'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, sameAs, helpers } from '@vuelidate/validators'
import { Mail, KeySquare} from 'lucide-vue-next'

// Form data
const formData = reactive({
  email: '',
  name: '',
  password: '',
  confirmPassword: '',
  phone: '',
  address: '',
  newsletter: false,
  privacyPolicy: false
})

// Password visibility toggles
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Validation rules
const rules = computed(() => {
  return {
    email: {
      required: helpers.withMessage('E-post er påkrevd', required),
      email: helpers.withMessage('Vennligst oppgi en gyldig e-postadresse', email)
    },
    name: {
      required: helpers.withMessage('Navn er påkrevd', required)
    },
    password: {
      required: helpers.withMessage('Passord er påkrevd', required),
      minLength: helpers.withMessage('Passordet må være minst 8 tegn', minLength(8))
    },
    confirmPassword: {
      required: helpers.withMessage('Passord er påkrevd', required),
      sameAsPassword: helpers.withMessage('Passordene må være like', sameAs(formData.password))
    },
    phone: {
      phoneFormat: helpers.withMessage(
        'Ugyldig telefonnummer',
        helpers.regex('phoneFormat', /^\+?\d[\d\s]*$/)
      )
    },
    address: {
      // Optional field
    },
    privacyPolicy: {
      isChecked: helpers.withMessage('Du må godta personvernerklæringen', (value) => value === true)
    },
    captchaChecked: {
      isChecked: helpers.withMessage('Vennligst bekreft at du ikke er en robot', (value) => value === true)
    }
  }
})

const v$ = useVuelidate(rules, { ...formData })

// Form submission handler
const onSubmit = async () => {
  const result = await v$.value.$validate()

  if (result) {
    // Form is valid, handle submission
    console.log('Form submitted:', formData)
    // Here you would typically send the data to your API
    alert('Registrering vellykket!')
  } else {
    // Form has validation errors
    console.log('Validation errors:', v$.value.$errors)
  }
}
</script>

<style scoped>
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #ffffff;
  padding: 1rem;
}

.form-wrapper {
  width: 100%;
  max-width: 36rem;
}

.form-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

.form-label {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: flex;
}

.required {
  color: #ef4444;
  margin-left: 0.125rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  color: #9ca3af;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.input-with-icon {
  padding-left: 2.5rem !important;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.input-error {
  border-color: #ef4444 !important;
}

.checkbox-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
}

.checkbox {
  width: 1rem;
  height: 1rem;
  margin-top: 0.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
}

.checkbox-label {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.link {
  color: #2563eb;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.register-button {
  width: 100%;
  background-color: #1e3a5f;
  color: white;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 1rem;
}

.register-button:hover {
  background-color: #152f4f;
}

.login-link {
  text-align: center;
  font-size: 0.875rem;
  color: #4b5563;
}
</style>
