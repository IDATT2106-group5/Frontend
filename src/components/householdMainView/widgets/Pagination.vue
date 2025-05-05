<template>
  <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-4">
    <Button :disabled="currentPage === 1" @click="prev">
      &larr;
    </Button>

    <template v-for="(page, index) in pagesToShow" :key="`${page}-${index}`">
      <button
        v-if="typeof page === 'number'"
        @click="emit('change-page', page)"
        class="w-8 h-8 flex items-center justify-center border rounded font-medium"
        :class="page === currentPage
          ? 'bg-primary text-white'
          : 'border-gray-400 text-gray-700 hover:bg-gray-100'"
      >
        {{ page }}
      </button>
      <button
        v-else
        @click="handleEllipsisClick(index)"
        class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded"
      >
        ...
      </button>
    </template>

    <Button :disabled="currentPage === totalPages" @click="next">
      &rarr;
    </Button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import { Button } from '@/components/ui/button'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true }
})
const emit = defineEmits(['change-page'])

function prev() {
  if (props.currentPage > 1) {
    emit('change-page', props.currentPage - 1)
  }
}
function next() {
  if (props.currentPage < props.totalPages) {
    emit('change-page', props.currentPage + 1)
  }
}

const pagesToShow = computed(() => {
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, '...', total]
  } else if (current >= total - 2) {
    return [1, '...', total - 2, total - 1, total]
  } else {
    return [1, '...', current, '...', total]
  }
})

function handleEllipsisClick(index) {
  if (pagesToShow.value[index] !== '...') return

  if (index === 1) {
    const target = Math.max(1, props.currentPage - 2)
    emit('change-page', target)
  }
  else if (index === 3) {
    const target = Math.min(props.totalPages, props.currentPage + 2)
    emit('change-page', target)
  }
}
</script>
1