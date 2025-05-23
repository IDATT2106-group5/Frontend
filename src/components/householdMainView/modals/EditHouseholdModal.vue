<script setup>
import { ref, watchEffect } from 'vue'
import { useHouseholdStore } from '@/stores/HouseholdStore'
import { toast } from '@/components/ui/toast'

const emit = defineEmits(['close'])
const store = useHouseholdStore()

const name = ref('')
const address = ref('')
const error = ref('')
const loading = ref(false)

// Maximum length for household name and address
const MAX_NAME_LENGTH = 20
const MAX_ADDRESS_LENGTH = 50

// Keep local values synced with the current household
watchEffect(() => {
  if (store.currentHousehold) {
    name.value = store.currentHousehold.name || ''
    address.value = store.currentHousehold.address || ''
  }
})

async function save() {
  if (!name.value) {
    error.value = 'Vennligst fyll ut navn'
    return
  }

  if (name.value.length > MAX_NAME_LENGTH || address.value.length > MAX_ADDRESS_LENGTH) {
    error.value = `Navn kan maks være ${MAX_NAME_LENGTH} tegn, adresse maks ${MAX_ADDRESS_LENGTH} tegn`
    return
  }

  if (!store.currentHousehold) {
    error.value = 'Ingen husstand å oppdatere'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await store.updateHousehold({
      id: store.currentHousehold.id,
      name: name.value,
      address: address.value
    })

    await store.checkCurrentHousehold() 

    toast({
      title: 'Husstand oppdatert',
      description: `Navn: ${name.value}${address.value ? `, Adresse: ${address.value}` : ''}`,
      variant: 'success'
    })

    emit('close')
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    error.value = msg

    toast({
      title: 'Feil under oppdatering',
      description: msg,
      variant: 'destructive'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
      <h3 class="text-xl font-semibold">Rediger husstand</h3>

      <div>
        <input
          v-model="name"
          type="text"
          placeholder="Navn på husstand"
          :maxlength="MAX_NAME_LENGTH"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div class="text-xs text-gray-500 mt-1 flex justify-between">
          <span>Maks {{ MAX_NAME_LENGTH }} tegn</span>
          <span>{{ name.length }}/{{ MAX_NAME_LENGTH }}</span>
        </div>
      </div>

      <div>
        <input
          v-model="address"
          type="text"
          placeholder="Adresse (valgfri)"
          :maxlength="MAX_ADDRESS_LENGTH"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div class="text-xs text-gray-500 mt-1 flex justify-between">
          <span>Maks {{ MAX_ADDRESS_LENGTH }} tegn</span>
          <span>{{ address.length }}/{{ MAX_ADDRESS_LENGTH }}</span>
        </div>
      </div>

      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>

      <div class="flex justify-end space-x-2">
        <button @click="emit('close')" class="px-3 py-1 border rounded hover:bg-gray-100">
          Avbryt
        </button>
        <button
          @click="save"
          :disabled="loading"
          class="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loading ? 'Lagrer…' : 'Lagre' }}
        </button>
      </div>
    </div>
  </div>
</template>
