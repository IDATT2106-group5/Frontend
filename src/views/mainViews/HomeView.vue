<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import { useDateStore } from '@/stores/DateStore'

const userStore = useUserStore()
const dateStore = useDateStore()


onMounted(async () => {
  if (!userStore.user) {
    userStore.autoLogin()
    dateStore.startClock()
    await userStore.fetchUser()
  }
}),

onUnmounted(() => {
  dateStore.stopClock()
})

</script>

<template>
  <div class="min-h-screen bg-gray-100 font-sans">
    <!-- Header -->
    <header class="flex flex-col sm:flex-row items-center justify-between p-4 bg-white shadow text-center sm:text-left gap-2 sm:gap-0">
      <h1 class="text-3xl md:text-5xl font-bold">KRISESITUASJON</h1>
      <div class="text-sm">
        <p class="font-semibold">Norske myndigheter</p>
        <p>{{ dateStore.formattedDateTime }}</p>
      </div>
    </header>

    <!-- Danger Section -->
    <section class="bg-white p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6">
      <!-- Left: Danger Level -->
      <div class="text-center md:text-left">
        <p class="font-semibold">Farenivå:</p>
        <p class="text-red-600 font-bold text-lg">KRITISK</p>
      </div>

      <!-- Warning Message -->
      <div class="bg-gray-50 p-4 border rounded w-full max-w-4xl mx-auto text-sm">
        <h2 class="font-bold text-lg mb-2">Flom i Trondheim</h2>
        <p>
          Store nedbørsmengder har ført til alvorlige oversvømmelser i Trøndelag.
          Vannstanden er kritisk høy, særlig i Trondheim. Veier er stengt og flere
          distrikter isolert. Myndighetene har erklært katastrofetilstand i de hardest
          rammede områdene. Situasjonen kan forverre seg grunnet fortsatt kraftig regn.
        </p>
      </div>

      <!-- Map Placeholder -->
      <router-link to="/map" class="w-full md:w-1/3">
        <div class="h-48 md:h-64 bg-gray-300 rounded flex items-center justify-center text-gray-700 hover:bg-gray-400 transition cursor-pointer">
          Kart
        </div>
      </router-link>
    </section>

    <!-- Latest News -->
    <section class="bg-[#2c3e50] text-white py-8 px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-6">Siste nytt</h2>

      <div class="space-y-4 max-w-3xl mx-auto">
        <div class="bg-white text-black p-4 rounded flex flex-col sm:flex-row justify-between gap-2">
          <p class="font-semibold">Flom i Trondheim: Evakuering pågår i sentrale områder</p>
          <span class="text-red-600 font-bold text-right sm:text-left">13 min</span>
        </div>
        <div class="bg-white text-black p-4 rounded flex flex-col sm:flex-row justify-between gap-2">
          <p class="font-semibold">Flom i Trondheim: Flere skoler og barnehager stengt</p>
          <span class="text-red-600 font-bold text-right sm:text-left">1 time 18 min</span>
        </div>
        <div class="bg-white text-black p-4 rounded flex flex-col sm:flex-row justify-between gap-2">
          <p class="font-semibold">Flom i Trondheim: To personer reddet fra vannmasser</p>
          <span class="text-red-600 font-bold text-right sm:text-left">2 timer 20 min</span>
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
      <h2 class="text-3xl md:text-5xl font-bold mb-6 text-[#2c3e50]">Beredskap</h2>

      <!-- Wrapper for desktop layout -->
      <div class="flex flex-col md:flex-row justify-center items-center md:gap-32 gap-8 text-center">

        <!-- Før -->
        <router-link to="/before" class="block">
          <div class="bg-[#2c3e50] text-white p-6 rounded-lg w-52 h-52 flex flex-col justify-between hover:shadow-lg transition cursor-pointer">
            <p class="text-xl font-bold text-center drop-shadow-md">Før</p>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold">Les mer</span>
              <span class="bg-white text-[#2c3e50] rounded-md px-3 py-1 text-xl font-bold leading-none">→</span>
            </div>
          </div>
        </router-link>

        <!-- Under -->
        <router-link to="/under" class="block">
          <div class="bg-[#2c3e50] text-white p-6 rounded-lg w-52 h-52 flex flex-col justify-between hover:shadow-lg transition cursor-pointer">
            <p class="text-xl font-bold text-center drop-shadow-md">Under</p>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold">Les mer</span>
              <span class="bg-white text-[#2c3e50] rounded-md px-3 py-1 text-xl font-bold leading-none">→</span>
            </div>
          </div>
        </router-link>

        <!-- Etter -->
        <router-link to="/after" class="block">
          <div class="bg-[#2c3e50] text-white p-6 rounded-lg w-52 h-52 flex flex-col justify-between hover:shadow-lg transition cursor-pointer">
            <p class="text-xl font-bold text-center drop-shadow-md">Etter</p>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold">Les mer</span>
              <span class="bg-white text-[#2c3e50] rounded-md px-3 py-1 text-xl font-bold leading-none">→</span>
            </div>
          </div>
        </router-link>

      </div>
    </section>
  </div>
</template>
