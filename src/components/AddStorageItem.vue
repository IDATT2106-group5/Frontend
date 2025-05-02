<script setup>
import {ref, computed, watch, onMounted} from 'vue';
import {useItemStore} from '@/stores/ItemStore';
import { PlusCircle, Undo, Save } from 'lucide-vue-next';
import { Button } from '@/components/ui/button/index.js'

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
  <div class="mt-4">
    <!-- Row for each item to add -->
    <div v-for="(row, index) in addRows" :key="index" class="flex flex-wrap md:flex-nowrap items-end gap-4 mb-4">
      <!-- Item selection dropdown -->
      <div class="flex-1 flex flex-col">
        <label :for="`item-select-${index}`" class="mb-1 text-sm font-medium">Velg vare</label>
        <select
          :id="`item-select-${index}`"
          v-model="row.selectedItem"
          class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">Velg vare</option>
          <option
            v-for="item in itemOptions"
            :key="item.id"
            :value="item">
            {{ item.name }}
          </option>
        </select>
      </div>

      <!-- Date input -->
      <div class="flex-1 flex flex-col">
        <label :for="`date-${index}`" class="mb-1 text-sm font-medium">Utløpsdato</label>
        <input
          :id="`date-${index}`"
          v-model="row.itemDate"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Quantity input -->
      <div class="flex-1 flex flex-col">
        <label :for="`quantity-${index}`" class="mb-1 text-sm font-medium">Antall</label>
        <input
          :id="`quantity-${index}`"
          v-model="row.itemQuantity"
          type="number"
          min="1"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Unit input -->
      <div class="flex-1 flex flex-col">
        <label :for="`unit-${index}`" class="mb-1 text-sm font-medium">Enhet</label>
        <input
          :id="`unit-${index}`"
          v-model="row.selectedUnit"
          placeholder="stk"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Action buttons -->
      <div class="flex items-center space-x-4 ml-2 h-10">
        <Button @click="saveItem(row)" class="hover:bg-blue-600 cursor-pointer">
          <PlusCircle
            class="h-6 w-6 text-white"
          />
        </Button>

        <Button @click="removeRow(index)" class="hover:bg-red-600 cursor-pointer">
          <Undo
            class="h-6 w-6 text-white"
          />
        </Button>

      </div>
    </div>
  </div>
</template>