<script setup>
import StaticPageCard from '@/components/StaticPageCard.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

/** Vue Router instance for programmatic navigation */
const router = useRouter()

/**
 * Navigates to the home page.
 *
 * @returns {void}
 */
const goToHome = () => router.push('/')

/**
 * Navigates to the contact page.
 *
 * @returns {void}
 */
const goToContact = () => router.push('/contact')

/**
 * Currently opened FAQ index in the accordion.
 * `null` means no item is open.
 * 
 * @type {import('vue').Ref<number|null>}
 */
const openIndex = ref(null)

/**
 * Toggles the open/close state of an FAQ item.
 *
 * @param {number} index - The index of the FAQ to toggle.
 * @returns {void}
 */
const toggle = (index) => {
  openIndex.value = openIndex.value === index ? null : index
}

/**
 * List of frequently asked questions with their answers.
 * 
 * @type {Array<{ question: string, answer: string }>}
 */
const faqs = [
  {
    question: 'Hvordan bør jeg starte med kriseberedskap hjemme?',
    answer: 'Start med å lage en oversikt over hva du allerede har, og skaff deg vann, mat, varme og kommunikasjon for minst tre døgn.',
  },
  {
    question: 'Hva betyr egentlig "vannforsyning for 3 dager"?',
    answer: 'Det betyr at du bør ha 9 liter vann per person tilgjengelig 3 liter per dag til drikke og matlaging.',
  },
  {
    question: 'Hvilket utstyr trenger jeg i et krisesett?',
    answer: 'Eksempler er lommelykt, batterier, førstehjelpsutstyr, radio, hermetikk, stormkjøkken og ekstra klær.',
  },
  {
    question: 'Hvordan snakker jeg med barna om kriser?',
    answer: 'Vær ærlig og bruk enkelt språk. Gi trygghet ved å forklare at dere har en plan og er forberedt.',
  },
]
</script>

<template>
  <StaticPageCard>
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           class="lucide lucide-help-circle">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 1 1 2.91 4" />
        <line x1="12" x2="12.01" y1="17" y2="17" />
      </svg>
    </template>

    <template #title>Har du spørsmål?</template>

    <p>
      Lurer du på noe? Vi forstår at beredskap kan føles overveldende, derfor er vi her for å hjelpe deg.
    </p>

    <!-- FAQ Accordion -->
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-[#2c3e50]">Ofte stilte spørsmål</h2>
      <div v-for="(faq, index) in faqs" :key="index" class="border rounded-md">
        <button
          @click="toggle(index)"
          class="w-full flex justify-between items-center px-4 py-3 text-left text-[#2c3e50] font-medium hover:bg-gray-50"
        >
          {{ faq.question }}
          <svg :class="openIndex === index ? 'rotate-180' : ''" class="h-5 w-5 transform transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/>
          </svg>
        </button>
        <div v-if="openIndex === index" class="px-4 pb-4 text-gray-700">
          {{ faq.answer }}
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div>
      <h2 class="text-lg font-semibold text-[#2c3e50] mt-6">Finner du ikke svaret?</h2>
      <p class="mt-1">
        Du kan <button @click="goToContact" class="text-[#2c3e50] underline">kontakte oss her</button>, så hjelper vi deg gjerne.
      </p>
    </div>

    <template #footer>
      <button
        @click="goToHome"
        class="flex items-center gap-2 text-[#2c3e50] hover:underline text-sm"
      >
        <span class="text-xl">←</span> Hjem
      </button>
    </template>
  </StaticPageCard>
</template>