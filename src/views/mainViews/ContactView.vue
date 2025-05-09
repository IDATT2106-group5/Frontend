<script setup>
import StaticPageCard from '@/components/StaticPageCard.vue'
import { useRouter } from 'vue-router'

/** Vue Router instance for programmatic navigation */
const router = useRouter()

/**
 * Navigates to the home page.
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
           class="lucide lucide-mail">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 4-10 9L2 4" />
      </svg>
    </template>

    <template #title>Kontakt oss</template>

    <p>
      Har du spørsmål, tilbakemeldinger eller ønsker du å komme i kontakt med oss? Ikke nøl med å ta kontakt!
    </p>

    <div>
      <h2 class="text-lg font-semibold text-[#2c3e50]">Kontaktinformasjon</h2>
      <p class="mt-1">
        E-post: <a href="mailto:krisefikser.team@gmail.com" class="text-[#2c3e50] underline">krisefikser.team@gmail.com</a><br />
      </p>
    </div>

    <div>
      <h2 class="text-lg font-semibold text-[#2c3e50]">Har du spørsmål?</h2>
      <p class="mt-1">
        Vi svarer gjerne på alt du lurer på om beredskap, innholdet vårt eller hvordan du kan bidra.
        Du kan også sende oss forslag til forbedringer eller nyttig innhold du ønsker å se.
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
