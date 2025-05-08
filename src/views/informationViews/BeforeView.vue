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
 * Navigates the user to the "/under" route when called.
 * Typically triggered by clicking the "UNDER KRISE" button.
 * @function
 * @returns {void}
 */
const goToUnder = () => {
  router.push('/under')
}

/**
 * Navigates the user to the "/scenarios" route when called.
 * @function
 */
const goToScenarios = () => {
  router.push('/scenarios') 
}

/**
 * Navigates to the "Prepare for Crisis" page at `/prepare-crisis`.
 * Typically triggered by clicking the "Forbered deg på kriser" card.
 *
 * @returns {void}
 */
const goToPrepareCrisis = () => {
  router.push('/prepare-crisis')
}

/**
 * Navigates to the "Quiz" page at `/quiz`.
 * Typically triggered by clicking the "Test deg selv" card.
 *
 * @returns {void}
 */
const goToQuiz = () => {
  router.push('/quiz')
}

</script>

<template>
  <section class="relative min-h-screen bg-gray-100 flex flex-col items-center pt-24 pb-16 px-4">
    <!-- Right-side button -->
    <button
      @click="goToUnder"
      class="hidden lg:flex absolute right-8 top-1/2 transform -translate-y-1/2 flex-col items-center justify-center border-2 border-[#2c3e50]
             text-[#2c3e50] px-6 py-5 rounded-xl hover:bg-[#2c3e50] hover:text-white transition w-[140px] h-[140px] shadow-lg"
    >
      <span class="text-xl font-bold leading-tight text-center">UNDER<br />KRISE</span>
      <span class="text-6xl leading-tight mt-3">→</span>
    </button>

    <!-- Mobile button (only visible on small screens) -->
    <div class="lg:hidden mb-6 w-full max-w-xs">
      <button
        @click="goToUnder"
        class="w-full flex flex-col items-center justify-center border-2 border-[#2c3e50]
               text-[#2c3e50] px-6 py-4 rounded-xl hover:bg-[#2c3e50] hover:text-white transition shadow-lg"
      >
        <span class="text-lg font-bold leading-tight text-center">UNDER KRISE</span>
        <span class="text-4xl leading-tight mt-2">→</span>
      </button>
    </div>

    <!-- MainCard component -->
    <MainCard
      title="Beredskap før krise"
      subtitle="Forbered deg og din husstand på en mulig katastrofe."
    >
      <div class="space-y-8 text-left">
        <!-- Card 1 -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-[#ACACAC] rounded-xl px-6 py-6 min-h-[160px]
                    max-w-xl mx-auto cursor-pointer hover:opacity-100 hover:shadow-md transform hover:scale-105 transition"
            @click="goToPrepareCrisis">
          <InfoBox
            title="1. Forbered deg på kriser"
            description="Les mer om å forberede seg til en krise"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                   class="lucide lucide-clipboard-pen">
                <rect width="8" height="4" x="8" y="2" rx="1"/>
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5.5"/>
                <path d="M4 13.5V6a2 2 0 0 1 2-2h2"/>
                <path d="M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>
              </svg>
            </template>
          </InfoBox>
          <ArrowIcon />
        </div>

        <!-- Card 2 -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-[#ACACAC] rounded-xl px-6 py-6 min-h-[160px]
                    max-w-xl mx-auto cursor-pointer hover:opacity-100 hover:shadow-md transform hover:scale-105 transition"
             @click="goToScenarios">
          <InfoBox
            title="2. Les på ulike scenarioer"
            description="Få kunnskap om ulike krisesituasjoner"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                   class="lucide lucide-book-open-text">
                <path d="M12 7v14"/><path d="M16 12h2"/><path d="M16 8h2"/>
                <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>
                <path d="M6 12h2"/><path d="M6 8h2"/>
              </svg>
            </template>
          </InfoBox>
          <ArrowIcon />
        </div>

        <!-- Card 3 -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-[#ACACAC] rounded-xl px-6 py-6 min-h-[160px]
                    max-w-xl mx-auto cursor-pointer hover:opacity-100 hover:shadow-md transform hover:scale-105 transition"
             @click="goToQuiz">
          <InfoBox
            title="3. Test deg selv"
            description="Ta en quiz og test kunnskapene dine"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                   class="lucide lucide-help-circle">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 1 1 2.91 4" />
                <line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
            </template>
          </InfoBox>
          <ArrowIcon />
        </div>
      </div>
    </MainCard>

    <!-- Step indicator -->
    <StepIndicator />
  </section>
</template>
