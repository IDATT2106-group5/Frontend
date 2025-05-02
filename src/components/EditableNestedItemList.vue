<script setup>
import { ref, computed } from 'vue';
import { Trash, Pencil, Save } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

// Props
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['update-item', 'delete-item']);

// Reactive state
const openSubItems = ref([]);
const editingItem = ref(null);
const editingData = ref({
  name: '',
  expiryDate: '',
  quantity: 0
});

// Computed properties
const groupedSubItems = computed(() => {
  // Group items by name (e.g., group all "Water" items together)
  const grouped = {};

  // Handle undefined or empty items array
  if (!props.items || !Array.isArray(props.items) || props.items.length === 0) {
    return grouped;
  }

  props.items.forEach(rawItem => {
    const item = {
      id: rawItem.id,  // Use the correct id property consistently
      name: rawItem.name || rawItem.item?.name || 'Ukjent navn',
      expiryDate: rawItem.expiryDate || rawItem.item?.expiryDate || '',
      quantity: rawItem.quantity ?? rawItem.amount ?? 0,
      unit: rawItem.unit || 'stk',
      duration: rawItem.duration || null,
    };

    const baseName = getBaseName(item.name);
    if (!grouped[baseName]) {
      grouped[baseName] = [];
    }

    grouped[baseName].push(item);
  });
  return grouped;
});

// Methods
function getBaseName(fullName) {
  // Extract the base name (e.g., "Water" from "Water (Brand A)")
  // Or "Vann" from "Vann (Imsdal)"
  if (!fullName) return 'Unknown';

  const match = fullName.match(/^([^(]+)/);
  return match ? match[1].trim() : fullName;
}

function toggleSubAccordion(groupName) {
  if (!props.isEditing || (props.isEditing && editingItem.value === null)) {
    if (openSubItems.value.includes(groupName)) {
      openSubItems.value = openSubItems.value.filter(item => item !== groupName);
    } else {
      openSubItems.value.push(groupName);
    }
  }
}

function getEarliestExpiryDate(group) {
  // Find the earliest expiry date in a group
  const dates = group
    .filter(item => item.expiryDate)
    .map(item => item.expiryDate);

  if (dates.length === 0) return 'N/A';

  return dates.sort((a, b) => new Date(a) - new Date(b))[0];
}

function getTotalQuantity(group) {
  // Sum up the quantities in a group
  return group.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0);
}

function getEarliestItemExpirationStatus(group) {
  // If no items, return a default status
  if (!group || group.length === 0) {
    return { text: 'N/A', isExpired: false };
  }

  // Find the item with the earliest expiry date
  const itemsWithDates = group.filter(item => item.expiryDate);
  if (itemsWithDates.length === 0) {
    return { text: 'N/A', isExpired: false };
  }

  // Sort by expiry date
  const sortedItems = [...itemsWithDates].sort((a, b) => {
    const dateA = new Date(parseNorwegianDate(a.expiryDate));
    const dateB = new Date(parseNorwegianDate(b.expiryDate));
    return dateA - dateB;
  });

  // Get the earliest item
  const earliestItem = sortedItems[0];

  // Return its expiration status
  return getExpirationStatus(earliestItem.expiryDate, earliestItem);
}

