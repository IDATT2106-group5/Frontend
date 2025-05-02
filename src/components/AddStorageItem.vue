<script setup>
import {ref, computed, watch, onMounted} from 'vue';
import {useItemStore} from '@/stores/ItemStore';

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

// Fetch items from the API when the component mounts
onMounted(async () => {
  // Fetch all items first
  await itemStore.fetchItems();
  console.log("Items loaded in AddStorageItem:", itemStore.items);

  // Add initial row
  addNewRow();
});

// Watch the `category` prop to filter items if category changes
watch(() => props.category, () => {
  console.log("Category changed to:", props.category);
});

// Create a computed property that provides items based on the selected category
const itemOptions = computed(() => {
  if (itemStore.isLoading || itemStore.error) {
    console.log("Still loading or error occurred");
    return [];
  }

  // Map frontend categories to backend enum values
  const categoryMapping = {
    'Væske': 'LIQUIDS',
    'Mat': 'FOOD',
    'Medisiner': 'FIRST_AID',
    'Redskap': 'TOOL',
    'Diverse': 'OTHER'
  };

  const itemType = categoryMapping[props.category];
  if (!itemType) {
    console.log("No matching item type for category:", props.category);
    return [];
  }

  // Filter items based on their itemType matching the current category
  const filteredItems = itemStore.items.filter(item => {
    return item.itemType === itemType;
  });

  return filteredItems;
});

// Add a new empty row
function addNewRow() {
  addRows.value.push({
    selectedItem: null,
    selectedUnit: "stk",
    itemQuantity: 1,
    itemDate: null
  });
}

// Remove a row
function removeRow(index) {
  addRows.value.splice(index, 1);

  // Add a row if there are none left
  if (addRows.value.length === 0) {
    addNewRow();
  }
}

// Save an item
function saveItem(row) {
  if (!row.selectedItem) {
    console.log("No item selected, cannot save");
    return;
  }

  console.log("Saving item:", row.selectedItem);

  // Create the object in the format expected by your storage service
  const newItem = {
    unit: row.selectedUnit || "stk",
    amount: parseInt(row.itemQuantity) || 1,
    expirationDate: row.itemDate ? new Date(row.itemDate) : null
    // Changed: Instead of a formatted string, we're now passing a Date object
  };

  // Emit the event to add the item to storage
  emit('add-item', {
    itemId: row.selectedItem.id,
    data: newItem
  });

  // Remove this row from the list
  const index = addRows.value.indexOf(row);
  if (index !== -1) {
    addRows.value.splice(index, 1);
  }

  // Add a new empty row if there are no rows left
  if (addRows.value.length === 0) {
    addNewRow();
  }
}
</script>

<template>
  <div class="add-item-form">
    <!-- Row for each item to add -->
    <div v-for="(row, index) in addRows" :key="index" class="add-item-row">
      <!-- Item selection dropdown -->
      <div class="input-field">
        <label :for="`item-select-${index}`">Velg vare</label>
        <select
          :id="`item-select-${index}`"
          v-model="row.selectedItem"
          class="form-select">
          <option value="">Velg vare</option>
          <option
            v-for="item in itemOptions"
            :key="item.id"
            :value="item">
            {{ item.name }}
          </option>
        </select>
      </div>

      <!-- Unit input -->
      <div class="input-field">
        <label :for="`unit-${index}`">Enhet</label>
        <input
          :id="`unit-${index}`"
          v-model="row.selectedUnit"
          placeholder="stk"
          class="form-input"
        />
      </div>

      <!-- Quantity input -->
      <div class="input-field">
        <label :for="`quantity-${index}`">Antall</label>
        <input
          :id="`quantity-${index}`"
          v-model="row.itemQuantity"
          type="number"
          min="1"
          class="form-input"
        />
      </div>

      <!-- Date input -->
      <div class="input-field">
        <label :for="`date-${index}`">Utløpsdato</label>
        <input
          :id="`date-${index}`"
          v-model="row.itemDate"
          type="date"
          class="form-input"
        />
      </div>

      <!-- Action buttons -->
      <div class="action-buttons">
        <button @click="saveItem(row)" class="btn btn-success">
          <span class="icon">✓</span>
        </button>
        <button @click="removeRow(index)" class="btn btn-error">
          <span class="icon">✕</span>
        </button>
      </div>
    </div>

    <!-- Button to add more rows -->
    <button @click="addNewRow" class="btn btn-primary btn-block mt-3">
      Legg til fler
    </button>
  </div>
</template>

<style scoped>
.add-item-form {
  margin-top: 1rem;
}

.add-item-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-field {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-select, .form-input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-success {
  background-color: #4caf50;
  color: white;
}

.btn-error {
  background-color: #f44336;
  color: white;
}

.btn-primary {
  background-color: #2196f3;
  color: white;
}

.btn-block {
  width: 100%;
}

.mt-3 {
  margin-top: 1rem;
}

.icon {
  font-size: 1rem;
}
</style>
