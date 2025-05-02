<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useItemStore } from '@/stores/ItemStore';

const props = defineProps({
  category: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['add-item']);

const addRows = ref([]);

// Access the item store
const itemStore = useItemStore();
const { items, isLoading, error, fetchItems } = itemStore;

// Fetch items from the API when the component mounts
onMounted(() => {
  fetchItems();
  // Add initial row
  addNewRow();
});

// Watch the `category` prop to refetch items if category changes
watch(() => props.category, () => {
  fetchItems();
});

// Get type options dynamically based on the category
const typeOptions = computed(() => {
  if (isLoading.value || error.value) return [];

  const categoryMapping = {
    'Væske': 'LIQUIDS',
    'Mat': 'FOOD',
    'Medisiner': 'MEDICATIONS',
    'Redskap': 'TOOLS',
    'Diverse': 'MISC',
  };

  const categoryCode = categoryMapping[props.category];
  return items.value.filter(item => item.category === categoryCode);
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
    selectedItem: null,
    itemDate: '',
    itemQuantity: 1, // Default to 1
    selectedUnit: defaultUnit
  });
};

// Save an item
const saveItem = (row) => {
  if (!row.selectedItem) return;

  const newItem = {
    name: row.selectedItem.name,
    itemId: row.selectedItem.id, // Reference to backend ID
    category: props.category,
    type: row.selectedItem.type,
    amount: parseInt(row.itemQuantity) || 1,
    unit: row.selectedUnit,
    expiryDate: row.itemDate,
    expirationDate: row.itemDate ? new Date(row.itemDate) : null
  };

  emit('add-item', newItem);

  // Remove this row from the list
  const index = addRows.value.indexOf(row);
  if (index !== -1) {
    addRows.value.splice(index, 1);
  }

  // Add a new empty row if there are no rows left
  if (addRows.value.length === 0) {
    addNewRow();
  }
};

// Remove a row
const removeRow = (index) => {
  addRows.value.splice(index, 1);

  // Add a new empty row if there are no rows left
  if (addRows.value.length === 0) {
    addNewRow();
  }
};

// Show date picker dialog
const showDatePicker = (event) => {
  const dateInput = event.target.closest('.date-group').querySelector('input[type="date"]');
  if (dateInput) {
    dateInput.showPicker();
  }
};

// Watch the selectedItem to auto-populate unit if needed
watch(() => addRows.value, (newRows) => {
  newRows.forEach(row => {
    if (row.selectedItem && row.selectedItem.defaultUnit) {
      row.selectedUnit = row.selectedItem.defaultUnit;
    }
  });
}, { deep: true });
</script>

<template>
  <div class="add-storage-items">
    <h3>Legg til {{ category }}</h3>

    <!-- Loading and error states -->
    <div v-if="isLoading" class="loading">Laster elementer...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <!-- Add rows -->
    <div v-for="(row, index) in addRows" :key="index" class="add-row">
      <div class="form-group">
        <label>Type</label>
        <select v-model="row.selectedItem" class="form-control">
          <option :value="null">Velg type</option>
          <option v-for="item in typeOptions" :key="item.id" :value="item">
            {{ item.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Mengde</label>
        <input type="number" v-model="row.itemQuantity" class="form-control" min="1">
      </div>

      <div class="form-group">
        <label>Enhet</label>
        <select v-model="row.selectedUnit" class="form-control">
          <option v-for="unit in unitOptions" :key="unit" :value="unit">
            {{ unit }}
          </option>
        </select>
      </div>

      <div class="form-group date-group">
        <label>Utløpsdato</label>
        <input type="date" v-model="row.itemDate" class="form-control">
        <button @click="showDatePicker" type="button" class="date-picker-button">
          <span>📅</span>
        </button>
      </div>

      <div class="actions">
        <button @click="saveItem(row)" :disabled="!row.selectedItem" class="save-btn">
          Lagre
        </button>
        <button @click="removeRow(index)" class="remove-btn">
          Fjern
        </button>
      </div>
    </div>

    <!-- Add new row button -->
    <button @click="addNewRow" class="add-row-btn">
      Legg til {{ category }}
    </button>
  </div>
</template>


<style scoped>
.add-storage-items {
  margin-bottom: 20px;
}

.add-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.date-group {
  display: flex;
  flex-direction: column;
  position: relative;
}

.date-picker-button {
  position: absolute;
  right: 0;
  bottom: 0;
  height: 100%;
  background: none;
  border: none;
  cursor: pointer;
}

.actions {
  display: flex;
  gap: 5px;
}

.add-row-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  padding: 6px 12px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.remove-btn {
  padding: 6px 12px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.loading, .error {
  margin: 10px 0;
  padding: 10px;
  border-radius: 4px;
}

.loading {
  background-color: #e3f2fd;
}

.error {
  background-color: #ffebee;
  color: #f44336;
}
</style>
