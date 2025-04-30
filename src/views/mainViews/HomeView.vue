<script setup>

</script>

<template>
  <div class="min-h-screen bg-gray-100 font-sans">
    <!-- Header -->
    <header class="flex items-center justify-between p-4 bg-white shadow">
      <div class="flex items-center space-x-4">
        <h1 class="text-5xl font-bold">KRISESITUASJON</h1>
      </div>
      <div class="text-right text-sm">
        <p class="font-semibold">Norske myndigheter</p>
        <p>24.04.2025 12:33</p>
      </div>
    </header>

    <!-- Danger Section -->
    <section class="bg-white p-6 flex flex-col md:flex-row gap-6">
      <div>
        <p class="font-semibold">Farenivå:</p>
        <p class="text-red-600 font-bold text-lg">KRITISK</p>
      </div>

      <!-- Warning Message -->
      <div class="bg-gray-50 p-4 border rounded max-w-4xl mx-auto">
        <h2 class="font-bold text-lg mb-2">Flom i Trondheim</h2>
        <p class="text-sm">
          Store nedbørsmengder har ført til alvorlige oversvømmelser i Trøndelag.
          Vannstanden er kritisk høy, særlig i Trondheim. Veier er stengt og flere
          distrikter isolert. Myndighetene har erklært katastrofetilstand i de hardest
          rammede områdene. Situasjonen kan forverre seg grunnet fortsatt kraftig regn.
        </p>
      </div>

      <!-- Map Placeholder -->
      <div class="w-full md:w-1/3 h-64 bg-gray-300 rounded flex items-center justify-center text-gray-700">
        Kart
      </div>
    </section>

    <!-- Latest News -->
    <section class="bg-[#2c3e50] text-white py-8 px-4">
      <h2 class="text-4xl font-bold text-center mb-6">Siste nytt</h2>

      <div class="space-y-4 max-w-3xl mx-auto">
        <div class="bg-white text-black p-4 rounded flex justify-between">
          <p class="text-base font-semibold leading-relaxed text-black">
            Flom i Trondheim: Evakuering pågår i sentrale områder
          </p>
          <span class="text-red-600 font-bold">13 min</span>

        </div>
        <div class="bg-white text-black p-4 rounded flex justify-between">
          <p class="text-base font-semibold leading-relaxed text-black">
            Flom i Trondheim: Flere skoler og barnehager stengt
          </p>
          <span class="text-red-600 font-bold">1 time 18 min</span>

        </div>
        <div class="bg-white text-black p-4 rounded flex justify-between">
          <p class="text-base font-semibold leading-relaxed text-black">
            Flom i Trondheim: To personer reddet fra vannmasser
          </p>
          <span class="text-red-600 font-bold">2 timer 20 min</span>
        </div>
      </div>

      <div class="text-center mt-6">
        <button class="bg-[#2c3e50] text-white px-4 py-2 rounded border border-white">
          Alle nyheter
        </button>
      </div>
    </section>

    <!-- Preparedness -->
    <section class="py-10 px-4 bg-gray-100 text-center">
      <h2 class="text-5xl font-bold mb-6 text-[#2c3e50]">Beredskap</h2>
      <div class="flex flex-col md:flex-row justify-center gap-6">

        <!-- Før -->
        <div class="bg-[#2c3e50] text-white p-6 rounded-lg w-52 h-52 mx-auto flex flex-col justify-between">
          <p class="text-xl font-bold text-center drop-shadow-md">Før</p>
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold">Les mer</span>
            <span class="bg-white text-[#2c3e50] rounded-md px-3 py-1 text-xl font-bold leading-none">→</span>
          </div>
        </div>

        <!-- Under -->
        <div class="bg-[#2c3e50] text-white p-6 rounded-lg w-52 h-52 mx-auto flex flex-col justify-between">
          <p class="text-xl font-bold text-center drop-shadow-md">Under</p>
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold">Legits mer</span>
            <span class="bg-white text-[#2c3e50] rounded-md px-3 py-1 text-xl font-bold leading-none">→</span>
          </div>
        </div>

        <!-- Etter -->
        <div class="bg-[#2c3e50] text-white p-6 rounded-lg w-52 h-52 mx-auto flex flex-col justify-between">
          <p class="text-xl font-bold text-center drop-shadow-md">Etter</p>
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold">Les mer</span>
            <span class="bg-white text-[#2c3e50] rounded-md px-3 py-1 text-xl font-bold leading-none">→</span>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>
