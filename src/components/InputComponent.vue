<template>
  <div :class="['inputfield', { 'position-relative': isPassword, 'focused': isFocused, 'input-invalid': !isValid }]">
    <input class="input"
           :type="currentType"
           :id="fieldId"
           :placeholder="placeholder"
           :value="modelValue"
           @input="handleInput"
           @focus="handleFocus"
           @blur="handleBlur">

    <span v-if="isPassword"
          class="toggle-password material-icons"
          @click="toggleVisibility">
      {{ showPassword ? 'visibility_off' : 'visibility' }}
    </span>
    <!-- Display validation error message only if the field has been touched and is invalid -->
    <div v-if="fieldTouched && !isValid && validationMessage" class="error-message">{{ validationMessage }}</div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const emit = defineEmits(['update:modelValue', 'update:isValid']);

/**
* The props for the InputFieldComponent.
*/
const props = defineProps({
  modelValue: String,
  fieldId: String,
  placeholder: String,
  isPassword: Boolean,
  isValid: Boolean,
  validationRules: {
    type: Object,
    default: () => ({})
  }
});

const showPassword = ref(false);
const currentType = ref(props.isPassword ? 'password' : 'text');
const isFocused = ref(false);
const validationMessage = ref('');
const fieldTouched = ref(false); // Tracks if the field has been touched

/**
* Toggles the visibility of the password.
*/
const toggleVisibility = () => {
  showPassword.value = !showPassword.value;
  currentType.value = showPassword.value ? 'text' : 'password';
};

/**
* Handles the focus event.
*/
const handleFocus = () => {
  isFocused.value = true;
};

/**
* Handles the blur event.
*/
const handleBlur = () => {
  isFocused.value = false;
  fieldTouched.value = true;
  validateField();
};

/**
* Handles the input event.
* @param {Event} event The input event.
*/
const handleInput = (event) => {
const value = event.target.value;
emit('update:modelValue', value);
validateField();
};

/**
* Validates the field based on the validation rules.
*/
const validateField = () => {
  let valid = true;
  validationMessage.value = '';
  for (const rule of Object.values(props.validationRules)) {
    if (!rule.validator(props.modelValue)) {
      valid = false;
      validationMessage.value = rule.message;
      break;
    }
  }
emit('update:isValid', valid);
};

/**
* Watches the model value and validates the field when the model value changes.
*/
watch(() => props.modelValue, validateField);

/**
* Validates the field when the component is mounted.
*/
onMounted(() => {
validateField(props.modelValue);
});
</script>
