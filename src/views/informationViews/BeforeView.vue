<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const goToUnder = () => {
  router.push('/under')
}
</script>

<template>
  <section class="relative min-h-screen bg-gray-100 flex flex-col items-center pt-24 pb-16 px-4">

    <!-- Right-side button (NOT sticky) -->
    <button
      @click="goToUnder"
      class="absolute right-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center justify-center border-2 border-[#2c3e50] text-[#2c3e50] px-6 py-5 rounded-xl hover:bg-[#2c3e50] hover:text-white transition w-[140px] h-[140px] shadow-lg"
    >
      <span class="text-xl font-bold leading-tight">UNDER<br />KRISE</span>
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
          <h1 class="text-4xl font-extrabold text-[#2c3e50]">Beredskap før krise</h1>
        </div>
        <p class="text-base text-gray-600 mb-10">Forbered deg og din husstand på en mulig katastrofe.</p>

        <!-- Cards -->
        <div class="space-y-8 text-left">
          <!-- Card 1 -->
          <div class="flex items-center justify-between gap-6 border-2 border-[#ACACAC] rounded-xl px-6 py-15 min-h-[160px]
           max-w-xl mx-auto cursor-pointer hover:opacity-100 hover:shadow-md transform hover:scale-105 transition">
            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div class="text-[#2c3e50]">
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-pen-icon lucide-clipboard-pen">
                  <rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5.5"/>
                  <path d="M4 13.5V6a2 2 0 0 1 2-2h2"/>
                  <path d="M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-[#2c3e50] ">1. Forbered deg på kriser</h2>
                <p class="text-sm text-[#2c3e50] opacity-70 py-3">Les mer om å forberede seg til en krise</p>
              </div>
            </div>
            <!-- Arrow -->
            <div class="text-[#2c3e50]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="flex items-center justify-between gap-6 border-2 border-[#ACACAC] rounded-xl px-6 py-15 min-h-[160px]
           max-w-xl mx-auto cursor-pointer hover:opacity-100 hover:shadow-md transform hover:scale-105 transition">
            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div class="text-[#2c3e50]">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open-text-icon lucide-book-open-text">
                  <path d="M12 7v14"/><path d="M16 12h2"/><path d="M16 8h2"/>
                  <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>
                  <path d="M6 12h2"/><path d="M6 8h2"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-[#2c3e50]">2. Les på ulike scenarioer</h2>
                <p class="text-sm text-[#2c3e50] opacity-70 py-3">Få kunnskap om ulike krisesituasjoner</p>
              </div>
            </div>
            <!-- Arrow -->
            <div class="text-[#2c3e50]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="flex items-center justify-between gap-6 border-2 border-[#ACACAC] rounded-xl px-6 py-15 min-h-[160px]
           max-w-xl mx-auto cursor-pointer hover:opacity-100 hover:shadow-md transform hover:scale-105 transition">
            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div class="text-[#2c3e50]">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     class="lucide lucide-help-circle">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 1 1 2.91 4" />
                  <line x1="12" x2="12.01" y1="17" y2="17" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-[#2c3e50]">3. Test deg selv</h2>
                <p class="text-sm text-[#2c3e50] opacity-70 py-3">Ta en quiz og test kunnskapene dine</p>
              </div>
            </div>
            <!-- Arrow -->
            <div class="text-[#2c3e50]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- STEP INDICATOR OUTSIDE CARD -->
    <div class="mt-10 flex items-center justify-center space-x-10 text-sm">
      <div class="flex flex-col items-center space-y-1">
        <div class="w-5 h-5 rounded-full bg-[#2c3e50]"></div>
        <span class="font-semibold">Før</span>
      </div>

      <!-- Under (clickable) -->
      <router-link to="/under" class="flex flex-col items-center space-y-1 cursor-pointer opacity-50
      hover:opacity-100 transition transform hover:scale-110">
        <div class="w-5 h-5 rounded-full border-2 border-gray-400"></div>
        <span>Under</span>
      </router-link>

      <!-- Etter (clickable) -->
      <router-link to="/after" class="flex flex-col items-center space-y-1 cursor-pointer opacity-50
      hover:opacity-100 transition transform hover:scale-110">
        <div class="w-5 h-5 rounded-full border-2 border-gray-400"></div>
        <span>Etter</span>
      </router-link>

    </div>

  </section>
</template>
