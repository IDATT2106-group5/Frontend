<script setup>
import { useRouter } from 'vue-router'
import UnderStepIndicator from '@/components/UnderStepIndicator.vue'

/** Vue Router instance for programmatic navigation */
const router = useRouter()

/**
 * Navigates to the overview page for the "Under krisen" section.
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
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Hva du gjør under en krise</h1>
      <p class="text-gray-700 mb-8">
        Ta grep for å beskytte deg selv og andre i en krisesituasjon. <br />
        Her er noen råd å følge:
      </p>

      <!-- Sections -->
      <div class="space-y-8 text-gray-900 text-base leading-relaxed">

        <div>
          <p class="font-semibold">Bevar ro og skaff oversikt</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>Forsøk å holde hodet klart og tenk klart</li>
          </ul>
        </div>

        <div>
          <p class="font-semibold">Følg myndighetenes råd</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>Hold deg oppdatert og følg anbefalinger fra myndighetene</li>
          </ul>
        </div>

        <div>
          <p class="font-semibold">Spar på ressursene</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>Rasjoner mat, vann og drivstoff fornuftig</li>
          </ul>
        </div>

        <div>
          <p class="font-semibold">Kommunikasjon</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>
              Finn ut hvordan du kan holde deg oppdatert. Ha gjerne en nødkommunikasjonsplan med familien.
            </li>
          </ul>
        </div>

        <div>
          <p class="font-semibold">Beskyttelse og trygghet</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>Sørg for førstehjelpsutstyr og eventuelt forsvarsmidler</li>
          </ul>
        </div>

        <div>
          <p class="font-semibold">Planlegg for lengre tid</p>
          <ul class="list-disc list-inside text-gray-800">
            <li>
              Tenk fremover: Hva hvis hjelpen ikke kommer på dager eller uker?
              Lag en plan for rasjonering av ressurser og alternative løsninger.
            </li>
          </ul>
        </div>

      </div>
    </div>

    <!-- Step indicator and back -->
    <div class="mt-16 w-full flex flex-col items-center gap-4">
      <UnderStepIndicator :currentStep="1" />
      <button
        @click="goToOverview"
        class="flex items-center gap-2 text-[#2c3e50] hover:underline text-sm"
      >
        <span class="text-xl">←</span> Oversikt
      </button>
    </div>
  </section>
</template>