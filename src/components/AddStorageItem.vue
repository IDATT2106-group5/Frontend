<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  category: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['add-item']);

const addRows = ref([]);
const nextId = ref(1);

// Get type options based on category
const typeOptions = computed(() => {
  switch(props.category) {
    case 'Væske':
      return ['Vann', 'Juice', 'Melk', 'Brus', 'Annet'];
    case 'Mat':
      return ['Hermetikk', 'Tørrmat', 'Frysemat', 'Annet'];
    case 'Medisiner':
      return ['Smertestillende', 'Antibiotika', 'Bandasje', 'Annet'];
    case 'Redskap':
      return ['Verktøy', 'Batterier', 'Lys', 'Annet'];
    case 'Diverse':
      return ['Klær', 'Hygiene', 'Dokumenter', 'Annet'];
    default:
      return ['Annet'];
  }
});

// Get unit options based on category
const unitOptions = computed(() => {
  switch(props.category) {
    case 'Væske':
      return ['L', 'ml', 'flaske', 'kartong'];
    case 'Mat':
      return ['stk', 'kg', 'g', 'boks', 'pakke'];
    case 'Medisiner':
      return ['stk', 'pakke', 'dose', 'eske'];
    case 'Redskap':
      return ['stk', 'sett', 'pakke'];
    case 'Diverse':
      return ['stk', 'pakke', 'sett', 'eske'];
    default:
      return ['stk'];
  }
});

// Add a new row
const addNewRow = () => {
  const defaultUnit = props.category === 'Væske' ? 'L' : 'stk';

  addRows.value.push({
    id: nextId.value++,
    selectedType: '',
    itemDate: '',
    itemQuantity: '',
    selectedUnit: defaultUnit
  });
};

// Save an item
const saveItem = (row) => {
  // Simple validation
  if (!row.selectedType) {
    return;
  }

  // Create new item object
  const newItem = {
    name: row.selectedType, // Use type as name
    category: props.category,
    type: row.selectedType,
    amount: parseInt(row.itemQuantity) || 1,
    quantity: parseInt(row.itemQuantity) || 1,
    unit: row.selectedUnit,
    expiryDate: row.itemDate,
    expirationDate: row.itemDate ? new Date(row.itemDate) : null
  };

  emit('add-item', newItem);

  // Remove this row
  removeRow(row.id);
};

// Remove a row
const removeRow = (id) => {
  const index = addRows.value.findIndex(row => row.id === id);
  if (index !== -1) {
    addRows.value.splice(index, 1);
  }
};

// Show date picker dialog
const showDatePicker = (event) => {
  const dateInput = event.target.previousElementSibling;
  if (dateInput) {
    dateInput.showPicker();
  }
};
</script>

<template>
  <!-- Add rows -->
  <div v-for="row in addRows" :key="row.id" class="w-full border-t border-gray-200">
    <div class="flex items-center px-4 py-3">
      <!-- Type selector -->
      <div class="w-1/4 pr-3">
        <div class="relative">
          <select
            v-model="row.selectedType"
            class="w-full border border-gray-300 rounded py-2 px-3 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-300"
          >
            <option value="" disabled selected>Velg type</option>
            <option v-for="option in typeOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Date field -->
      <div class="w-1/4 px-3">
        <div class="relative">
          <input
            v-model="row.itemDate"
            type="text"
            placeholder="dd.mm.åååå"
            class="w-full border border-gray-300 rounded py-2 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
          <div
            class="absolute right-0 top-0 h-full flex items-center pr-3 cursor-pointer"
            @click="showDatePicker($event, row.id)"
          >
            <input
              type="date"
              class="sr-only"
              v-model="row.itemDate"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Quantity field and Unit selector inline -->
      <div class="w-1/4 px-3 flex">
        <!-- Quantity input -->
        <input
          v-model="row.itemQuantity"
          type="text"
          placeholder="Antall"
          class="w-2/3 border border-gray-300 rounded-l py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-300"
        />

        <!-- Unit selector -->
        <div class="relative w-1/3">
          <select
            v-model="row.selectedUnit"
            class="w-full border border-gray-300 border-l-0 rounded-r py-2 px-1 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-300"
          >
            <option v-for="unit in unitOptions" :key="unit" :value="unit">
              {{ unit }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1">
            <svg class="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Action buttons inline with other fields -->
      <div class="w-1/4 pl-3 flex space-x-2 justify-end">
        <button
          @click="removeRow(row.id)"
          class="px-3 py-2 rounded border border-red-300 text-red-500 hover:bg-red-50 flex items-center"
        >
          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Avbryt
        </button>
        <button
          @click="saveItem(row)"
          class="px-3 py-2 rounded border border-green-300 text-green-600 hover:bg-green-50 flex items-center"
        >
          <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Lagre
        </button>
      </div>
    </div>
  </div>

  <!-- Plus icon row - always shown at the bottom -->
  <div class="w-full border-t border-gray-200 py-3 px-0">
    <div class="flex justify-center items-center">
      <button
        @click="addNewRow"
        class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Hide default date input styling */
input[type="date"] {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
