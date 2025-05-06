<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4 py-10"
  >
    <div class="bg-white max-w-3xl w-full rounded-xl shadow-md p-8 sm:p-10 space-y-6 relative overflow-y-auto max-h-[95vh]">
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl font-bold"
      >
        ×
      </button>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div class="text-[#2c3e50] flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               class="lucide lucide-shield">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-4xl font-bold text-[#2c3e50] break-words">Personvernerklæring</h1>
      </div>

      <!-- Intro -->
      <p class="text-gray-600">
        Vi er opptatt av personvernet og beskytter dine personopplysninger. Denne personvernerklæringen forklarer hvordan vi samler inn, bruker og beskytter informasjonen din.
      </p>

      <!-- Sections -->
      <div class="space-y-6">
        <div>
          <h2 class="text-lg font-semibold text-[#2c3e50]">Hvilken informasjon vi samler inn</h2>
          <p class="text-gray-600 mt-1">
            Vi kan samle inn informasjon du oppgir når du bruker våre tjenester, inkludert navn og e-postadresse.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#2c3e50]">Hvordan vi bruker informasjonen</h2>
          <p class="text-gray-600 mt-1">
            Informasjonen vi samler inn brukes til å levere, vedlikeholde og forbedre våre tjenester, samt til å kommunisere med deg og tilpasse opplevelsen din.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#2c3e50]">Hvordan vi beskytter informasjonen</h2>
          <p class="text-gray-600 mt-1">
            Vi beskytter dine personopplysninger med sikre systemer, tilgangsbegrensninger og gode rutiner for lagring og håndtering. Kun autoriserte personer har tilgang, for å sikre at informasjonen behandles trygt.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#2c3e50]">Dine rettigheter</h2>
          <p class="text-gray-600 mt-1">
            Du har rett til å be om innsyn, korrigering eller sletting av dine personopplysninger. Kontakt oss for å utøve disse rettighetene.
          </p>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-[#2c3e50]">Kontakt oss</h2>
          <p class="text-gray-600 mt-1">
            Hvis du har spørsmål om denne personvernerklæringen eller vår behandling av dine personopplysninger:
          </p>
          <p class="text-gray-700 font-medium mt-2">
            Vennligst kontakt oss på:<br />
            <a href="mailto:krisefikser.team@gmail.com" class="text-[#2c3e50] underline">krisefikser.team@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean
})
</script>
