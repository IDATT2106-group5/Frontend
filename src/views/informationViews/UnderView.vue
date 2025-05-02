<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const goToBefore = () => {
  router.push('/before')
}
const goToAfter = () => {
  router.push('/after')
}
</script>

<template>
  <section class="relative min-h-screen bg-gray-100 flex flex-col items-center pt-24 pb-16 px-4">

    <!-- LEFT-SIDE NAV BUTTON -->
    <button
      @click="goToBefore"
      class="absolute left-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center justify-center border-2 border-[#2c3e50] text-[#2c3e50] px-6 py-5 rounded-xl hover:bg-[#2c3e50] hover:text-white transition w-[140px] h-[140px] shadow-lg"
    >

      <span class="text-xl font-bold leading-tight">FØR<br />KRISE</span>
      <span class="text-6xl leading-tight mt-3">←</span>
    </button>

    <!-- RIGHT-SIDE NAV BUTTON -->
    <button
      @click="goToAfter"
      class="absolute right-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center justify-center border-2 border-[#2c3e50] text-[#2c3e50] px-6 py-5 rounded-xl hover:bg-[#2c3e50] hover:text-white transition w-[140px] h-[140px] shadow-lg"
    >
      <span class="text-xl font-bold leading-tight">ETTER<br />KRISE</span>
      <span class="text-6xl leading-tight mt-3">→</span>
    </button>

    <!-- MAIN CARD -->
    <div class="bg-white border-4 border-[#ACACAC] rounded-2xl shadow-lg p-14 w-full max-w-3xl text-center min-h-[800px] flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-center gap-4 mb-3">
          <!-- Calendar Icon -->
          <div class="-ml-20 text-[#2c3e50]">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 class="lucide lucide-calendar">
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
            </svg>
          </div>
          <!-- Heading -->
          <h1 class="text-4xl font-extrabold text-[#2c3e50]">Beredskap under krise</h1>
        </div>
        <p class="text-base text-gray-600 mb-10">Finn ut hvordan du kan ta riktige valg under katastrofen.</p>

        <!-- Cards -->
        <div class="space-y-8 text-left">
          <!-- Card 1 -->
          <div class="flex items-center justify-between gap-6 border-2 border-[#ACACAC]  rounded-xl px-6 py-15 min-h-[160px]
           max-w-xl mx-auto cursor-pointer hover:opacity-100 hover:shadow-md transform hover:scale-105 transition">
            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div class="text-[#2c3e50]">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     class="lucide lucide-map-pin">
                  <path d="M21 10c0 6.075-9 13-9 13S3 16.075 3 10a9 9 0 1 1 18 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
            </div>
              <div>
                <h2 class="text-lg font-semibold text-[#2c3e50]">1. Søk trygghet</h2>
                <p class="text-sm text-[#2c3e50] opacity-70 py-3">Finn trygg plass, hold deg innendørs, eller evakuer ved behov</p>
              </div>
            </div>
            <!-- Arrow -->
            <div class="text-[#2c3e50]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="flex items-center justify-between gap-6 border-2 border-[#ACACAC]  rounded-xl px-6 py-15 min-h-[160px]
           max-w-xl mx-auto cursor-pointer hover:opacity-100 hover:shadow-md transform hover:scale-105 transition">
            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div class="text-[#2c3e50]">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert-icon lucide-shield-alert">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52
                  0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/>
                  <path d="M12 16h.01"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-[#2c3e50]">2. Tips til krisehåndtering</h2>
                <p class="text-sm text-[#2c3e50] opacity-70 py-3">Kommunikasjon og håndtering av akutte behov</p>
              </div>
            </div>
            <!-- Arrow -->
            <div class="text-[#2c3e50]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="flex items-center justify-between gap-6 border-2 border-[#ACACAC]  rounded-xl px-6 py-15 min-h-[160px]
           max-w-xl mx-auto cursor-pointer hover:opacity-100 hover:shadow-md transform hover:scale-105 transition">
            <div class="flex items-start gap-4">
              <div class="text-[#2c3e50]">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume2-icon lucide-volume-2">
                  <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/>
                  <path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-[#2c3e50]">3. Følg med på varsler</h2>
                <p class="text-sm text-[#2c3e50] opacity-70 py-3">Hold deg oppdatert på situasjonen</p>
              </div>
            </div>
            <div class="text-[#2c3e50]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- STEP INDICATOR -->
    <div class="mt-10 flex items-center justify-center space-x-10 text-sm">

      <router-link to="/before" class="flex flex-col items-center space-y-1 cursor-pointer opacity-50
      hover:opacity-100 transition transform hover:scale-110">
        <div class="w-5 h-5 rounded-full border-2 border-gray-400"></div>
        <span>Før</span>
      </router-link>

      <!-- Under (active step) -->
      <div class="flex flex-col items-center space-y-1">
        <div class="w-5 h-5 rounded-full bg-[#2c3e50]"></div>
        <span class="font-semibold">Under</span>
      </div>

      <!-- Etter (clickable) -->
      <router-link to="/after" class="flex flex-col items-center space-y-1 cursor-pointer opacity-50
      hover:opacity-100 transition transform hover:scale-110">
        <div class="w-5 h-5 rounded-full border-2 border-gray-400"></div>
        <span>Etter</span>
      </router-link>

    </div>

  </section>
</template>


