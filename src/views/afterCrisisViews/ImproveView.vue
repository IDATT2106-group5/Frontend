<script setup>
import { useRouter } from 'vue-router'
import AfterStepIndicator from '@/components/AfterStepIndicator.vue'

/** Vue Router instance for navigation */
const router = useRouter()

/**
 * Navigates to the "After Crisis" overview route at `/after`.
 * Typically triggered by clicking the "Oversikt" button below the step indicator.
 *
 * @returns {void}
 */
const goToOverview = () => {
  router.push('/after')
}
</script>

<template>
  <section class="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-16">
    <div class="max-w-3xl w-full">
      <!-- Title -->
      <div class="flex items-center gap-3 mb-2">
        <h1 class="text-3xl font-bold text-gray-900">Lær og forbedre</h1>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             class="lucide lucide-lightbulb text-[#2c3e50]">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
          <path d="M9 18h6"/>
          <path d="M10 22h4"/>
        </svg>
      </div>

      <p class="text-gray-700 mb-8">
        Evaluer beredskapen og gjør nødvendige endringer
      </p>

      <!-- Sections -->
      <div class="space-y-10 text-gray-900 text-base leading-relaxed">

        <div>
          <p class="font-semibold text-lg mb-2">Evaluering av egen beredskap</p>
          <p class="text-gray-800 mb-2">Etter en krise er det viktig å reflektere over egen beredskap:</p>
          <ul class="list-disc list-inside text-gray-800 space-y-1">
            <li>Hva fungerte godt i beredskapsforberedelsene?</li>
            <li>Hva var mangelfullt eller kunne vært bedre?</li>
            <li>Var all nødvendig informasjon tilgjengelig?</li>
            <li>Hadde alle i husstanden kunnskap om hva de skulle gjøre?</li>
          </ul>
        </div>

        <div>
          <p class="font-semibold text-lg mb-2">Læring fra tidligere kriser</p>
          <ul class="list-disc list-inside text-gray-800 space-y-1">
            <li>Historisk erfaring viser at mennesker som lærer fra tidligere kriser er mer motstandsdyktige mot fremtidige hendelser</li>
            <li>Kriser kan bidra til økt samfunnsengasjement og fellesskapsfølelse</li>
            <li>Del dine erfaringer med andre for å bygge kollektiv kunnskap</li>
          </ul>
        </div>

        <div>
          <p class="font-semibold text-lg mb-2">Hva kan du gjøre for å øke kunnskapen din?</p>
          <ul class="list-disc list-inside text-gray-800 space-y-1">
            <li>Les om ulike kriser</li>
            <li>Lær om lokale risikoer</li>
            <li>Delta på kurs</li>
            <li>Øv på ulike scenarioer</li>
            <li>Utvid beredskapen</li>
            <li>Del kunnskapen</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Step indicator and back -->
    <div class="mt-16 w-full flex flex-col items-center gap-4">
      <AfterStepIndicator :currentStep="2" />
      <button
        @click="goToOverview"
        class="flex items-center gap-2 text-[#2c3e50] hover:underline text-sm"
      >
        <span class="text-xl">←</span> Oversikt
      </button>
    </div>
  </section>
</template>