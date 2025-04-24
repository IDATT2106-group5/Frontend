<script setup>
import { ref } from "vue"
import { Mail, Lock, Eye, EyeOff } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const showPassword = ref(false)

function onSubmit(event) {
  event.preventDefault()
  const formData = new FormData(event.target)
  console.log("Email:", formData.get("email"))
  console.log("Password:", formData.get("password"))
}
</script>

<template>
  <main class="flex flex-col items-center justify-center min-h-screen p-4 space-y-3">
    <img src="/src/assets/icons/Krisefikser.png" alt="Krisefikser Logo" class="w-60 mb-4" />
    <h1 class="text-3xl font-bold">Login</h1>

    <form @submit="onSubmit" class="w-full max-w-sm space-y-4">
      <!-- Email input -->
      <div class="relative">
        <Mail class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          class="pl-10"
          name="email"
          type="email"
          placeholder="Epost"
          required
        />
      </div>

      <!-- Password input -->
      <div class="relative">
        <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          class="pl-10 pr-10"
          :type="showPassword ? 'text' : 'password'"
          name="password"
          placeholder="Passord"
          required
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        >
          <component :is="showPassword ? EyeOff : Eye" />
        </button>
      </div>

      <!-- Buttons -->
      <div class="flex justify-between gap-2">
        <Button type="submit" class="w-1/2 bg-black text-white">Login</Button>
        <Button type="button" class="w-1/2 border bg-white text-black border hover:bg-gray-300" >Registrer</Button>

      </div>

      <!-- Checkbox and forgot -->
      <div class="flex items-center justify-between text-sm">
        <label class="flex items-center gap-2">
          <input type="checkbox" class="accent-black" />
          Husk meg
        </label>
        <a href="#" class="text-gray-800 hover:underline">Glemt passord?</a>
      </div>
    </form>
  </main>
</template>
