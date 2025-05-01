<script setup>
import { ref } from "vue"
import { useUserStore } from "@/stores/UserStore"
import { useRouter } from "vue-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const props = defineProps({
  email: {
    type: String,
    required: true
  }
})

const router = useRouter()
const userStore = useUserStore()
const code = ref(['', '', '', '', '', ''])

// Function to focus next input field after entering a digit
const focusNext = (index, event) => {
  if (/^\d$/.test(event.target.value)) {
    // Move to next field if not the last one
    if (index < 5) {
      document.getElementById(`code-${index + 1}`).focus()
    }
  }
}


/**
 * Handles the submission event for the form.
 * This function is triggered when the form is submitted.
 *
 * @param {Event} event - The event object associated with the form submission.
 * @returns {Promise<void>} A promise that resolves when the submission process is complete.
 */
async function onSubmit(event) {
  event.preventDefault()
  const fullCode = code.value.join('')
  userStore.error = null

  try {
    const resp = await userStore.verify2FA({ email: props.email, otp: fullCode })

    if (resp) {
      router.push("/")
    } else if (!userStore.error) {
      userStore.error = "Ugyldig kode. Prøv igjen."
    }
  } catch (error) {
    console.error("2FA verification failed:", error)

    if (!userStore.error) {
      userStore.error = "Kunne ikke verifisere koden. Prøv igjen senere."
    }
  }
}

// Function to request a new code
async function resendCode() {
  try {
    // PSUDO Code
    // await userStore.resend2FACode(props.email)
    alert("En ny kode har blitt sendt til din e-post")
  } catch (error) {
    console.error("Failed to resend code:", error)
  }
}
</script>

<template>
  <main class="flex flex-col items-center justify-center min-h-screen p-4 space-y-3">
    <img src="/src/assets/icons/Krisefikser.png" alt="Krisefikser Logo" class="w-60 mb-4" />
    <h1 class="text-3xl font-bold">To-faktor autentisering</h1>

    <p class="text-gray-600 mt-2 mb-4">
      Skriv inn koden sendt til {{ props.email || 'admin@krisefikser.no' }}
    </p>

    <div v-if="userStore.error" class="w-full max-w-sm p-3 rounded bg-red-100 text-red-700 mb-2 text-center">
      {{ userStore.error }}
    </div>

    <form @submit="onSubmit" class="w-full max-w-sm space-y-6">
      <div class="flex justify-center space-x-2">
        <Input
          v-for="(digit, index) in code"
          :key="index"
          :id="`code-${index}`"
          v-model="code[index]"
          type="text"
          maxlength="1"
          class="w-16 h-16 text-2xl text-center"
          @input="focusNext(index, $event)"
        />
      </div>

      <div class="flex justify-center">
        <Button type="submit" class="w-full bg-black text-white">Bekreft</Button>
      </div>

      <div class="text-center text-sm text-gray-600">
        <p>Har du ikke mottatt koden?</p>
        <button
          @click.prevent="resendCode"
          class="text-blue-600 hover:underline mt-1"
        >
          Send kode på nytt
        </button>
      </div>
    </form>
  </main>
</template>


