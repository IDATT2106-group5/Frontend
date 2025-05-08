<script setup>
import { useRouter } from 'vue-router'

/** Vue Router instance for navigation */
const router = useRouter()

/**
 * Navigates to the home page when the logo is clicked.
 *
 * @returns {void}
 */
 const goToHome = () => {
  router.push('/')
}
</script>

<template>
  <footer class="text-white text-sm">
    <div class="bg-[#2c3e50] px-8 py-10">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <!-- Logo  -->
        <div class="flex flex-col items-start">
          <img
            src="@/assets/icons/Krisefikser.png"
            alt="Krisefikser logo"
            class="w-28 object-contain bg-white rounded-full p-1 cursor-pointer"
            @click="goToHome"
          />
          <p>Alltid vær beredt.</p>
        </div>

        <!-- Meny -->
        <div>
          <p class="uppercase font-bold mb-3 text-xs tracking-wider">Meny</p>
          <RouterLink to="/nyheter" class="mb-1 hover:underline block">Nyheter</RouterLink>
          <RouterLink to="/map" class="mb-1 hover:underline block">Kart</RouterLink>
          <RouterLink to="/storage" class="mb-1 hover:underline block">Beholdning</RouterLink>
          <RouterLink to="/household" class="mb-1 hover:underline block">Husstand</RouterLink>
        </div>

        <!-- Beredskap -->
        <div>
          <p class="uppercase font-bold mb-3 text-xs tracking-wider">Beredskap</p>
          <RouterLink to="/before" class="mb-1 hover:underline block">Før</RouterLink>
          <RouterLink to="/under" class="mb-1 hover:underline block">Under</RouterLink>
          <RouterLink to="/after" class="hover:underline block">Etter</RouterLink>
        </div>

        <!-- Info -->
        <div>
          <p class="uppercase font-bold mb-3 text-xs tracking-wider">Info</p>
          <RouterLink to="/questions" class="mb-1 hover:underline block">Har du spørsmål?</RouterLink>
          <RouterLink to="/contact" class="mb-1 hover:underline block">Kontakt oss</RouterLink>
        </div>
      </div>
    </div>

    <!-- Bottom Black Bar -->
    <div class="bg-black text-white text-xs text-center py-4">
      <div class="flex justify-center space-x-4">
        <RouterLink to="/about" class="mb-1 hover:underline block">Om oss</RouterLink>
        <span>|</span>
        <router-link to="/personvern" class="hover:underline">Personvern</router-link>
      </div>
    </div>
  </footer>
</template>
