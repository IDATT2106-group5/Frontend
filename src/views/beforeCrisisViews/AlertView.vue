<script setup>
import { useRouter } from 'vue-router'
import UnderStepIndicator from '@/components/UnderStepIndicator.vue'

/** Vue Router instance for navigation */
const router = useRouter()

/**
 * Navigates to the "Under Crisis" overview route at `/under`.
 * Typically triggered by clicking the "Oversikt" button in the step indicator.
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
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Følg med på varsler</h1>
      <p class="text-gray-700 mb-8">
        Hold deg oppdatert på situasjonen gjennom pålitelige informasjonskilder. <br />
        Riktig informasjon til rett tid kan være avgjørende i en krisesituasjon.
      </p>

      <!-- Sections -->
      <div class="space-y-8 text-gray-900 text-base leading-relaxed">

        <div>
          <p class="font-semibold">Offisielle varselkanaler</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>NRK (radio og TV) – alltid oppdatert med offisiell informasjon</li>
            <li>DSB (Direktoratet for samfunnssikkerhet og beredskap)</li>
            <li>Din kommunes hjemmeside og sosiale mediekanaler</li>
            <li>Varsom.no (for naturfarevarsler)</li>
            <li>Yr.no (for værvarsler)</li>
          </ul>
        </div>

        <div>
          <p class="font-semibold">Skille mellom fakta og rykter</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>Stol på informasjon fra offisielle kilder fremfor rykter på sosiale medier</li>
            <li>Sjekk om informasjonen er bekreftet av flere uavhengige kilder</li>
            <li>Vær kritisk til ukjente kilder og sensasjonelle påstander</li>
            <li>Ikke spre ubekreftet informasjon videre – det kan skape unødig frykt</li>
          </ul>
        </div>

        <div>
          <p class="font-semibold">Når strøm og internett er nede</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>Bruk en batteridrevet DAB-radio (eller bilradio)</li>
            <li>Spar mobiltelefonbatteri – sett telefonen i flymodus og sjekk meldinger kun periodisk</li>
            <li>Bruk powerbank til å lade mobiltelefonen</li>
            <li>Oppsøk lokale myndigheters informasjons­punkter (ofte på rådhus, skoler eller andre samlingssteder)</li>
          </ul>
        </div>

        <div>
          <p class="font-semibold">Husk!</p>
          <p class="text-gray-800">
            Det kan være begrenset tilgang til informasjon under en krise. Forsøk å være tålmodig og søk informasjon periodisk.
            Ta vare på batterier og strømforsyning til kommunikasjonsutstyr. Det er viktig å ha en batteridrevet DAB-radio tilgjengelig,
            da denne ofte vil fungere selv når andre kommunikasjonskanaler er nede.
          </p>
        </div>

      </div>
    </div>

    <!-- Step indicator and back -->
    <div class="mt-16 w-full flex flex-col items-center gap-4">
      <UnderStepIndicator :currentStep="2" />
      <button
        @click="goToOverview"
        class="flex items-center gap-2 text-[#2c3e50] hover:underline text-sm"
      >
        <span class="text-xl">←</span> Oversikt
      </button>
    </div>
  </section>
</template>