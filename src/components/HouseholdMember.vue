<script setup>
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion'

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
  }
})

// Local state
const isOpen = ref(false)
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
          :class="isRegistered ? 'bg-blue-900 text-white hover:bg-blue-950' : 'text-red-600 border-red-500 hover:bg-red-100'"
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
      class="flex items-center justify-between border rounded-lg px-4 py-2 bg-white shadow-sm" 
      :class="{ 'border-red-500': !isRegistered }"
    >
      <div 
        class="font-medium" 
        :class="isRegistered ? 'text-blue-950' : 'text-red-600'"
      >
        {{ name }}
      </div>
      <Button 
        variant="outline" 
        :class="isRegistered ? 'bg-blue-900 text-white hover:bg-blue-950' : 'text-red-600 border-red-500 hover:bg-red-100'"
      >
        Fjern
      </Button>
    </div>
  </template>
</template>