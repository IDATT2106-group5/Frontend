<!-- src/views/RegisterSuccessView.vue -->
<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
    <RouterLink to="/" class="absolute top-4 left-6">
      <img src="/src/assets/icons/Krisefikser.png" alt="Krisefikser Logo" class="w-12 hover:opacity-80" />
    </RouterLink>
    <h1 class="text-3xl font-bold text-green-600 mb-4">Registrering vellykket!</h1>
    <p class="text-gray-700 text-center">Epostadressen din har blitt registrert</p>
    <router-link to="/login" class="mt-6 text-blue-600 hover:underline">Tilbake til innlogging</router-link>
  </div>
</template>

<script setup>
</script>
