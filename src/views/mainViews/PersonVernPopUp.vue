<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
    <div class="bg-white rounded-lg max-w-2xl w-full p-8 relative overflow-y-auto max-h-[90vh]">
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl font-bold"
      >
        ×
      </button>

      <!-- Header -->
      <div class="flex items-start gap-4 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-shield">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        <div>
          <h1 class="text-2xl font-bold text-[#2c3e50] mb-1">Personvernerklæring</h1>
          <p class="text-sm text-gray-600">
            Vi er opptatt av personvernet og beskytter dine personopplysninger.
            Denne personvernerklæringen forklarer hvordan vi samler inn, bruker og beskytter informasjonen din.
          </p>
        </div>
      </div>

      <!-- Sections -->
      <div class="space-y-6 text-sm text-gray-700">
        <div>
          <h2 class="font-semibold text-[#2c3e50]">Hvordan vi bruker informasjonen</h2>
          <p>
            Informasjonen vi samler inn brukes til å levere, vedlikeholde og forbedre våre tjenester,
            samt til å kommunisere med deg og tilpasse opplevelsen din.
          </p>
        </div>

        <div>
          <h2 class="font-semibold text-[#2c3e50]">Hvordan vi beskytter informasjonen</h2>
          <p>
            Vi beskytter dine personopplysninger med sikre systemer, tilgangsbegrensninger og gode rutiner
            for lagring og håndtering. Kun autoriserte personer har tilgang, for å sikre at informasjonen behandles trygt.
          </p>
        </div>

        <div>
          <h2 class="font-semibold text-[#2c3e50]">Dine rettigheter</h2>
          <p>
            Du har rett til å be om innsyn, korrigering eller sletting av dine personopplysninger.
            Kontakt oss for å utøve disse rettighetene.
          </p>
        </div>

        <div>
          <h2 class="font-semibold text-[#2c3e50]">Kontakt oss</h2>
          <p>
            Hvis du har spørsmål om denne personvernerklæringen eller vår behandling av dine personopplysninger,
            vennligst kontakt oss på:
          </p>
          <p class="text-blue-700 font-medium mt-1">
            <a href="mailto:atombombe@hotmail.com" class="underline">atombombe@hotmail.com</a>
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
