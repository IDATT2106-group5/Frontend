<script setup>
import { ref } from 'vue'
import { UserIcon, Mail, Trash2, Edit, Save, X, Phone } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useHouseholdStore } from '@/stores/HouseholdStore'

const householdStore = useHouseholdStore();

const props = defineProps({
  member: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['remove-member']);

const isEditing = ref(false);
const editName = ref('');
const editEmail = ref('');
const isSaving = ref(false);
const error = ref('');
const nameRegex = /^[A-Za-zæøåÆØÅ\s\-']+$/;

const startEdit = () => {
  editName.value = props.member.fullName;
  editEmail.value = props.member.email || '';
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  error.value = '';
};

const saveEdit = async () => {
  if (!editName.value) {
    error.value = 'Navn er påkrevd';
    return;
  }

  isSaving.value = true;
  error.value = '';

  try {
    if (!editName.value.trim()) {
      error.value = 'Navn kan ikke være tomt';
      return;
    }

    if (!nameRegex.test(editName.value)) {
      error.value = 'Navnet kan ikke inneholde tall eller spesialtegn';
      return;
    }
    
    await householdStore.updateUnregisteredMember(
      props.member.id,
      {
        name: editName.value,
        email: props.member.isRegistered ? editEmail.value : undefined
      },
      props.member.isRegistered
    );
    
    isEditing.value = false;
  } catch (err) {
    error.value = err.message || 'Kunne ikke oppdatere medlemmet';
  } finally {
    isSaving.value = false;
  }
};

const confirmRemove = async () => {
  try {
    if (confirm(`Er du sikker på at du vil fjerne ${props.member.fullName}?`)) {
      // Ensure we pass the member object with id property
      await householdStore.removeMember(props.member, props.member.isRegistered);
    }
  } catch (err) {
    console.error("Error removing member:", err);
    error.value = err.message || 'Kunne ikke fjerne medlemmet';
  }
};
</script>

<template>
  <div class="bg-white rounded-md shadow mb-2 overflow-hidden">
    <!-- Edit mode -->
    <div v-if="isEditing" class="p-4">
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
      <div class="flex items-center">
        <UserIcon class="h-5 w-5 text-gray-700 mr-3" />

        <div>
          <h3 class="font-medium">{{ member.fullName }}</h3>

          <p v-if="member.email" class="text-sm text-gray-600 flex items-center">
            <Mail class="w-4 h-4 mr-1" /> {{ member.email }}
          </p>

          <p v-if="member.tlf" class="text-sm text-gray-600 flex items-center">
            <Phone class="w-4 h-4 mr-1" /> {{ member.tlf }}
          </p>

          <p v-if="!member.email && !member.tlf" class="px-2 py-0.5 text-sm text-gray-500 bg-gray-100 border border-gray-300 rounded">
            Ikke registrert
          </p>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-2">
        <Button
          v-if="!member.isRegistered"
          variant="ghost"
          size="sm"
          @click="startEdit"
        >
          <Edit class="h-4 w-4" />
        </Button>

        <Button
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