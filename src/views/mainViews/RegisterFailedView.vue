<!-- src/views/RegisterFailedView.vue -->
<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
    <RouterLink to="/" class="absolute top-4 left-6">
      <img src="/src/assets/icons/Krisefikser.png" alt="Krisefikser Logo" class="w-12 hover:opacity-80" />
    </RouterLink>
    <h1 class="text-3xl font-bold text-red-600 mb-4">Registrering feilet</h1>
    <p class="text-gray-700 text-center">Det oppstod en feil under registrering.<br>Vennligst prøv igjen senere.</p>
    <router-link to="/register" class="mt-6 text-blue-600 hover:underline">Prøv å registrere deg på nytt</router-link>
  </div>
</template>

