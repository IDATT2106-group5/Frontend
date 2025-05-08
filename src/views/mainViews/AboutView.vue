<script setup>
import StaticPageCard from '@/components/StaticPageCard.vue'
import { useRouter } from 'vue-router'

/** Vue Router instance for programmatic navigation */
const router = useRouter()

/**
 * Navigates the user to the home page.
 * Triggered by clicking the "Hjem" button in the footer.
 *
 * @returns {void}
 */
const goToHome = () => router.push('/')
</script>

<template>
  <StaticPageCard>
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           class="lucide lucide-user-round-icon lucide-user-round">
        <circle cx="12" cy="8" r="5"/>
        <path d="M20 21a8 8 0 0 0-16 0"/>
      </svg>
    </template>

    <template #title>Om oss</template>

    <p>
      Vi jobber for å gjøre beredskap enkelt, forståelig og tilgjengelig for alle. Målet vårt er å hjelpe deg med å være bedre forberedt før, under og etter en krise.
    </p>

    <div>
      <h2 class="text-lg font-semibold text-[#2c3e50]">Vårt oppdrag</h2>
      <p class="mt-1">
        Å øke kriseforståelse og styrke folks evne til å håndtere kriser gjennom brukervennlig, oppdatert og praktisk informasjon.
      </p>
    </div>

    <div>
      <h2 class="text-lg font-semibold text-[#2c3e50]">Innhold og kilder</h2>
      <p class="mt-1">
        Innholdet er basert på anbefalinger fra DSB, helsemyndigheter og fagmiljøer. Vi oppdaterer jevnlig.
      </p>
    </div>

    <div>
      <h2 class="text-lg font-semibold text-[#2c3e50]">Kontakt</h2>
      <p class="mt-1">
        Har du spørsmål? <RouterLink to="/contact" class="text-[#2c3e50] underline">Ta kontakt med oss her</RouterLink>.
      </p>
    </div>

    <template #footer>
      <button
        @click="goToHome"
        class="flex items-center gap-2 text-[#2c3e50] hover:underline text-sm"
      >
        <span class="text-xl">←</span> Hjem
      </button>
    </template>
  </StaticPageCard>
</template>