<script setup>
import { ref } from "vue"
import { Mail, Lock, Eye, EyeOff, Loader } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUserStore } from "@/stores/UserStore"
import { useRouter, RouterLink } from "vue-router"

const showPassword = ref(false)
const loginError = ref("")
const isSubmitting = ref(false)  
const userStore = useUserStore()
const router = useRouter()

/**
 * Handles form submission for logging in a user.
 * Prevents double submissions, extracts credentials, attempts login,
 * and navigates or displays an error based on the result.
 * 
 * @param {Event} event - The submit event from the login form.
 */
async function onSubmit(event) {
  event.preventDefault()
  if (isSubmitting.value) return        
  isSubmitting.value = true
  loginError.value = ""

  const formData = new FormData(event.target)
  const credentials = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  try {
    const resp = await userStore.login(credentials)

    if (resp) {
      router.push("/")
    } else {
      loginError.value = "Feil e-post eller passord."
    }
  } catch (error) {
    console.error("Login failed:", error)
    loginError.value = "Innlogging feilet. Sjekk brukernavn eller passord."
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="flex flex-col items-center justify-center min-h-screen p-4 space-y-3 relative bg-white">
    <!-- Logo link top left -->
    <RouterLink to="/" class="absolute top-4 left-6">
      <img src="/src/assets/icons/Krisefikser.png" alt="Krisefikser Logo" class="w-12 hover:opacity-80" />
    </RouterLink>

    <!-- Centered logo -->
    <img src="/src/assets/icons/Krisefikser.png" alt="Krisefikser Logo" class="w-60 mb-4" />
    <h1 class="text-3xl font-bold">Login</h1>

    <!-- Error message -->
    <div v-if="loginError" class="w-full max-w-sm bg-red-100 text-red-700 border border-red-300 rounded p-3 text-sm text-center">
      {{ loginError }}
    </div>

    <!-- Login form -->
    <form @submit="onSubmit" class="w-full max-w-sm space-y-4">
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

      <div class="flex justify-between gap-2">
        <Button
          type="submit"
          class="w-1/2 bg-black text-white h-10 flex items-center justify-center"
          :disabled="userStore.isLoading || isSubmitting"
        >
          <Loader
            v-if="userStore.isLoading || isSubmitting"
            class="h-4 w-4 mr-2 animate-spin"
            aria-hidden="true"
          />
          <span>
            {{ (userStore.isLoading || isSubmitting) ? 'Logger inn...' : 'Login' }}
          </span>
        </Button>

        <RouterLink
          v-if="!(userStore.isLoading || isSubmitting)"
          to="/register"
          class="w-1/2 text-center border-2 border-gray-300 bg-white text-black hover:bg-gray-300 rounded h-10 flex items-center justify-center"
        >
          Registrer
        </RouterLink>
        <span
          v-else
          class="w-1/2 text-center border-2 border-gray-300 bg-gray-100 text-gray-400 rounded h-10 flex items-center justify-center cursor-not-allowed"
        >
          Registrer
        </span>
      </div>

      <div class="flex items-center justify-between text-sm">
        <label class="flex items-center gap-2">
          <input type="checkbox" class="accent-black" />
          Husk meg
        </label>
        <RouterLink to="/request-reset" class="text-gray-800 hover:underline">
          Glemt passord?
        </RouterLink>
      </div>
    </form>
  </main>
</template>
