<script setup>
import { ref } from "vue"
import { useUserStore } from "@/stores/UserStore"
import { useRouter } from "vue-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ConfirmModal from '@/components/householdMainView/modals/ConfirmModal.vue'

const props = defineProps({
  email: String,
  emailMissing: Boolean
})

const router = useRouter()
const userStore = useUserStore()
const code = ref(['', '', '', '', '', ''])

const showResendConfirmModal = ref(false)
if (props.emailMissing) {
  router.replace('/login');
}

// Function to focus next input field after entering a digit
const focusNext = (index, event) => {
  if (/^\d$/.test(event.target.value)) {
    // Move to next field if not the last one
    if (index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
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

/**
 * Opens the resend confirmation modal
 */
function openResendModal() {
  showResendConfirmModal.value = true
}

/**
 * Resends the two-factor authentication (2FA) code to the user.
 * Only executed after confirmation.
 *
 * @async
 * @returns {Promise<void>} Resolves when the code is successfully resent.
 */
async function resendCode() {
  showResendConfirmModal.value = false

  try {
    await userStore.resend2FACode(props.email)
  } catch (error) {
    console.error("Failed to resend code:", error)
    userStore.error = "Kunne ikke sende ny kode. Prøv igjen senere."
  }
}

/**
 * Cancel the resend operation
 */
function cancelResend() {
  showResendConfirmModal.value = false
}

</script>

<template>
  <main class="flex flex-col items-center justify-center min-h-screen p-4 space-y-3 bg-white">
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
        <Button type="submit" :disabled="userStore.isLoading" class="w-full bg-black text-white">Bekreft</Button>
      </div>

      <div class="text-center text-sm text-gray-600">
        <p>Har du ikke mottatt koden?</p>
        <button
          @click.prevent="openResendModal"
          class="text-blue-600 hover:underline mt-1"
        >
          Send kode på nytt
        </button>
      </div>
    </form>

    <ConfirmModal
      v-if="showResendConfirmModal"
      title="Send kode på nytt"
      description="Er du sikker på at du vil sende en ny kode til din e-post?"
      confirmText="Send"
      cancelText="Avbryt"
      @confirm="resendCode"
      @cancel="cancelResend"
    />
  </main>
</template>
