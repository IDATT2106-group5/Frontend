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
  props.items.forEach(item => {
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
  return group
    .filter(item => item.expiryDate)
    .map(item => item.expiryDate)
    .sort((a, b) => new Date(a) - new Date(b))[0] || 'N/A';
}

function getTotalQuantity(group) {
  // Sum up the quantities in a group
  return group.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0);
}

function calculateDuration(quantity, item) {
  // Return the duration value from the item or calculate it if needed
  return item.duration || `${Math.ceil(quantity / 3)} dager`;
}

function startEditing(item) {
  editingItem.value = item.id;
  editingData.value = {
    name: item.name,
    expiryDate: item.expiryDate || '',
    quantity: item.quantity || 0
  };
}

function saveItemEdit(itemId) {
  // Create updated item data with the edited fields
  const updatedData = {
    name: editingData.value.name,
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
    grouped[date].push(item);
  });
  return grouped;
}

function getSubGroupTotalQuantity(subGroup) {
  // Sum up quantities for items with the same expiry date
  return subGroup.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0);
}
</script>

<template>
  <div class="p-4 bg-white rounded">
    <div class="flex items-center p-3 font-semibold text-gray-700 px-2 border-b border-gray-300">
      <div class="flex-1 font-medium pb-3">Navn:</div>
      <div class="flex-1 font-medium pb-3">Utløps dato:</div>
      <div class="flex-1 font-medium pb-3">Kvantitet:</div>
      <div class="flex-1 font-medium pb-3">Går ut på dato om:</div>
      <div class="w-6"></div>
    </div>

    <div v-if="groupedSubItems && Object.keys(groupedSubItems).length > 0">
      <div v-for="(group, groupName) in groupedSubItems" :key="groupName" class="mb-4">
        <!-- Sub-accordion header -->
        <div
          @click="toggleSubAccordion(groupName)"
          class="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 border-b border-gray-200"
        >
          <div class="flex-1 font-medium">{{ groupName }}</div>
          <div class="flex-1">{{ getEarliestExpiryDate(group) }}</div>
          <div class="flex-1">{{ getTotalQuantity(group) }} {{ group[0].unit }}</div>
          <div class="flex-1">{{ calculateDuration(getTotalQuantity(group), group[0]) }}</div>
          <div class="w-6">
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

        <!-- Sub-accordion content - show individual items if in edit mode -->
        <div v-if="openSubItems.includes(groupName) && isEditing" class="mt-1 border-l-2 border-gray-200">
          <div v-for="item in group" :key="item.id"
               class="flex items-center p-2 hover:bg-gray-50">
            <div class="flex-1">
              <input
                v-if="editingItem === item.id"
                v-model="editingData.name"
                class="w-full px-2 py-1 border rounded"
              />
              <span v-else>{{ item.name }}</span>
            </div>
            <div class="flex-1">
              <input
                v-if="editingItem === item.id"
                type="date"
                v-model="editingData.expiryDate"
                class="w-full px-2 py-1 border rounded"
              />
              <span v-else>{{ item.expiryDate || 'N/A' }}</span>
            </div>
            <div class="flex-1">
              <div v-if="editingItem === item.id" class="flex items-center">
                <input
                  v-model="editingData.quantity"
                  type="number"
                  class="w-24 px-2 py-1 border rounded"
                />
                <span class="ml-2">{{ item.unit }}</span>
              </div>
              <span v-else>{{ item.quantity }} {{ item.unit }}</span>
            </div>
            <div class="flex-1">{{ calculateDuration(item.quantity, item) }}</div>
            <div class="w-20 flex justify-end space-x-2">
              <!-- Edit button -->
              <Button
                v-if="editingItem !== item.id"
                @click.stop="startEditing(item)"
                class="text-gray-600 hover:text-blue-600"
              >
                <Pencil class="h-5 w-5" />
              </Button>
              <!-- Save button -->
              <Button
                v-if="editingItem === item.id"
                @click.stop="saveItemEdit(item.id)"
                class="text-gray-600 hover:text-green-600"
              >
                <Save class="h-5 w-5" />
              </Button>
              <!-- Delete button -->
              <Button
                @click.stop="deleteItem(item.id)"
                class="text-gray-600 hover:text-red-600"
              >
                <Trash class="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Sub-accordion content - show expiry date groups if not in edit mode -->
        <div v-else-if="openSubItems.includes(groupName)" class="mt-1 border-l-2 border-gray-200">
          <div v-for="(subGroup, expiryDate) in groupItemsByExpiryDate(group)" :key="expiryDate"
               class="flex items-center p-2 hover:bg-gray-50">
            <div class="flex-1">{{ subGroup[0].name }}</div>
            <div class="flex-1">{{ expiryDate }}</div>
            <div class="flex-1">{{ getSubGroupTotalQuantity(subGroup) }} {{ subGroup[0].unit }}</div>
            <div class="flex-1">{{ calculateDuration(getSubGroupTotalQuantity(subGroup), subGroup[0]) }}</div>
            <div class="w-6"></div> <!-- to align with the arrow column -->
          </div>
        </div>
      </div>
    </div>

    <!-- Fallback message if no items are provided -->
    <p v-else class="text-gray-500 italic text-center mt-4">
      No items to display.
    </p>
  </div>
</template>
