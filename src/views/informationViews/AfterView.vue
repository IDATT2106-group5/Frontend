<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const goToUnder = () => {
  router.push('/under')
}
</script>

<template>
  <section class="relative min-h-screen bg-gray-100 flex flex-col items-center pt-24 pb-16 px-4">

    <!-- LEFT-SIDE NAV BUTTON -->
    <button
      @click="goToUnder"
      class="absolute left-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center justify-center border-2 border-[#2c3e50] text-[#2c3e50] px-6 py-5 rounded-xl hover:bg-[#2c3e50] hover:text-white transition w-[140px] h-[140px] shadow-lg"
    >
      <span class="text-xl font-bold leading-tight">UNDER<br />KRISE</span>
      <span class="text-6xl leading-tight mt-3">←</span>
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
          <h1 class="text-4xl font-extrabold text-[#2c3e50]">Beredskap etter krise</h1>
        </div>
        <p class="text-base text-gray-600 mb-10">Evaluer erfaringer og forbered deg til neste gang.</p>

        <!-- Cards -->
        <div class="space-y-8 text-left">
          <!-- Card 1 -->
          <div class="flex items-center justify-between gap-6 border-2 border-[#ACACAC]  rounded-xl px-6 py-15 min-h-[160px] max-w-xl mx-auto hover:shadow-md transition cursor-pointer">
            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div class="text-[#2c3e50]">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle-icon lucide-message-circle">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-[#2c3e50]">1. Snakk om det</h2>
                <p class="text-sm text-[#2c3e50] opacity-70 py-3 ">Del erfaringer med andre, snakk om det som har skjedd</p>
              </div>
            </div>
            <!-- Arrow -->
            <div class="text-[#2c3e50]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="flex items-center justify-between gap-6 border-2 border-[#ACACAC]  rounded-xl px-6 py-15 min-h-[160px] max-w-xl mx-auto hover:shadow-md transition cursor-pointer">
            <div class="flex items-start gap-4">
              <div class="text-[#2c3e50]">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-brain-icon lucide-brain">
                  <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
                  <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
                  <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
                  <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
                  <path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/>
                  <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-[#2c3e50]">2. Mental helse</h2>
                <p class="text-sm text-[#2c3e50] opacity-70 py-3">Råd for å håndtere stress og etterreaksjoner</p>
              </div>
            </div>
            <div class="text-2xl font-bold text-[#2c3e50]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="flex items-center justify-between gap-6 border-2 border-[#ACACAC]  rounded-xl px-6 py-15 min-h-[160px] max-w-xl mx-auto hover:shadow-md transition cursor-pointer">
            <div class="flex items-start gap-4">
              <div class="text-[#2c3e50]">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lightbulb-icon lucide-lightbulb">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                  <path d="M9 18h6"/><path d="M10 22h4"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-[#2c3e50]">3. Lær og forbedre</h2>
                <p class="text-sm text-[#2c3e50] opacity-70 py-3">Evaluer beredskapen og gjør nødvendige endringer</p>
              </div>
            </div>
            <!-- Arrow -->
            <div class="text-[#2c3e50]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- STEP INDICATOR -->
    <div class="mt-10 flex items-center justify-center space-x-10 text-sm">
      <div class="flex flex-col items-center space-y-1 opacity-50">
        <div class="w-5 h-5 rounded-full border-2 border-gray-400"></div>
        <span>Før</span>
      </div>
      <div class="flex flex-col items-center space-y-1 opacity-50">
        <div class="w-5 h-5 rounded-full border-2 border-gray-400"></div>
        <span>Under</span>
      </div>
      <div class="flex flex-col items-center space-y-1">
        <div class="w-5 h-5 rounded-full bg-[#2c3e50]"></div>
        <span class="font-semibold">Etter</span>
      </div>
    </div>

  </section>
</template>
