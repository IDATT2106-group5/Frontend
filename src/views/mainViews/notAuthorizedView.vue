<script setup>
import { Home } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
    <Home class="w-20 h-20 text-red-600 mb-4" />

    <h1 class="text-2xl font-bold text-red-700 mb-2">Ingen tilgang</h1>
    <p class="text-gray-700 text-center mb-6">
      Du har ikke tilgang til denne siden. Kontakt en administrator dersom du mener dette er en feil.
    </p>

    <button
      @click="goHome"
      class="bg-gray-700 text-white px-5 py-2 rounded hover:bg-gray-800 transition"
    >
      Gå til forsiden
    </button>
  </div>
</template>
