<script setup>
import { User, Mail, Phone } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = defineProps({
  member: Object
})

const emit = defineEmits(['remove-member'])
</script>

<template>
  <div class="flex justify-between bg-white shadow p-3 rounded-md mb-2">
    <div class="flex items-center gap-3">
      <User class="w-10 h-10 text-gray-500" />
      <div>
        <p class="font-medium">{{ member.name }}</p>

        <p v-if="member.isRegistered" class="text-sm text-gray-600 flex items-center gap-2">
          <Mail class="w-4 h-4" />
          {{ member.email }}
        </p>

        <span 
          v-else 
          class="inline-block px-3 py-1 text-sm text-slate-700 bg-slate-100 border border-slate-400 rounded-full"
        >
          Ikke registrert
        </span>   

        <p v-if="member.isRegistered" class="text-sm text-gray-600 flex items-center gap-2">
          <Phone class="w-4 h-4" />
          {{ member.tlf || '(Ingen telefonnummer)' }}
        </p>
      </div>
    </div>

    <div class="flex items-center">
      <Button variant="destructive" @click="$emit('remove-member', member)">Fjern</Button>
    </div>
  </div>
</template>