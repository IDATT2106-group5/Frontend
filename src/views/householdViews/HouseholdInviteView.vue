<script setup>
import { ref } from 'vue'

const email = ref('')
const invitationSent = ref(false)

function sendInvitation() {
  invitationSent.value = true
}

function finish() {
  invitationSent.value = false
  email.value = ''
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
      <div v-if="!invitationSent" class="space-y-6">
        <h1 class="text-2xl font-bold">Inviter person</h1>

        <div class="flex flex-col items-start w-full">
          <label for="email" class="text-sm font-semibold text-[#2c3e50] mb-2">E-post</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="w-full border-2 border-[#2c3e50] rounded-lg p-2 focus:outline-none"
            placeholder="eksempel@email.com"
          />
        </div>

        <button
          class="w-full bg-[#2c3e50] text-white py-2 rounded-lg font-semibold hover:bg-[#243746]"
          @click="sendInvitation"
        >
          Send Invitasjon
        </button>
      </div>

      <div v-else class="space-y-6">
        <div class="flex justify-center">
          <div class="bg-green-500 rounded-full p-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 class="text-2xl font-bold">Invitasjon sendt til:</h1>
        <p class="text-[#2c3e50] font-bold">{{ email }}</p>
        
        <button
          class="w-full bg-[#2c3e50] text-white py-2 rounded-lg font-semibold hover:bg-[#243746]"
          @click="finish"
        >
          Ferdig
        </button>
      </div>
    </div>
  </div>
</template>