function getExpirationStatus(expirationDate, item) {
  if (!expirationDate || expirationDate === 'N/A') return { text: 'N/A', isExpired: false };

  // Get today's date and reset time to midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse the expiry date correctly from Norwegian format (dd.mm.yyyy)
  let expiry;

  if (typeof item.expiryDate === 'string') {
    // Handle format like "29.04.2025" or "01.05.2025"
    const parts = item.expiryDate.split('.');
    if (parts.length === 3) {
      // Norwegian format: day.month.year
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS Date
      const year = parseInt(parts[2], 10);
      expiry = new Date(year, month, day);
    } else {
      // Try standard date parsing as fallback
      expiry = new Date(item.expiryDate);
    }
  } else if (item.expiryDate instanceof Date) {
    expiry = new Date(item.expiryDate);
  } else {
    console.error('Unsupported date format:', item.expiryDate);
    return { text: 'Invalid date', isExpired: false };
  }

  // Reset time components to compare just the dates
  expiry.setHours(0, 0, 0, 0);

  // Validate the parsed date
  if (isNaN(expiry.getTime())) {
    console.error('Invalid date after parsing:', item.expiryDate);
    return { text: 'Invalid date', isExpired: false };
  }

  // Calculate the difference in days
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Return appropriate status message with isExpired flag
  if (diffDays < 0) {
    return { text: 'Gått ut på dato', isExpired: true };
  } else if (diffDays === 0) {
    return { text: 'Utløper i dag', isExpired: false };
  } else {
    return { text: `${diffDays} dag${diffDays !== 1 ? 'er' : ''}`, isExpired: false };
  }
}

function startEditing(item) {
  editingItem.value = item.id;
  editingData.value = {
    expiryDate: item.expiryDate || '',
    quantity: item.quantity || 0
  };
}

function saveItemEdit(itemId) {
  // Create updated item data with the edited fields
  const updatedData = {
    expiryDate: editingData.value.expiryDate,
    quantity: parseFloat(editingData.value.quantity)
  };

  // Emit an event to parent component to update the item via the store
  emit('update-item', itemId, updatedData);

  // Reset editing state
  editingItem.value = null;
}

function deleteItem(itemId) {
  // Emit an event to parent component to delete the item
  emit('delete-item', itemId);
}

function groupItemsByExpiryDate(items) {
  // Group items by expiry date
  const grouped = {};
  items.forEach(item => {
    const date = item.expiryDate || 'N/A';
    if (!grouped[date]) {
      grouped[date] = [];
    }

    // Calculate expiration status for each item
    const status = getExpirationStatus(date, item);
    item.expirationStatus = status;

    grouped[date].push(item);
  });
  return grouped;
}

function getSubGroupTotalQuantity(subGroup) {
  // Sum up quantities for items with the same expiry date
  return subGroup.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0);
}

function formatDate(dateString) {
  if (!dateString || dateString === 'N/A') return 'N/A';

  try {
    let date;

    // Check if it's in Norwegian format (dd.mm.yyyy)
    const parts = dateString.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS
      const year = parseInt(parts[2], 10);
      date = new Date(year, month, day);
    } else {
      // Try standard parsing
      date = new Date(dateString);
    }

    // Validate date
    if (isNaN(date.getTime())) {
      console.error('Invalid date in formatDate:', dateString);
      return dateString;
    }

    // Format as dd.mm.yyyy
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString;
  }
}

