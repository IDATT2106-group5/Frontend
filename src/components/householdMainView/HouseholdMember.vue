<script setup>
import { ref } from 'vue'
import { Crown, UserIcon, Mail, Edit, Save, X, Phone } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { useHouseholdStore } from '@/stores/HouseholdStore'

const householdStore = useHouseholdStore()

const props = defineProps({
  member: {
    type: Object,
    required: true
  },
  isOwner: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['remove-member'])

const isEditing = ref(false)
const editName = ref('')
const editEmail = ref('')
const isSaving = ref(false)
const error = ref('')
const nameRegex = /^[A-Za-zæøåÆØÅ\s\-']+$/

const startEdit = () => {
  editName.value = props.member.fullName
  editEmail.value = props.member.email || ''
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  error.value = ''
}

const saveEdit = async () => {
  if (!editName.value.trim()) {
    error.value = 'Navn er påkrevd'
    return
  }

  if (!nameRegex.test(editName.value)) {
    error.value = 'Navnet kan ikke inneholde tall eller spesialtegn'
    return
  }

  isSaving.value = true
  error.value = ''

  try {
    await householdStore.updateUnregisteredMember(
      props.member.id,
      {
        name: editName.value,
        email: props.member.isRegistered ? editEmail.value : undefined
      },
      props.member.isRegistered
    )

    toast({
      title: 'Medlem oppdatert',
      description: `${editName.value} ble oppdatert.`,
      variant: 'success'
    })

    isEditing.value = false
  } catch (err) {
    error.value = err.message || 'Kunne ikke oppdatere medlemmet'
    toast({
      title: 'Feil',
      description: error.value,
      variant: 'destructive'
    })
  } finally {
    isSaving.value = false
  }
}

const confirmRemove = async () => {
  if (!confirm(`Er du sikker på at du vil fjerne ${props.member.fullName}?`)) return

  try {
    await householdStore.removeMember(props.member, props.member.isRegistered)

    toast({
      title: 'Medlem fjernet',
      description: `${props.member.fullName} er fjernet fra husstanden.`,
      variant: 'success'
    })
  } catch (err) {
    const message = err.message || 'Kunne ikke fjerne medlemmet'
    error.value = message
    toast({
      title: 'Feil',
      description: message,
      variant: 'destructive'
    })
  }
}
</script>

<template>
  <div class="bg-white rounded-md shadow mb-2 overflow-hidden">
    <!-- Edit mode -->
    <div v-if="isEditing && householdStore.isCurrentUserOwner" class="p-4">
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Navn</label>
          <input
            v-model="editName"
            placeholder="Navn"
            class="w-full px-3 py-2 border rounded"
          />
        </div>

        <div class="flex justify-end gap-2">
          <Button variant="outline" size="sm" @click="cancelEdit">
            <X class="h-4 w-4 mr-1" /> Avbryt
          </Button>
          <Button size="sm" :disabled="isSaving" @click="saveEdit">
            <Save class="h-4 w-4 mr-1" /> Lagre
          </Button>
        </div>

        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      </div>
    </div>

    <!-- View mode -->
    <div v-else class="flex items-center justify-between p-4">
      <div class="flex items-start flex-1 min-w-0">
        <UserIcon class="h-5 w-5 text-gray-700 mr-3 mt-1 flex-shrink-0" />
        <div class="max-w-full overflow-hidden">
          <div class="font-medium text-[#2C3E50] flex items-center gap-1">
            <span class="truncate max-w-[150px] sm:max-w-[250px] md:max-w-xs">{{ member.fullName }}</span>
            <Crown
              v-if="isOwner"
              class="w-4 h-4 text-yellow-500 flex-shrink-0"
              title="Husstandseier"
            />
          </div>
          <p v-if="member.email" class="text-sm text-gray-600 flex items-center">
            <Mail class="w-4 h-4 mr-1 flex-shrink-0" /> 
            <span class="truncate max-w-[150px] sm:max-w-[250px] md:max-w-xs">{{ member.email }}</span>
          </p>
          <p v-if="member.tlf" class="text-sm text-gray-600 flex items-center">
            <Phone class="w-4 w-4 mr-1 flex-shrink-0" /> 
            <span class="truncate max-w-[150px] sm:max-w-[250px] md:max-w-xs">{{ member.tlf }}</span>
          </p>
          <p
            v-if="!member.email && !member.tlf"
            class="flex-shrink-0 w-32 text-center px-3 py-1 text-sm text-gray-500 bg-gray-100 border border-gray-300 rounded whitespace-nowrap"
          >
            Ikke registrert
          </p>
        </div>
      </div>

      <!-- Owner-only actions -->
      <div v-if="householdStore.isCurrentUserOwner" class="flex items-center gap-2 flex-shrink-0 ml-4">
        <Button
          v-if="!member.isRegistered && !isOwner"
          variant="ghost"
          size="sm"
          @click="startEdit"
        >
          <Edit class="h-4 w-4" />
        </Button>
        <Button
          v-if="!isOwner"
          variant="outline"
          class="text-red-600 border-red-500 hover:bg-red-50"
          size="sm"
          @click="confirmRemove"
        >
          Fjern
        </Button>
      </div>
    </div>
  </div>
</template>