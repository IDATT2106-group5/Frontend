<script setup>
import { useRouter } from 'vue-router'
import UnderStepIndicator from '@/components/UnderStepIndicator.vue'

/** Vue Router instance for programmatic navigation */
const router = useRouter()

/**
 * Navigates to the overview page for the "Under krisen" step indicator.
 *
 * @returns {void}
 */
const goToOverview = () => {
  router.push('/under')
}
</script>

<template>
  <section class="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-16">
    <div class="max-w-3xl w-full">
      <!-- Title -->
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Søk trygghet</h1>
      <p class="text-gray-700 mb-8">
        I en krisesituasjon er det viktig å finne trygghet for deg selv og andre. Her er viktige råd for hvordan du kan sikre trygghet i forskjellige situasjoner.
      </p>

      <!-- Sections -->
      <div class="space-y-8 text-gray-900 text-base leading-relaxed">

        <div>
          <p class="font-semibold">Vurder situasjonen raskt</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>Observer og identifiser potensielle farer i omgivelsene</li>
            <li>Bevar roen og ta dype, rolige pust</li>
            <li>Vurder om du skal søke ly der du er eller evakuere</li>
          </ul>
        </div>

        <div>
          <p class="font-semibold">Søk trygghet innendørs</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>Lås dører og vinduer, trekk for gardiner</li>
            <li>Slå av gass og elektriske apparater ved behov</li>
            <li>Ved utslipp av farlige stoffer: Tett ventiler med teip og fuktige håndklær</li>
            <li>Finn et rom med minst mulig yttervegger/vinduer ved ekstremvær</li>
          </ul>
        </div>

        <div>
          <p class="font-semibold">Evakuering</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>Ha en ferdigpakket nødsekk klar med nødvendige eiendeler</li>
            <li>Slå av hovedstrøm, vann og gass før du forlater boligen</li>
            <li>Følg anvisninger fra nødetater og lokale myndigheter</li>
            <li>Ha forhåndsbestemte møtepunkter for familien om dere blir separert</li>
          </ul>
        </div>

        <div>
          <p class="font-semibold">Følg myndighetenes råd</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>Følg med på offisielle meldinger fra lokale myndigheter</li>
            <li>Bruk DAB-radio for oppdateringer hvis mobilnettet er nede</li>
            <li>Respekter evakueringsordrer og sikkerhetsadvarsler</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Step indicator and back -->
    <div class="mt-16 w-full flex flex-col items-center gap-4">
      <UnderStepIndicator :currentStep="0" />
      <button
        @click="goToOverview"
        class="flex items-center gap-2 text-[#2c3e50] hover:underline text-sm"
      >
        <span class="text-xl">←</span> Oversikt
      </button>
    </div>
  </section>
</template>