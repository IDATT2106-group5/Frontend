<!-- src/views/RegisterSuccessView.vue -->
<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
    <h1 class="text-3xl font-bold text-green-600 mb-4">Registrering vellykket!</h1>
    <p class="text-gray-700 text-center">En bekreftelseslenke er sendt til e-posten din.<br>Vennligst sjekk innboksen din.</p>
    <router-link to="/login" class="mt-6 text-blue-600 hover:underline">Tilbake til innlogging</router-link>
  </div>
</template>

<script setup>
</script>
