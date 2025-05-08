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
        <h1 class="text-3xl font-bold text-gray-900">Mental helse</h1>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             class="lucide lucide-brain text-[#2c3e50]">
          <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
          <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
          <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
          <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
          <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
          <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
          <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
          <path d="M6 18a4 4 0 0 1-1.967-.516"/>
          <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
        </svg>
      </div>

      <p class="text-gray-700 mb-8">
        Råd for å håndtere stress og etterreaksjoner
      </p>

      <!-- Sections -->
      <div class="space-y-10 text-gray-900 text-base leading-relaxed">

        <div>
          <p class="font-semibold text-lg mb-2">Vanlige reaksjoner etter en krise</p>
          <p class="text-gray-800 mb-2">
            Det er normalt å oppleve disse reaksjonene etter en krisehendelse:
          </p>
          <ul class="list-disc list-inside text-gray-800 space-y-1">
            <li>Søvnproblemer, mareritt og konsentrasjonsvansker</li>
            <li>Angst, redsel, eller overdreven årvåkenhet</li>
            <li>Uro, irritabilitet eller humørsvingninger</li>
            <li>Flashbacks eller påtrengende minner fra hendelsen</li>
            <li>Følelsesmessig nummenhet eller distansering</li>
          </ul>
        </div>

        <div>
          <p class="font-semibold text-lg mb-2">Selvhjelpsteknikker</p>
          <ol class="list-decimal list-inside text-gray-800 space-y-2">
            <li>
              Etabler rutiner
              <ul class="list-disc list-inside ml-6">
                <li>Regelmessige måltider, søvn og aktivitet gir stabilitet</li>
              </ul>
            </li>
            <li>
              Bevegelse
              <ul class="list-disc list-inside ml-6">
                <li>Fysisk aktivitet reduserer stress og bedrer humøret</li>
              </ul>
            </li>
            <li>
              Begrens medieeksponering
              <ul class="list-disc list-inside ml-6">
                <li>Ta pauser fra nyheter om krisen</li>
              </ul>
            </li>
            <li>
              Sosial kontakt
              <ul class="list-disc list-inside ml-6">
                <li>Hold kontakt med familie og venner</li>
              </ul>
            </li>
          </ol>
        </div>

        <div>
          <p class="font-semibold text-lg mb-2">Når bør du søke profesjonell hjelp?</p>
          <p class="text-gray-800">
            Kontakt lege eller Mental Helse (<strong>116 123</strong>) hvis reaksjonene er sterke,
            vedvarer over tid, eller hindrer daglige aktiviteter.
          </p>
        </div>
      </div>
    </div>

    <!-- Step indicator and back -->
    <div class="mt-16 w-full flex flex-col items-center gap-4">
      <AfterStepIndicator :currentStep="1" />
      <button
        @click="goToOverview"
        class="flex items-center gap-2 text-[#2c3e50] hover:underline text-sm"
      >
        <span class="text-xl">←</span> Oversikt
      </button>
    </div>
  </section>
</template>