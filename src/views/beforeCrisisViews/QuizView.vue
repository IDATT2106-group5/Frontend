<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BeforeStepIndicator from '@/components/BeforeStepIndicator.vue'

/** Vue Router instance for programmatic navigation */
const router = useRouter()

/**
 * Navigates to the 'before' overview route.
 *
 * @returns {void}
 */
const goToOverview = () => router.push('/before')

/**
 * Quiz question data.
 * Each object contains a question, multiple choice options, and the correct answer.
 * 
 * @type {Array<{ question: string, options: string[], correct: string }>}
 */
const questions = [
  {
    question: 'Hvor mye vann bør du ha per person per dag i en nødsituasjon?',
    options: ['1 liter', '2 liter', '3 liter'],
    correct: '3 liter',
  },
  {
    question: 'Hva bør en nødsekk inneholde?',
    options: ['Verktøy og klokke', 'Klær og sovepose', 'Bøker og godteri'],
    correct: 'Klær og sovepose',
  },
  {
    question: 'Hva slags radio bør du ha tilgjengelig i en krisesituasjon?',
    options: ['Internett-radio', 'FM-radio', 'Batteridrevet DAB-radio'],
    correct: 'Batteridrevet DAB-radio',
  },
  {
    question: 'Hvor lenge bør beredskapslageret minimum holde deg med mat og vann?',
    options: ['1 dag', '3 dager', '7 dager'],
    correct: '3 dager',
  },
  {
    question: 'Hva er nødnummeret til politiet i Norge?',
    options: ['112', '110', '113'],
    correct: '112',
  },
  {
    question: 'Hva bør du gjøre under et jordskjelv hvis du er innendørs?',
    options: [
      'Stå i døråpningen og rop etter hjelp',
      'Løpe ut av bygningen så fort som mulig',
      'Søke dekning under et stabilt møbel og beskytte hodet og nakken'
    ],
    correct: 'Søke dekning under et stabilt møbel og beskytte hodet og nakken',
  },
  {
    question: 'Hva bør du gjøre hvis du må evakuere en bygning som brenner?',
    options: [
      'Bruke heisen for å komme deg raskere ut',
      'Holde deg lavt og bruke trappene for å unngå røyk',
      'Gå tilbake for å hente personlige eiendeler',
    ],
    correct: 'Holde deg lavt og bruke trappene for å unngå røyk',
  },
  {
    question: 'Hvorfor bør du lukke dører bak deg når du evakuerer en bygning i brann?',
    options: [
      'For å unngå å miste varme',
      'For å hindre spredning av flammer og røyk',
      'For å gjøre det lettere å finne veien tilbake',
    ],
    correct: 'For å hindre spredning av flammer og røyk',
  },
  {
    question: 'Hva er formålet med en beredskapsplan?',
    options: [
      'Å hindre deg i å få panikk',
      'Å vite hva du skal gjøre i ulike krisesituasjoner',
      'Å ha kontroll på økonomien din',
    ],
    correct: 'Å vite hva du skal gjøre i ulike krisesituasjoner',
  },
  {
    question: 'Hvor kan du finne offisiell informasjon under kriser?',
    options: ['YouTube', 'DSB.no', 'Facebook'],
    correct: 'DSB.no',
  },
]

const currentQuestion = ref(0)
const selectedAnswer = ref(null)
const score = ref(0)
const hasSubmitted = ref(false)
const isCorrect = ref(false)

/**
 * Sets the user's selected answer for the current question.
 *
 * @param {string} option - The selected answer option.
 * @returns {void}
 */
const selectOption = (option) => {
  selectedAnswer.value = option
}

/**
 * Submits the selected answer and checks if it's correct.
 * Updates the score if the answer is right.
 *
 * @returns {void}
 */
const submitAnswer = () => {
  if (!selectedAnswer.value) return
  hasSubmitted.value = true
  isCorrect.value = selectedAnswer.value === questions[currentQuestion.value].correct
  if (isCorrect.value) score.value++
}

/**
 * Moves to the next question and resets state.
 *
 * @returns {void}
 */
const nextQuestion = () => {
  selectedAnswer.value = null
  hasSubmitted.value = false
  currentQuestion.value++
}
</script>

<template>
  <section class="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-16">
    <div class="max-w-3xl w-full">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Test deg selv</h1>
      <p class="text-gray-700 mb-8">Ta en quiz og test kunnskapen din om beredskap.</p>

      <div class="bg-white border border-gray-300 rounded-lg shadow p-6 space-y-6">
        <div v-if="currentQuestion < questions.length">
          <div class="text-gray-800 text-base">
            <p class="font-semibold mb-1">Spørsmål {{ currentQuestion + 1 }}:</p>
            <p class="text-sm text-gray-500 mb-2">{{ currentQuestion + 1 }} / {{ questions.length }}</p>
            <p>{{ questions[currentQuestion].question }}</p>
          </div>

          <div class="space-y-2 mt-4">
            <label
              v-for="option in questions[currentQuestion].options"
              :key="option"
              class="block cursor-pointer"
            >
              <input
                type="radio"
                :value="option"
                v-model="selectedAnswer"
                :disabled="hasSubmitted"
                class="mr-2"
              />
              {{ option }}
            </label>
          </div>

          <div class="mt-6">
            <button
              v-if="!hasSubmitted"
              @click="submitAnswer"
              class="px-6 py-3 border-2 border-[#2c3e50] text-[#2c3e50] rounded-lg hover:bg-[#2c3e50] hover:text-white transition"
            >
              Sjekk svar
            </button>

            <div v-else class="space-y-4">
              <p :class="isCorrect ? 'text-green-600' : 'text-red-600'">
                {{ isCorrect ? 'Riktig!' : 'Feil. Riktig svar: ' + questions[currentQuestion].correct }}
              </p>
              <button
                v-if="currentQuestion < questions.length - 1"
                @click="nextQuestion"
                class="px-6 py-3 border-2 border-[#2c3e50] text-[#2c3e50] rounded-lg hover:bg-[#2c3e50] hover:text-white transition"
              >
                Neste spørsmål
              </button>
              <button
                v-else
                @click="currentQuestion++"
                class="px-6 py-3 border-2 border-[#2c3e50] text-[#2c3e50] rounded-lg hover:bg-[#2c3e50] hover:text-white transition"
              >
                Se resultat
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center text-gray-800">
          <p class="text-xl font-semibold mb-2">Du er ferdig!</p>
          <p class="mb-4">Du fikk {{ score }} av {{ questions.length }} riktige svar.</p>
          <button
            @click="router.go(0)"
            class="px-6 py-3 border-2 border-[#2c3e50] text-[#2c3e50] rounded-lg hover:bg-[#2c3e50] hover:text-white transition"
          >
            Ta quizen på nytt
          </button>
        </div>
      </div>
    </div>

    <div class="mt-16 w-full flex flex-col items-center gap-4">
      <BeforeStepIndicator :currentStep="2" />
      <button
        @click="goToOverview"
        class="flex items-center gap-2 text-[#2c3e50] hover:underline text-sm"
      >
        <span class="text-xl">←</span> Oversikt
      </button>
    </div>
  </section>
</template>