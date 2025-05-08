<script setup>
import { useRouter } from 'vue-router'

/**
 * Component props.
 * @property {number} currentStep - The index of the currently active step.
 */
const props = defineProps({
  currentStep: {
    type: Number,
    required: true,
  },
})

/** Vue Router instance for programmatic navigation */
const router = useRouter()

/**
 * Array of route paths corresponding to each step.
 * @type {string[]}
 */
const steps = [
  '/prepare-crisis', 
  '/scenarios', 
  '/quiz', 
]

/**
 * Navigates to the route corresponding to the selected step index.
 * @param {number} index - The index of the step to navigate to.
 */
const navigateTo = (index) => {
  router.push(steps[index])
}
</script>

<template>
    <div class="mt-10 flex items-center justify-center space-x-10 text-sm">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="flex flex-col items-center space-y-1 cursor-pointer"
        :class="index === currentStep ? '' : 'opacity-50 hover:opacity-100 transition transform hover:scale-110'"
        @click="navigateTo(index)"
      >
        <div
          :class="index === currentStep
            ? 'w-5 h-5 rounded-full bg-[#2c3e50]'
            : 'w-5 h-5 rounded-full border-2 border-gray-400'"
        ></div>
        <span :class="index === currentStep ? 'font-semibold' : ''">{{ index + 1 }}</span>
      </div>
    </div>
  </template>