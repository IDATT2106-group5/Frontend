<template>
  <div class="form-container">
    <form @submit.prevent="submitForm" novalidate>
      <!-- E-post -->
      <div class="full-width">
        <label for="email">E-post</label>
        <input
          v-model="form.email"
          type="email"
          id="email"
          placeholder="E-post"
        />
        <span v-if="v$.form.email.$errors">
          {{ v$.form.email.$silentErrors[0]?.$message }}
        </span>
      </div>

      <!-- Navn -->
      <div class="full-width">
        <label for="name">Navn</label>
        <input
          v-model="form.name"
          type="text"
          id="name"
          placeholder="Fornavn Etternavn"
        />
        <span v-if="v$.form.name.$errors">
          {{ v$.form.name.$silentErrors[0]?.$message }}
        </span>
      </div>

      <!-- Passord -->
      <div>
        <label for="password">Passord</label>
        <input
          v-model="form.password"
          type="password"
          id="password"
          placeholder="Lag et passord"
        />
        <span v-if="v$.form.password.$errors">
          {{ v$.form.password.$silentErrors[0]?.$message }}
        </span>
      </div>

      <!-- Bekreft passord -->
      <div>
        <label for="confirm-password">Bekreft passord</label>
        <input
          v-model="form.confirmPassword"
          type="password"
          id="confirm-password"
          placeholder="Skriv passordet igjen"
        />
        <span v-if="v$.form.confirmPassword.$errors">
          {{ v$.form.confirmPassword.$silentErrors[0]?.$message }}
        </span>
      </div>

      <!-- Telefonnummer -->
      <div>
        <label for="phone">Telefonnummer</label>
        <input
          v-model="form.phone"
          type="tel"
          id="phone"
          placeholder="123456789"
        />
        <span v-if="v$.form.phone.$errors">
          {{ v$.form.phone.$silentErrors[0]?.$message }}
        </span>
      </div>

      <!-- Checkboxes -->
      <div class="full-width checkbox-container">
        <input v-model="form.captcha" type="checkbox" id="captcha" />
        <label for="captcha">Jeg er ikke en robot</label>
      </div>

      <div class="full-width checkbox-container">
        <input v-model="form.newsletter" type="checkbox" id="newsletter" />
        <label for="newsletter">Jeg ønsker nyhetsbrev.</label>
      </div>

      <div class="full-width checkbox-container">
        <input v-model="form.privacy" type="checkbox" id="privacy" />
        <label for="privacy">Jeg godtar personvernekæringen.</label>
      </div>

      <!-- Submit Button -->
      <button type="submit">Registrer</button>
    </form>
  </div>
</template>

<script>
import useVuelidate from '@vuelidate/core';
import { required, email, minLength, sameAs, numeric } from '@vuelidate/validators';

export default {
  name: 'RegisterPage',
  data() {
    return {
      form: {
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
        phone: '',
        captcha: false,
        newsletter: false,
        privacy: false,
      },
    };
  },
  validations() {
    return {
      form: {
        email: { required, email },
        name: { required, minLength: minLength(3) },
        password: { required, minLength: minLength(6) },
        confirmPassword: {
          required,
          sameAs: sameAs(() => this.form.password),
        },
        phone: { numeric },
        captcha: { required },
        privacy: { required },
      },
    };
  },
  setup() {
    return { v$: useVuelidate() };
  },
  methods: {
    submitForm() {
      this.v$.$validate();
      if (this.v$.$error) {
        console.error('Validation Failed!');
      } else {
        console.log('Form Submitted:', this.form);
      }
    },
  },
};
</script>

<style scoped>
.form-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 600px;
  margin: auto;
}

.full-width {
  grid-column: span 2;
}

input,
button {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.error-message {
  color: red;
  font-size: 12px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  grid-column: span 2;
}

button {
  grid-column: span 2;
  background-color: #007BFF;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>

<style>

</style>
