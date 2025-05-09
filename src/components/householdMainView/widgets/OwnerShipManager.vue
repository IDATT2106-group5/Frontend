<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useHouseholdStore } from '@/stores/HouseholdStore'

const store = useHouseholdStore()
const name = ref('')
const showDropdown = ref(false)
const hoveredIndex = ref(-1)

/**
 * Computes up to 5 suggestions of non-owner members based on input text.
 * Filters by name or email match.
 * @type {import('vue').ComputedRef<Array<{ id: string, fullName: string, email: string }>>}
 */
const suggestions = computed(() => {
  const q = name.value.trim().toLowerCase()
  if (!q) return []
  const ownerId = store.currentHousehold.ownerId
  return store.members.registered
    .filter(m => m.id !== ownerId)
    .filter(m =>
      m.fullName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    )
    .slice(0, 5)
})

const selected = ref(null)

/**
 * Watcher to update the selected member and dropdown state based on input changes.
 */
watch(name, (val) => {
  const match = suggestions.value.find(m => m.fullName === val) || null
  selected.value = match
  showDropdown.value = !!val.trim() && !match
  hoveredIndex.value = -1
})

/**
 * Select a member suggestion and populate the input.
 * @param {{ fullName: string, id: string, email: string }} s - The selected suggestion
 */
function selectSuggestion(s) {
  name.value = s.fullName
  selected.value = s
  showDropdown.value = false
}

/**
 * Handle keyboard navigation and selection in the suggestion dropdown.
 * @param {KeyboardEvent} e
 */
function handleKeydown(e) {
  if (!showDropdown.value || !suggestions.value.length) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    hoveredIndex.value = (hoveredIndex.value + 1) % suggestions.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    hoveredIndex.value =
      (hoveredIndex.value - 1 + suggestions.value.length) % suggestions.value.length
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (hoveredIndex.value >= 0) {
      selectSuggestion(suggestions.value[hoveredIndex.value])
    }
  }
}

/**
 * Triggers the transfer of ownership to the selected member.
 * Clears the form after success.
 */
async function give() {
  if (!selected.value) return
  try {
    await store.transferOwnership(selected.value.id)
    name.value = ''
    selected.value = null
    showDropdown.value = false
  } catch {
    alert('Kunne ikke overføre eierskap')
  }
}
</script>

<template>
  <div class="space-y-2 bg-white rounded shadow p-4">
    <label class="block text-sm font-semibold">Gi eierskap til medlem</label>
    <div class="relative">
      <input
        v-model="name"
        @focus="showDropdown = !!name.trim() && !selected"
        @keydown="handleKeydown"
        type="text"
        placeholder="Skriv navn eller e-post…"
        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <ul
        v-if="showDropdown && suggestions.length"
        class="absolute z-10 w-full border rounded max-h-40 overflow-auto mt-1 bg-white"
      >
        <li
          v-for="(s, i) in suggestions"
          :key="s.id || i"
          @click="selectSuggestion(s)"
          class="px-3 py-2 cursor-pointer"
          :class="{
            'bg-gray-100': hoveredIndex === i,
            'hover:bg-gray-100': hoveredIndex !== i
          }"
        >
          <div>{{ s.fullName }}</div>
          <div class="text-xs text-black">{{ s.email }}</div>
        </li>
      </ul>
    </div>

    <button
      @click="give"
      :disabled="!selected"
      class="mt-2 px-4 py-1 bg-primary text-white rounded hover:bg-[hsl(var(--primary-hover))] disabled:opacity-50"
    >
      Gi eierskap
    </button>
  </div>
</template>
