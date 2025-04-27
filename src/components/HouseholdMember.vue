<script setup>
import { ref } from 'vue'
import { ChevronDown, Edit2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  isRegistered: {
    type: Boolean,
    default: true
  },
  expandable: {
    type: Boolean,
    default: false
  },
  index: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update'])

const isOpen = ref(false)
const isEditing = ref(false)
const editedName = ref(props.name)

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  editedName.value = props.name
}

const saveEdit = () => {
  if (editedName.value.trim()) {
    emit('update', props.index, { name: editedName.value })
    isEditing.value = false
  }
}
</script>

<template>
  <template v-if="expandable">
    <div class="border rounded-lg bg-white shadow-sm" :class="{ 'border-red-500': !isRegistered }">
      <div
        class="w-full flex items-center justify-between px-4 py-2 cursor-pointer"
        @click="isOpen = !isOpen"
      >
        <div class="flex items-center gap-2" :class="isRegistered ? 'text-blue-950' : 'text-red-600'">
          <span class="font-medium">{{ name }}</span>
          <ChevronDown 
            class="h-4 w-4 transition-transform duration-200"
            :class="{ 'transform rotate-180': isOpen }"
          />
        </div>
        <Button 
          variant="outline"
          :class="isRegistered ? 'bg-blue-900 text-white hover:bg-blue-700' : 'text-red-600 border-red-500 hover:bg-red-100'"
          class="text-sm"
        >
          Fjern
        </Button>
      </div>
      
      <div v-show="isOpen" class="p-4 bg-white border-t rounded-b-lg space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-700">{{ email }}</span>
          <div class="bg-blue-900 text-white text-xs px-3 py-1 rounded">Registrert</div>
        </div>
        <div class="text-sm text-gray-600">{{ phone }}</div>
      </div>
    </div>
  </template>
  
  <template v-else>
    <div
      class="border rounded-lg bg-white shadow-sm"
      :class="{ 'border-red-500': !isRegistered }"
    >
      <div v-if="!isEditing" class="flex items-center justify-between w-full px-4 py-2">
        <div
          class="font-medium flex-1"
          :class="isRegistered ? 'text-blue-950' : 'text-red-600'"
        >
          {{ name }}
        </div>
        <div class="flex gap-2 justify-end">
          <Button 
            v-if="!isRegistered"
            variant="outline"
            class="p-2 h-8 w-8 flex items-center justify-center"
            @click="toggleEdit"
          >
            <Edit2 class="h-4 w-4" />
          </Button>
          <Button 
            variant="outline"
            :class="isRegistered ? 'bg-blue-900 text-white hover:bg-blue-700' : 'bg-red-500 text-white border-red-500 hover:bg-red-700'"
          >
            Fjern
          </Button>
        </div>
      </div>
      
      <div v-else class="px-4 py-2 space-y-2">
        <input 
          v-model="editedName"
          type="text" 
          class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <div class="flex justify-end gap-2">
          <Button 
            variant="outline"
            class="text-sm py-1 px-3 h-8"
            @click="toggleEdit"
          >
            Avbryt
          </Button>
          <Button 
            class="bg-blue-900 text-white hover:bg-blue-700 text-sm py-1 px-3 h-8"
            @click="saveEdit"
          >
            Lagre
          </Button>
        </div>
      </div>
    </div>
  </template>
</template>