<script setup>
import { Check, X } from "lucide-vue-next";

defineProps({
  isPassing: {
    type: Boolean,
    required: true
  },
  text: {
    type: String,
    default: ""
  }
});
</script>

<template>
  <li class="flex items-center text-sm" :class="{
    'text-green-600': isPassing,
    'text-gray-600': !isPassing
  }">
    <span class="inline-block mr-2.5">
      <Check v-if="isPassing" class="w-4 h-4 text-green-600" />
      <X v-else class="w-4 h-4 text-gray-400" />
    </span>
    <slot>{{ text }}</slot>
  </li>
</template>
