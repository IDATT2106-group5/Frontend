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
 * Navigates to the "/under" route, typically showing content related to "under krise".
 * Triggered by clicking the navigation button labeled "UNDER KRISE".
 *
 * @function
 * @returns {void}
 */
const goToUnder = () => {
  router.push('/under')
}
</script>

<template>
  <section class="relative min-h-screen bg-gray-100 flex flex-col items-center pt-24 pb-16 px-4">

    <!-- Desktop LEFT NAV BUTTON -->
    <button
      @click="goToUnder"
      class="hidden lg:flex absolute left-8 top-1/2 transform -translate-y-1/2 flex-col items-center justify-center border-2 border-[#2c3e50] text-[#2c3e50] px-6 py-5 rounded-xl hover:bg-[#2c3e50] hover:text-white transition w-[140px] h-[140px] shadow-lg"
    >
      <span class="text-xl font-bold leading-tight text-center">UNDER<br />KRISE</span>
      <span class="text-6xl leading-tight mt-3">←</span>
    </button>

    <!-- Mobile Button -->
    <div class="lg:hidden w-full max-w-xs mb-6">
      <button
        @click="goToUnder"
        class="w-full flex flex-col items-center justify-center border-2 border-[#2c3e50] text-[#2c3e50] px-4 py-4 rounded-xl hover:bg-[#2c3e50] hover:text-white transition shadow-lg"
      >
        <span class="text-sm font-bold leading-tight text-center">UNDER KRISE</span>
        <span class="text-3xl leading-tight mt-1">←</span>
      </button>
    </div>

    <!-- MAIN CARD -->
    <MainCard
      title="Beredskap etter krise"
      subtitle="Evaluer erfaringer og forbered deg til neste gang."
    >
      <div class="space-y-8 text-left">
        <!-- Card 1 -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-[#ACACAC] rounded-xl px-6 py-6 min-h-[160px] max-w-xl mx-auto cursor-pointer hover:opacity-100 hover:shadow-md transform hover:scale-105 transition">
          <InfoBox
            title="1. Snakk om det"
            description="Del erfaringer med andre, snakk om det som har skjedd"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                   class="lucide lucide-message-circle">
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
              </svg>
            </template>
          </InfoBox>
          <ArrowIcon />
        </div>

        <!-- Card 2 -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-[#ACACAC] rounded-xl px-6 py-6 min-h-[160px] max-w-xl mx-auto cursor-pointer hover:opacity-100 hover:shadow-md transform hover:scale-105 transition">
          <InfoBox
            title="2. Mental helse"
            description="Råd for å håndtere stress og etterreaksjoner"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                   class="lucide lucide-brain">
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
            </template>
          </InfoBox>
          <ArrowIcon />
        </div>

        <!-- Card 3 -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-[#ACACAC] rounded-xl px-6 py-6 min-h-[160px] max-w-xl mx-auto cursor-pointer hover:opacity-100 hover:shadow-md transform hover:scale-105 transition">
          <InfoBox
            title="3. Lær og forbedre"
            description="Evaluer beredskapen og gjør nødvendige endringer"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                   class="lucide lucide-lightbulb">
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                <path d="M9 18h6"/><path d="M10 22h4"/>
              </svg>
            </template>
          </InfoBox>
          <ArrowIcon />
        </div>
      </div>
    </MainCard>

    <!-- STEP INDICATOR -->
    <StepIndicator />
  </section>
</template>
