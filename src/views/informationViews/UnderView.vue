<script setup>
/**
 * Imports Vue Router's useRouter for programmatic navigation
 * and custom components used in this view.
 */
import { useRouter } from 'vue-router'

/**
 * Step indicator component displayed at the bottom of the page.
 * Shows the user's progress through the preparation steps.
 */
import StepIndicator from '@/components/StepIndicator.vue'

/**
 * Arrow icon component used as a visual cue inside cards.
 */
import ArrowIcon from '@/components/ArrowIcon.vue'

/**
 * InfoBox component used to display title, description, and icon for each card.
 */
import InfoBox from '@/components/InfoBox.vue'

/**
 * MainCard is a wrapper component providing title, subtitle, and content section.
 */
import MainCard from '@/components/MainCard.vue'

/**
 * Instance of the Vue Router used to navigate between routes.
 * @type {import('vue-router').Router}
 */
const router = useRouter()

/**
 * Navigates to the "before crisis" view when triggered.
 * Usually connected to the "FØR KRISE" button.
 * @function
 * @returns {void}
 */
const goToBefore = () => {
  router.push('/before')
}

/**
 * Navigates to the "after crisis" view when triggered.
 * Usually connected to the "ETTER KRISE" button.
 * @function
 * @returns {void}
 */
const goToAfter = () => {
  router.push('/after')
}

/**
 * Navigates to the "Seek Safety" page.
 *
 * @returns {void}
 */
const goToSeekSafety = () => {
  router.push('/seek-safety')
}

/**
 * Navigates to the "Emergency Tips" page.
 *
 * @returns {void}
 */
const goToEmergencyTips = () => {
  router.push('/emergency-tips')
}

/**
 * Navigates to the "Alert" page.
 *
 * @returns {void}
 */
const goToAlert = () => {
  router.push('/alert')
}
</script>

<template>
  <section class="relative min-h-screen bg-gray-100 flex flex-col items-center pt-24 pb-16 px-4">

    <!-- Desktop Navigation Buttons -->
    <button
      @click="goToBefore"
      class="hidden lg:flex absolute left-8 top-1/2 transform -translate-y-1/2 flex-col items-center justify-center border-2 border-[#2c3e50] text-[#2c3e50] px-6 py-5 rounded-xl hover:bg-[#2c3e50] hover:text-white transition w-[140px] h-[140px] shadow-lg"
    >
      <span class="text-xl font-bold leading-tight">FØR<br />KRISE</span>
      <span class="text-6xl leading-tight mt-3">←</span>
    </button>

    <button
      @click="goToAfter"
      class="hidden lg:flex absolute right-8 top-1/2 transform -translate-y-1/2 flex-col items-center justify-center border-2 border-[#2c3e50] text-[#2c3e50] px-6 py-5 rounded-xl hover:bg-[#2c3e50] hover:text-white transition w-[140px] h-[140px] shadow-lg"
    >
      <span class="text-xl font-bold leading-tight">ETTER<br />KRISE</span>
      <span class="text-6xl leading-tight mt-3">→</span>
    </button>

    <!-- Mobile Nav Buttons -->
    <div class="lg:hidden flex w-full max-w-xs justify-between mb-6 gap-4">
      <button
        @click="goToBefore"
        class="w-full flex flex-col items-center justify-center border-2 border-[#2c3e50] text-[#2c3e50] px-4 py-4 rounded-xl hover:bg-[#2c3e50] hover:text-white transition shadow-lg"
      >
        <span class="text-sm font-bold leading-tight text-center">FØR KRISE</span>
        <span class="text-3xl leading-tight mt-1">←</span>
      </button>

      <button
        @click="goToAfter"
        class="w-full flex flex-col items-center justify-center border-2 border-[#2c3e50] text-[#2c3e50] px-4 py-4 rounded-xl hover:bg-[#2c3e50] hover:text-white transition shadow-lg"
      >
        <span class="text-sm font-bold leading-tight text-center">ETTER KRISE</span>
        <span class="text-3xl leading-tight mt-1">→</span>
      </button>
    </div>

    <!-- MainCard Component -->
    <MainCard
      title="Beredskap under krise"
      subtitle="Finn ut hvordan du kan ta riktige valg under katastrofen."
    >
      <div class="space-y-8 text-left">
        <!-- CARD 1 -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-[#ACACAC] rounded-xl px-6 py-6 min-h-[160px] max-w-xl mx-auto cursor-pointer hover:opacity-100 hover:shadow-md transform hover:scale-105 transition"
        @click="goToSeekSafety">
          <InfoBox
            title="1. Søk trygghet"
            description="Finn trygg plass, hold deg innendørs, eller evakuer ved behov"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                   class="lucide lucide-map-pin">
                <path d="M21 10c0 6.075-9 13-9 13S3 16.075 3 10a9 9 0 1 1 18 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </template>
          </InfoBox>
          <ArrowIcon />
        </div>

        <!-- CARD 2 -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-[#ACACAC] rounded-xl px-6 py-6 min-h-[160px] max-w-xl mx-auto cursor-pointer hover:opacity-100 hover:shadow-md transform hover:scale-105 transition"
        @click="goToEmergencyTips">
          <InfoBox
            title="2. Tips til krisehåndtering"
            description="Kommunikasjon og håndtering av akutte behov"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                   class="lucide lucide-shield-alert">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                <path d="M12 8v4"/>
                <path d="M12 16h.01"/>
              </svg>
            </template>
          </InfoBox>
          <ArrowIcon />
        </div>

        <!-- CARD 3 -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-[#ACACAC] rounded-xl px-6 py-6 min-h-[160px] max-w-xl mx-auto cursor-pointer hover:opacity-100 hover:shadow-md transform hover:scale-105 transition"
        @click="goToAlert">
          <InfoBox
            title="3. Følg med på varsler"
            description="Hold deg oppdatert på situasjonen"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                   class="lucide lucide-volume-2">
                <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/>
                <path d="M16 9a5 5 0 0 1 0 6"/>
                <path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>
              </svg>
            </template>
          </InfoBox>
          <ArrowIcon />
        </div>
      </div>
    </MainCard>

    <!-- Step Indicator -->
    <StepIndicator />
  </section>
</template>
