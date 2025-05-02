<script setup>
import {ref, computed, watch, onMounted} from 'vue';
import {useItemStore} from '@/stores/ItemStore';
import {ItemType} from '@/types/ItemType';

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
  console.log("Items loaded in AddStorageItem:", itemStore.items.value);

  // Add initial row
  addNewRow();
});

// Watch the `category` prop to filter items if category changes
watch(() => props.category, () => {
  console.log("Category changed to:", props.category);
});

// Create a computed property that provides items based on the selected category
const itemOptions = computed(() => {
  if (itemStore.isLoading.value || itemStore.error.value) {
    console.log("Still loading or error occurred");
    return [];
  }

  console.log("All available items:", itemStore.items);
  console.log("Current category:", props.category);

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

  console.log("Looking for items with type:", itemType);

  // Filter items based on their itemType matching the current category
  const filteredItems = itemStore.items.filter(item => {
    console.log("Checking item:", item.name, "Type:", item.itemType);
    return item.itemType === itemType;
  });

  console.log("Filtered items for display:", filteredItems);
  return filteredItems;
});

// Add a new empty row
function addNewRow() {
  addRows.value.push({
    selectedItem: null,
    selectedUnit: "",
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
    expirationDate: row.itemDate ? formatDateForBackend(row.itemDate) : null
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

// Helper function to format date for backend
function formatDateForBackend(dateString) {
  if (!dateString) return null;

  // Create a Date object from the date string
  const date = new Date(dateString);

  // Format as ISO string that LocalDateTime.parse can handle
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}T00:00:00`;
}
</script>

<template>
  <div class="add-item-form">
    <!-- Row for each item to add -->
    <div v-for="(row, index) in addRows" :key="index" class="add-item-row">
      <!-- Item selection dropdown -->
      <v-select
        v-model="row.selectedItem"
        :items="itemOptions"
        item-title="name"
        item-value="id"
        label="Velg vare"
        return-object
        class="input-field"
      ></v-select>

      <!-- Unit input -->
      <v-text-field
        v-model="row.selectedUnit"
        label="Enhet"
        placeholder="stk"
        class="input-field"
      ></v-text-field>

      <!-- Quantity input -->
      <v-text-field
        v-model="row.itemQuantity"
        label="Antall"
        type="number"
        min="1"
        class="input-field"
      ></v-text-field>

      <!-- Date picker -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-text-field
            v-model="row.itemDate"
            label="Utløpsdato"
            v-bind="props"
            prepend-icon="mdi-calendar"
            class="input-field"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="row.itemDate"
          no-title
          scrollable
        ></v-date-picker>
      </v-menu>

      <!-- Action buttons -->
      <div class="action-buttons">
        <v-btn icon @click="saveItem(row)" color="success">
          <v-icon>mdi-check</v-icon>
        </v-btn>
        <v-btn icon @click="removeRow(index)" color="error">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Button to add more rows -->
    <v-btn @click="addNewRow" block color="primary" class="mt-3">
      Legg til fler
    </v-btn>
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
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}
</style>
