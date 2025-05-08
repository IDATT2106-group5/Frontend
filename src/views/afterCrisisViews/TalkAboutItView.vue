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
        <h1 class="text-3xl font-bold text-gray-900">Snakk om det</h1>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             class="lucide lucide-message-circle text-[#2c3e50]">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
      </div>

      <p class="text-gray-700 mb-8">
        Del erfaringer med andre og snakk om det som har skjedd
      </p>

      <!-- Sections -->
      <div class="space-y-10 text-gray-900 text-base leading-relaxed">

        <div>
          <p class="font-semibold text-lg mb-2">Hvorfor er det viktig å snakke om krisen?</p>
          <ul class="list-disc list-inside text-gray-800 space-y-1">
            <li>Bearbeide følelser og tanker</li>
            <li>Redusere følelsen av isolasjon og ensomhet</li>
            <li>Få perspektiv på hendelsen og forstå dine egne reaksjoner</li>
            <li>Få støtte og råd fra andre som har opplevd lignende situasjoner</li>
          </ul>
        </div>

        <div>
          <p class="font-semibold text-lg mb-2">Hvordan snakke med ulike grupper</p>
          <p class="font-semibold mb-1">Med barn og unge:</p>
          <ul class="list-disc list-inside text-gray-800 space-y-1">
            <li>Bruk enkelt språk som de forstår</li>
            <li>Vær ærlig, men betryggende – fokuser på sikkerhet</li>
            <li>Følg barnets initiativ og svar på spørsmål de har</li>
            <li>Bekreft at deres følelser er normale og akseptable</li>
          </ul>

          <p class="font-semibold mt-4 mb-1">Med voksne og eldre:</p>
          <ul class="list-disc list-inside text-gray-800 space-y-1">
            <li>Lytt mer enn du snakker – gi rom for at de får uttrykke seg</li>
            <li>Unngå å bagatellisere eller overse deres bekymringer</li>
            <li>Fokuser på praktisk støtte og konkrete løsninger</li>
            <li>Respekter deres behov for privatliv og tid til å bearbeide</li>
          </ul>
        </div>

        <div>
          <p class="font-semibold text-lg mb-2">Ressurser for samtale og støtte:</p>
          <p class="text-gray-800">
            Lokale helsetjenester, fastlege, kommunal psykisk helsetjeneste og
            Mental Helse hjelpetelefon: 116 123 (døgnåpent)
          </p>
        </div>
      </div>
    </div>

    <!-- Step indicator and back -->
    <div class="mt-16 w-full flex flex-col items-center gap-4">
      <AfterStepIndicator :currentStep="0" />
      <button
        @click="goToOverview"
        class="flex items-center gap-2 text-[#2c3e50] hover:underline text-sm"
      >
        <span class="text-xl">←</span> Oversikt
      </button>
    </div>
  </section>
</template>