function parseNorwegianDate(dateString) {
  if (!dateString) return new Date();

  const parts = dateString.split('.');
  if (parts.length === 3) {
    // Norwegian format: day.month.year
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS Date
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  return new Date(dateString);
}
</script>

<template>
  <div class="p-4 bg-white rounded">
    <!-- Header Row - Always consistent width regardless of edit mode -->
    <div class="grid grid-cols-5 items-center p-3 font-semibold text-gray-700 border-b border-gray-300">
      <div class="font-medium pb-3">Navn:</div>
      <div class="font-medium pb-3">Utløps dato:</div>
      <div class="font-medium pb-3">Kvantitet:</div>
      <div class="font-medium pb-3">Går ut på dato om:</div>
    </div>

    <div v-if="groupedSubItems && Object.keys(groupedSubItems).length > 0">
      <div v-for="(group, groupName) in groupedSubItems" :key="groupName" class="mb-4">
        <!-- Group header - using same grid layout -->
        <div
          @click="toggleSubAccordion(groupName)"
          class="grid grid-cols-5 items-center p-2 cursor-pointer hover:bg-gray-50 border-b border-gray-200"
        >
          <div class="font-medium">{{ groupName }}</div>
          <div>{{ formatDate(getEarliestExpiryDate(group)) }}</div>
          <div>{{ getTotalQuantity(group) }} {{ group[0]?.unit || 'stk' }}</div>
          <div>
            <span v-if="getEarliestItemExpirationStatus(group).isExpired"
                  class="text-red-600 font-medium">{{ getEarliestItemExpirationStatus(group).text }}</span>
            <span v-else>{{ getEarliestItemExpirationStatus(group).text }}</span>
          </div>
          <div class="flex justify-end">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              :class="['h-5 w-5 transform transition-transform', openSubItems.includes(groupName) ? 'rotate-180' : '']"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>

        <!-- Edit Mode - Individual Items -->
        <div v-if="openSubItems.includes(groupName) && isEditing" class="mt-1 border-l-2 border-gray-200">
          <div v-for="item in group" :key="item.id"
               class="grid grid-cols-5 items-center p-2 hover:bg-gray-50">
            <div>
              <span>{{ item.name }}</span>
            </div>
            <div>
              <input
                v-if="editingItem === item.id"
                type="date"
                v-model="editingData.expiryDate"
                class="w-full px-2 py-1 border rounded"
              />
              <span v-else>{{ formatDate(item.expiryDate) || 'N/A' }}</span>
            </div>
            <div>
              <div v-if="editingItem === item.id" class="flex items-center">
                <input
                  v-model="editingData.quantity"
                  type="number"
                  class="w-24 px-2 py-1 border rounded"
                />
                <span class="ml-2">{{ item.unit || 'stk' }}</span>
              </div>
              <span v-else>{{ item.quantity }} {{ item.unit || 'stk' }}</span>
            </div>
            <div>
              <span v-if="getExpirationStatus(item.expiryDate, item).isExpired"
                    class="text-red-600 font-medium">{{ getExpirationStatus(item.expiryDate, item).text }}</span>
              <span v-else>{{ getExpirationStatus(item.expiryDate, item).text }}</span>
            </div>
            <div class="flex justify-end space-x-2">
              <!-- Action buttons - only visible in edit mode -->
              <div class="flex space-x-2">
                <Pencil
                  v-if="editingItem !== item.id"
                  @click.stop="startEditing(item)"
                  class="h-5 w-5 text-gray-600 hover:text-blue-600 cursor-pointer"
                />
                <Save
                  v-if="editingItem === item.id"
                  @click.stop="saveItemEdit(item.id)"
                  class="h-5 w-5 text-gray-600 hover:text-green-600 cursor-pointer"
                />
                <Trash
                  @click.stop="deleteItem(item.id)"
                  class="h-5 w-5 text-gray-600 hover:text-red-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- View Mode - Grouped by Expiry Date -->
        <div v-else-if="openSubItems.includes(groupName)" class="mt-1 border-l-2 border-gray-200">
          <div v-for="(subGroup, expiryDate) in groupItemsByExpiryDate(group)" :key="expiryDate"
               class="grid grid-cols-5 items-center p-2 hover:bg-gray-50">
            <div>{{ subGroup[0].name }}</div>
            <div>{{ formatDate(expiryDate) }}</div>
            <div>{{ getSubGroupTotalQuantity(subGroup) }} {{ subGroup[0].unit || 'stk' }}</div>
            <div>
              <span v-if="subGroup[0].expirationStatus && subGroup[0].expirationStatus.isExpired"
                    class="text-red-600 font-medium">{{ subGroup[0].expirationStatus.text }}</span>
              <span v-else>{{ subGroup[0].expirationStatus ? subGroup[0].expirationStatus.text : '' }}</span>
            </div>
            <div></div> <!-- Empty cell to maintain grid alignment -->
          </div>
        </div>
      </div>
    </div>

    <!-- Fallback message if no items are provided -->
    <p v-else class="text-gray-500 italic text-center mt-4">
      Ingen varer funnet.
    </p>
  </div>
</template>