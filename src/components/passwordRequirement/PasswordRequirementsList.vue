<script setup>
import { defineProps } from 'vue';
import PasswordRequirementCheck from './PasswordRequirementCheck.vue';

defineProps({
  password: {
    type: String,
    required: true
  },
  validator: {
    type: Object,
    required: true
  },
  requirements: {
    type: Array,
    default: () => [
      { validator: 'minLength', text: 'Minst 8 tegn' },
      { validator: 'containsUppercase', text: 'Minst én stor bokstav' },
      { validator: 'containsLowercase', text: 'Minst én liten bokstav' },
      { validator: 'containsNumber', text: 'Minst ett tall' },
      { validator: 'containsSpecial', text: 'Minst ett spesialtegn (f.eks. !@#$%^&*)' }
    ]
  }
});
</script>

<template>
  <div class="mt-3 mb-1">
    <p class="text-sm font-medium text-gray-700 mb-2">Passordet må inneholde:</p>
    <ul class="space-y-2 pl-1">
      <PasswordRequirementCheck
        v-for="(requirement, index) in requirements"
        :key="index"
        :isPassing="password && !validator.$errors.some(e => e.$validator === requirement.validator)"
        :text="requirement.text"
      />
    </ul>
  </div>
</template>
