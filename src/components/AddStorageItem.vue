<script setup>
import {ref, computed, watch, onMounted} from 'vue';
import {useItemStore} from '@/stores/ItemStore';
import { PlusCircle, Undo, Search } from 'lucide-vue-next';
import { Button } from '@/components/ui/button/index.js'

const props = defineProps({
  category: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['add-item']);

const addRows = ref([]);
const searchTerm = ref('');

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

// Watch for item type changes to set appropriate unit
watch(() => props.category, (newCategory) => {
  console.log("Category changed to:", newCategory);

  // Set default unit based on category
  addRows.value.forEach(row => {
    if (newCategory === 'Væske') {
      row.selectedUnit = "Liter";
    } else if (newCategory === 'Mat') {
      row.selectedUnit = "Gram";
    }
  });
});

// Watch search term to keep dropdowns open
watch(() => searchTerm.value, () => {
  // Keep dropdowns open when searching
  if (searchTerm.value) {
    addRows.value.forEach(row => {
      row.isDropdownOpen = true;
    });
  }
});

// Create a computed property that filters items based on category
const filteredByCategory = computed(() => {
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
  return itemStore.items.filter(item => item.itemType === itemType);
});

// Filter items by search term
const filteredItems = computed(() => {
  if (!searchTerm.value) {
    return filteredByCategory.value;
  }

  const term = searchTerm.value.toLowerCase();
  return filteredByCategory.value.filter(item =>
    item.name.toLowerCase().includes(term)
  );
});

// Add a new empty row
function addNewRow() {
  const defaultUnit = getDefaultUnitForCategory(props.category);

  addRows.value.push({
    selectedItem: null,
    selectedUnit: defaultUnit,
    itemQuantity: 1,
    itemDate: null,
    isDropdownOpen: false // Add this property to track dropdown state
  });
}

// Helper function to get default unit based on category
function getDefaultUnitForCategory(category) {
  if (category === 'Væske') {
    return "Liter";
  } else if (category === 'Mat') {
    return "Gram";
  } else {
    return "Stk";
  }
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
    unit: row.selectedUnit || "Stk",
    amount: parseInt(row.itemQuantity) || 1,
    expirationDate: row.itemDate ? new Date(row.itemDate) : null
  };

  // Emit the event to add the item to storage
  emit('add-item', {
    itemId: row.selectedItem.id,
    data: newItem
  });

  // Close the dropdown
  row.isDropdownOpen = false;

  // Remove this row from the list
  const index = addRows.value.indexOf(row);
  if (index !== -1) {
    addRows.value.splice(index, 1);
  }

  // Reset search term when saving
  searchTerm.value = '';

  // Add a new empty row if there are no rows left
  if (addRows.value.length === 0) {
    addNewRow();
  }
}
</script>

<template>
  <div class="mt-4">
    <!-- Row for each item to add -->
    <div v-for="(row, index) in addRows" :key="index" class="flex flex-col gap-4 mb-6">
      <!-- Search and item selection section -->
      <div class="flex flex-col">
        <label :for="`item-search-${index}`" class="mb-1 text-sm font-medium">Søk og velg vare</label>

        <!-- Search input -->
        <div class="relative mb-2">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search class="h-4 w-4 text-gray-400" />
          </div>
          <input
            :id="`item-search-${index}`"
            v-model="searchTerm"
            type="text"
            placeholder="Søk etter vare..."
            class="pl-10 w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @focus="row.isDropdownOpen = true"
          />
        </div>

        <!-- Custom dropdown implementation that stays open while searching -->
        <div class="relative">
          <div
            @click="row.isDropdownOpen = !row.isDropdownOpen"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer flex justify-between items-center"
          >
            <span v-if="row.selectedItem">{{ row.selectedItem.name }}</span>
            <span v-else class="text-gray-500">Velg vare</span>
            <span class="ml-2">▼</span>
          </div>

          <!-- Dropdown menu that stays open during search -->
          <div
            v-if="row.isDropdownOpen"
            class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            <div
              v-if="filteredItems.length === 0"
              class="px-3 py-2 text-gray-500"
            >
              Ingen varer funnet
            </div>
            <div
              v-for="item in filteredItems"
              :key="item.id"
              @click="() => { row.selectedItem = item; }"
              class="px-3 py-2 hover:bg-blue-100 cursor-pointer"
              :class="{'bg-blue-100': row.selectedItem && row.selectedItem.id === item.id}"
            >
              {{ item.name }}
            </div>
          </div>
        </div>

        <!-- Search results info -->
        <div class="mt-1 text-xs text-gray-500">
          Viser {{ filteredItems.length }} varer
        </div>
      </div>

      <!-- Item details section -->
      <div class="flex flex-wrap md:flex-nowrap items-end gap-4">
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
            :placeholder="getDefaultUnitForCategory(props.category)"
            :disabled="props.category === 'Væske' || props.category === 'Mat'"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{'bg-gray-100': props.category === 'Væske' || props.category === 'Mat'}"
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
  </div>
</template>