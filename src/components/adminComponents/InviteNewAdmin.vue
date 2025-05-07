<script setup>
import { ref, computed, reactive } from 'vue';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useVuelidate } from '@vuelidate/core';
import { required, email, helpers } from '@vuelidate/validators';
import { Mail, User } from 'lucide-vue-next';

const formData = reactive({
  email: '',
  fullName: ''
});

const isSubmitting = ref(false);
const errorMessage = ref('');

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
    }
  }
});

const v$ = useVuelidate(rules, formData);

const getErrorMessage = (field) => {
  if (!field.$errors || field.$errors.length === 0) return '';
  return field.$errors[0].$message;
};

/**
 * Validates and submits the form data to invite a new admin
 */
const submitForm = async () => {
  const result = await v$.value.$validate();

  if (!result) {
    console.log('Validation errors:', v$.value.$errors);
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    emit('invite-admin', {
      email: formData.email,
      fullName: formData.fullName
    });

    formData.email = '';
    formData.fullName = '';

    v$.value.$reset();
  } catch (error) {
    errorMessage.value = 'Det oppstod en feil ved sending av invitasjon';
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};

const emit = defineEmits(['invite-admin']);
</script>

<template>
  <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100 max-w-md">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Invitere Admin</h2>

    <form @submit.prevent="submitForm" class="space-y-4">
      <!-- Email Input -->
      <div class="space-y-2">
        <label for="email" class="block text-sm font-medium text-gray-700 flex">
          E-postadresse<span class="text-red-500 ml-0.5">*</span>
        </label>
        <div class="relative flex items-center">
          <div class="absolute left-3 text-gray-400 pointer-events-none">
            <Mail class="w-5 h-5" />
          </div>
          <Input
            id="email"
            v-model="v$.email.$model"
            type="email"
            placeholder="admin@krisefisker.no"
            class="w-full pl-10"
            :class="{'border-red-500': v$.email.$error}"
            @input="v$.email.$touch()"
            @blur="v$.email.$touch()"
          />
        </div>
        <div v-if="v$.email.$error" class="text-red-500 text-xs mt-1">
          {{ getErrorMessage(v$.email) }}
        </div>
      </div>

      <!-- Full Name Input -->
      <div class="space-y-2">
        <label for="fullName" class="block text-sm font-medium text-gray-700 flex">
          Fullt navn<span class="text-red-500 ml-0.5">*</span>
        </label>
        <div class="relative flex items-center">
          <div class="absolute left-3 text-gray-400 pointer-events-none">
            <User class="w-5 h-5" />
          </div>
          <Input
            id="fullName"
            v-model="v$.fullName.$model"
            type="text"
            placeholder="Fullt navn"
            class="w-full pl-10"
            :class="{'border-red-500': v$.fullName.$error}"
            @input="v$.fullName.$touch()"
            @blur="v$.fullName.$touch()"
          />
        </div>
        <div v-if="v$.fullName.$error" class="text-red-500 text-xs mt-1">
          {{ getErrorMessage(v$.fullName) }}
        </div>
      </div>

      <!-- Error Message Display -->
      <div v-if="errorMessage" class="text-red-600 text-sm">
        {{ errorMessage }}
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <Button
          type="submit"
          class="bg-gray-800 hover:bg-gray-700 text-white"
          :disabled="v$.$invalid || isSubmitting"
        >
          {{ isSubmitting ? 'Sender...' : 'Send invitasjon' }}
        </Button>
      </div>
    </form>
  </div>
</template>
