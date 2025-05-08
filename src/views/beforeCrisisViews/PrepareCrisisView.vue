<script setup>
import { useRouter } from 'vue-router'
import BeforeStepIndicator from '@/components/BeforeStepIndicator.vue'

/** Vue Router instance for navigation */
const router = useRouter()

/**
 * Navigates to the "Before Crisis" overview route at `/before`.
 * Typically triggered by clicking the "Oversikt" button.
 *
 * @returns {void}
 */
const goToOverview = () => {
  router.push('/before')
}
</script>

<template>
  <section class="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-16 relative">
    <div class="max-w-3xl w-full">
      <!-- Title -->
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Forbered deg på kriser</h1>
      <p class="text-gray-700 mb-8">
        Sørg for at du er godt forberedt hvis en krise oppstår. <br />
        Her er noen viktige tiltak du bør tenke på:
      </p>

      <ul class="space-y-6 text-gray-900 text-base leading-relaxed">
        <li>
          <p class="font-semibold">Ha et nødvannslag</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>Oppbevar minst 3 liter vann per person per dag</li>
          </ul>
        </li>
        <li>
          <p class="font-semibold">Lag et beredskapslager</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>Ha nok mat og andre nødvendige forsyninger for minst tre dager</li>
          </ul>
        </li>
        <li>
          <p class="font-semibold">Hold en radio klar</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>Ha en batteridrevet DAB-radio tilgjengelig</li>
          </ul>
        </li>
        <li>
          <p class="font-semibold">Sørg for alternativ strømforsyning</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>Ha en powerbank eller nødlader klar for mobiltelefoner og annet viktig utstyr</li>
          </ul>
        </li>
        <li>
          <p class="font-semibold">Varme og beskyttelse</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>Ha en sovepose, varmeteppe, klær tilpasset kaldt vær</li>
          </ul>
        </li>
        <li>
          <p class="font-semibold">Ha en ferdigpakket nødsekk</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>Inneholder nødvendige ting som lommelykt, batterier, førstehjelpsutstyr og kopier av viktige dokumenter</li>
          </ul>
        </li>
      </ul>

      <!-- DSB Button -->
      <div class="mt-10">
        <a
          href="https://www.dsb.no" target="_blank"
          class="inline-flex items-center px-6 py-3 border-2 border-[#2c3e50] text-[#2c3e50] rounded-lg hover:bg-[#2c3e50] hover:text-white transition"
        >
          ➝ Les mer tips av DSB
        </a>
      </div>
    </div>

    <!-- Emergency numbers box -->
    <div class="absolute top-20 right-4 bg-white border border-gray-200 rounded-lg shadow px-4 py-3 text-sm w-40 text-left">
      <p class="font-semibold text-gray-800 mb-2">Nødnummer</p>
      <ul class="space-y-1">
        <li><span class="text-red-600 font-semibold">110</span> Brann</li>
        <li><span class="text-blue-600 font-semibold">112</span> Politi</li>
        <li><span class="text-green-600 font-semibold">113</span> Ambulanse</li>
      </ul>
    </div>

    <!-- Internal step indicator and back link -->
    <div class="mt-16 w-full flex flex-col items-center gap-4">
      <BeforeStepIndicator :currentStep="0" />
      <button
        @click="goToOverview"
        class="flex items-center gap-2 text-[#2c3e50] hover:underline text-sm"
      >
        <span class="text-xl">←</span> Oversikt
      </button>
    </div>
  </section>
</template>