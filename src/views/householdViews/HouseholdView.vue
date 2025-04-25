<script setup>
import { User } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
</script>


<template>
  <div class="min-h-screen flex flex-col items-center justify-start p-6 bg-gradient-to-b from-white to-gray-100">
    <!-- Header -->
    <div class="flex items-center gap-2 text-lg font-semibold text-blue-950 mb-6">
      <User class="w-6 h-6" />
      <span>Medlemmer i husstanden : <span class="font-bold">8</span></span>
    </div>

    <!-- Member List -->
    <div class="w-full max-w-md space-y-4">

      <!-- Registered member (dropdown) -->
      <div class="flex items-center justify-between border rounded-lg px-4 py-2 bg-white shadow-sm">
        <div class="font-medium text-blue-950">Ola Nordmann</div>
        <Button variant="outline" class="bg-blue-900 text-white hover:bg-blue-950">Fjern</Button>
      </div>

      <!-- Registered member (detailed card) -->
      <div class="border rounded-lg p-4 shadow-sm bg-white space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-700">test@hotmail.com</span>
          <Button variant="outline" class="bg-blue-900 text-white hover:bg-blue-950 text-xs px-3 py-1">Registrert</Button>
        </div>
        <div class="text-sm text-gray-600">+123456789</div>
      </div>

      <!-- Repeating members -->
      <div class="flex items-center justify-between border rounded-lg px-4 py-2 bg-white shadow-sm" v-for="n in 4" :key="n">
        <div class="font-medium text-blue-950">Ola Nordmann</div>
        <Button variant="outline" class="bg-blue-900 text-white hover:bg-blue-950">Fjern</Button>
      </div>

      <!-- New unregistered member row -->
      <div class="border border-red-500 rounded-lg px-4 py-2 bg-white shadow-sm flex justify-between items-center text-red-600">
        <div class="font-medium">Ola Nordmann</div>
        <Button variant="outline" class="text-red-600 border-red-500 hover:bg-red-100">Fjern</Button>
      </div>

      <!-- Unregistered status + Add button -->
      <div class="flex flex-col items-center gap-2">
        <span class="text-xs text-white bg-red-500 px-2 py-1 rounded-full">Ikke registrert</span> 
        <Button variant="outline" class="bg-blue-900 text-white hover:bg-blue-950">Legg til medlem</Button>
      </div>
    </div>

    <!-- Send Invitation -->
    <Button class="mt-8 bg-blue-900 text-white hover:bg-blue-950 text-sm">+ Send Invitasjon</Button>
  </div>
</template>

