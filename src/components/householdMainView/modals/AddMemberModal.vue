<script setup>
import { ref } from 'vue'
import { useHouseholdStore } from '@/stores/HouseholdStore'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'

const emit = defineEmits(['close'])
const store = useHouseholdStore()

const newMemberName = ref('')
const formError = ref('')
const addingMember = ref(false)

async function addMember() {
  if (!newMemberName.value) {
    formError.value = 'Vennligst fyll ut navn'
    return
  }
  if (newMemberName.value.length > 30) {
    formError.value = 'Navnet kan maks være 30 tegn langt'
    return
  }

  addingMember.value = true
  formError.value = ''

  try {
    const added = await store.addMember({
      name: newMemberName.value,
      fullName: newMemberName.value
    })

    toast({
      title: 'Medlem lagt til',
      description: `Bruker ${added.fullName} har blitt lagt til i husstanden.`,
      variant: 'success'
    })

    // Refresh household data so new member appears immediately
    await store.loadHouseholdData()

    newMemberName.value = ''
    emit('close')
  } catch (err) {
    formError.value = err instanceof Error ? err.message : String(err)
  } finally {
    addingMember.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <h3 class="text-xl font-bold mb-4">Legg til medlem</h3>

      <label for="memberName" class="block text-sm font-medium text-gray-700 mb-1">
        Navn på medlem
      </label>
      <input
        id="memberName"
        v-model="newMemberName"
        maxlength="30"
        placeholder="Navn på medlem"
        class="w-full px-3 py-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <p class="text-sm text-gray-600 mb-4">
        Dette vil legge til et ikke-registrert medlem i husstanden.<br />
        For å invitere registrerte brukere, bruk <strong>Send Invitasjon</strong>.
      </p>

      <p v-if="formError" class="text-red-500 text-sm mb-3">{{ formError }}</p>

      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="emit('close')">Avbryt</Button>
        <Button
          class="px-4 py-2 rounded text-white bg-[#27AE60] hover:bg-[#219653] disabled:opacity-50"
          :disabled="addingMember"
          @click="addMember"
        >
          {{ addingMember ? 'Legger til...' : 'Legg til medlem' }}
        </Button>
      </div>
    </div>
  </div>
</template>
