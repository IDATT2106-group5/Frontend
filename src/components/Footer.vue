<!-- src/components/Footer.vue -->
<template>
  <footer class="text-white text-sm">
    <!-- Top Blue Footer Section -->
    <div class="bg-[#374151] px-8 py-10">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <!-- Logo  -->
        <div class="flex flex-col items-start">
          <img src="@/assets/icons/Krisefikser.png" alt="Krisefikser logo" class="w-28 bg-gray-300 first-letter:mb-4 rounded" />
          <p>Alltid vær beredt.</p>
        </div>

        <!-- Meny -->
        <div>
          <p class="uppercase font-bold mb-3 text-xs tracking-wider">Meny</p>
          <p class="mb-1">Nyheter</p>
          <p class="mb-1">Kart</p>
          <p class="mb-1">Min beholdning</p>
          <p class="mb-1">Min husstand</p>
          <p>Logg inn</p>
        </div>

        <!-- Beredskap -->
        <div>
          <p class="uppercase font-bold mb-3 text-xs tracking-wider">Beredskap</p>
          <p class="mb-1">Før</p>
          <p class="mb-1">Under</p>
          <p>Etter</p>
        </div>

        <!-- Info -->
        <div>
          <p class="uppercase font-bold mb-3 text-xs tracking-wider">Info</p>
          <p class="mb-1">Personvern</p>
          <p class="mb-1">Har du spørsmål?</p>
          <p class="font-bold">Kontakt oss</p>
        </div>
      </div>
    </div>

    <!-- Bottom Black Bar -->
    <div class="bg-black text-white text-xs text-center py-4">
      Om oss | Personvern | Vilkår
    </div>
  </footer>
</template>

<script setup>

</script>
