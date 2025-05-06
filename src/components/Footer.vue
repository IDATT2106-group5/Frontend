<!-- src/components/Footer.vue -->
<template>
  <footer class="text-white text-sm">
    <!-- Top Blue Footer Section -->
    <div class="bg-[#2c3e50] px-8 py-10">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <!-- Logo  -->
        <div class="flex flex-col items-start">
          <img src="@/assets/icons/Krisefikser.png" alt="Krisefikser logo" class="w-28 object-contain bg-white rounded-full p-1" />
          <p>Alltid vær beredt.</p>
        </div>

        <!-- Meny -->
        <div>
          <p class="uppercase font-bold mb-3 text-xs tracking-wider">Meny</p>
          <p class="mb-1">Nyheter</p>
          <RouterLink to="/map" class="mb-1 hover:underline block">Kart</RouterLink>
          <p class="mb-1">Min beholdning</p>
          <RouterLink to="/household" class="mb-1 hover:underline block">Min husstand</RouterLink>
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
          <RouterLink to="/personvern" class="mb-1 hover:underline block">Personvern</RouterLink>
          <p class="mb-1">Har du spørsmål?</p>
          <p class="font-bold">Kontakt oss</p>
        </div>
      </div>
    </div>

    <!-- Bottom Black Bar -->
    <div class="bg-black text-white text-xs text-center py-4">
      <div class="flex justify-center space-x-4">
        <span class="hover:underline cursor-pointer">Om oss</span>
        <span>|</span>
        <router-link to="/personvern" class="hover:underline">Personvern</router-link>
      </div>
    </div>
  </footer>
</template>

<script setup>

</script>
