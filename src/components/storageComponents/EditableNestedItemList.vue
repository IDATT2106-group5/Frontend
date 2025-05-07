<script setup>
import { computed, ref } from 'vue'
import { Pencil, Save, Trash } from 'lucide-vue-next'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  searchQuery: {
    type: String,
    default: '',
  }
})

/**
 * Emits events to the parent component
 * @typedef {Object} Emits
 * @property {function(string, Object): void} update-item - Emitted when an item is updated
 * @property {function(string): void} delete-item - Emitted when an item is deleted
 */
const emit = defineEmits(['update-item', 'delete-item'])

const openSubItems = ref([])
const editingItem = ref(null)
const editingData = ref({
  expiryDate: '',
  quantity: 0,
})

/**
 * Calculates the expiration status of an item based on its expiry date
 * Returns text description and whether the item is expired
 *
 * @param {string} expirationDate - The expiry date string
 * @returns {Object} Object with text description and isExpired flag
 */
function getExpirationStatus(expirationDate) {
  if (!expirationDate || expirationDate === 'N/A') return { text: 'N/A', isExpired: false }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const parts = expirationDate.split('.')
  if (parts.length !== 3) return { text: 'Invalid date', isExpired: false }

  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const year = parseInt(parts[2], 10)
  const expiry = new Date(year, month, day)
  expiry.setHours(0, 0, 0, 0)

  if (isNaN(expiry.getTime())) {
    return { text: 'Invalid date', isExpired: false }
  }

  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { text: 'Gått ut på dato', isExpired: true }
  } else if (diffDays === 0) {
    return { text: 'Utløper i dag', isExpired: false }
  } else {
    return { text: `${diffDays} dag${diffDays !== 1 ? 'er' : ''}`, isExpired: false }
  }
}

/**
 * Extracts the base name from a product name, removing any text in parentheses
 *
 * @param {string} fullName - The full product name
 * @returns {string} The base name without parenthetical content
 */
function getBaseName(fullName) {
  if (!fullName) return 'Unknown'

  const match = fullName.match(/^([^(]+)/)
  return match ? match[1].trim() : fullName
}

/**
 * Groups items by their base name (e.g., all "Water" items together)
 * Handles various data formats and provides defaults for missing values
 * @returns {Object} An object with base names as keys and arrays of normalized items as values
 */
const groupedSubItems = computed(() => {
  const grouped = {}

  if (!props.items || !Array.isArray(props.items) || props.items.length === 0) {
    return grouped
  }

  props.items.forEach((storageItem) => {
    const item = {
      id: storageItem.id,
      name: storageItem.name || storageItem.item?.name || 'Ukjent navn',
      expiryDate: storageItem.expiryDate || storageItem.item?.expiryDate || '',
      quantity: storageItem.quantity ?? storageItem.amount ?? 0,
      unit: storageItem.unit || 'Stk',
      duration: storageItem.duration || null,
    }

    const baseName = getBaseName(item.name)
    if (!grouped[baseName]) {
      grouped[baseName] = []
    }

    grouped[baseName].push(item)
  })
  return grouped
})

/**
 * Toggles the expansion/collapse state of a group in the accordion
 * Prevents toggling when in edit mode with an active edit
 *
 * @param {string} groupName - The name of the group to toggle
 */
function toggleSubAccordion(groupName) {
  if (!props.isEditing || (props.isEditing && editingItem.value === null)) {
    if (openSubItems.value.includes(groupName)) {
      openSubItems.value = openSubItems.value.filter((item) => item !== groupName)
    } else {
      openSubItems.value.push(groupName)
    }
  }
}

/**
 * Finds the earliest expiry date among all items in a group
 *
 * @param {Array} group - Array of items in a group
 * @returns {string} The earliest expiry date string or 'N/A' if none
 */
function getEarliestExpiryDate(group) {
  const validDates = group
    .filter((item) => item.expiryDate && item.expiryDate !== 'N/A')
    .map((item) => item.expiryDate)

  if (validDates.length === 0) return 'N/A'

  return validDates.sort()[0]
}

/**
 * Calculates the total quantity of all items in a group
 *
 * @param {Array} group - Array of items in a group
 * @returns {number} The total quantity
 */
function getTotalQuantity(group) {
  return group.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0)
}

/**
 * Gets the expiration status of the earliest expiring item in a group
 *
 * @param {Array} group - Array of items in a group
 * @returns {Object} Object with text description and isExpired flag
 */
function getEarliestItemExpirationStatus(group) {
  if (!group || group.length === 0) {
    return { text: 'N/A', isExpired: false }
  }

  const itemsWithDates = group.filter((item) => item.expiryDate && item.expiryDate !== 'N/A')
  if (itemsWithDates.length === 0) {
    return { text: 'N/A', isExpired: false }
  }

  const sortedItems = [...itemsWithDates].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))
  const earliestItem = sortedItems[0]

  return getExpirationStatus(earliestItem.expiryDate)
}

/**
 * Groups items by their expiry date
 * Adds expiration status to each item
 *
 * @param {Array} items - Array of items to group
 * @returns {Object} Object with expiry dates as keys and arrays of items as values
 */
function groupItemsByExpiryDate(items) {
  const grouped = {}
  items.forEach((item) => {
    const date = item.expiryDate || 'N/A'
    if (!grouped[date]) {
      grouped[date] = []
    }

    item.expirationStatus = getExpirationStatus(date)

    grouped[date].push(item)
  })
  return grouped
}

/**
 * Calculates the total quantity of items in a subgroup (items with same expiry date)
 *
 * @param {Array} subGroup - Array of items with the same expiry date
 * @returns {number} The total quantity
 */
function getSubGroupTotalQuantity(subGroup) {
  return subGroup.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0)
}

/**
 * Converts a date string in format DD.MM.YYYY to YYYY-MM-DD for use with HTML date input
 *
 * @param {string} dateString - Date string in DD.MM.YYYY format
 * @returns {string} Date string in YYYY-MM-DD format or empty string if invalid
 */
function formatDateForInput(dateString) {
  if (!dateString || dateString === 'N/A') return ''

  const parts = dateString.split('.')
  if (parts.length !== 3) return ''

  const day = parts[0].padStart(2, '0')
  const month = parts[1].padStart(2, '0')
  const year = parts[2]

  return `${year}-${month}-${day}`
}

/**
 * Converts a date string from YYYY-MM-DD format to DD.MM.YYYY
 *
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Date string in DD.MM.YYYY format or empty string if invalid
 */
function formatDateForDisplay(dateString) {
  if (!dateString) return ''

  const parts = dateString.split('-')
  if (parts.length !== 3) return ''

  const year = parts[0]
  const month = parts[1]
  const day = parts[2]

  return `${day}.${month}.${year}`
}

/**
 * Enters edit mode for a specific item
 * Sets the current editing item ID and initializes the edit form with item data
 *
 * @param {Object} item - The item to edit
 */
function startEditing(item) {
  editingItem.value = item.id
  editingData.value = {
    expiryDate: formatDateForInput(item.expiryDate) || '',
    quantity: item.quantity || 0,
  }
}

/**
 * Saves the edited item data
 * Emits an update-item event to the parent component with the updated data
 *
 * @param {string|number} itemId - The ID of the item being edited
 */
function saveItemEdit(itemId) {
  const updatedData = {
    expiryDate: formatDateForDisplay(editingData.value.expiryDate),
    quantity: parseFloat(editingData.value.quantity),
  }

  emit('update-item', itemId, updatedData)

  editingItem.value = null
}

/**
 * Deletes an item
 * Emits a delete-item event to the parent component
 *
 * @param {string|number} itemId - The ID of the item to delete
 */
function deleteItem(itemId) {
  emit('delete-item', itemId)
}
</script>

<template>
  <div v-if="!searchQuery" class="p-4 bg-white rounded">
    <div
      class="grid grid-cols-5 items-center p-3 font-semibold text-gray-700 border-b border-gray-300"
    >
      <div class="font-medium pb-3">Navn:</div>
      <div class="font-medium pb-3">Utløps dato:</div>
      <div class="font-medium pb-3">Kvantitet:</div>
      <div class="font-medium pb-3">Går ut på dato om:</div>
    </div>

    <div v-if="groupedSubItems && Object.keys(groupedSubItems).length > 0">
      <div v-for="(group, groupName) in groupedSubItems" :key="groupName" class="mb-4">
        <div
          @click="toggleSubAccordion(groupName)"
          class="grid grid-cols-5 items-center p-2 cursor-pointer hover:bg-gray-50 border-b border-gray-200"
        >
          <div class="font-medium">{{ groupName }}</div>
          <div>{{ getEarliestExpiryDate(group) }}</div>
          <div>{{ getTotalQuantity(group) }} {{ group[0]?.unit || 'stk' }}</div>
          <div>
            <span
              v-if="getEarliestItemExpirationStatus(group).isExpired"
              class="text-red-600 font-medium"
            >{{ getEarliestItemExpirationStatus(group).text }}</span
            >
            <span v-else>{{ getEarliestItemExpirationStatus(group).text }}</span>
          </div>
          <div class="flex justify-end">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              :class="[
                'h-5 w-5 transform transition-transform',
                openSubItems.includes(groupName) ? 'rotate-180' : '',
              ]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>

        <div
          v-if="openSubItems.includes(groupName) && isEditing"
          class="mt-1 border-l-2 border-gray-200"
        >
          <div
            v-for="item in group"
            :key="item.id"
            class="grid grid-cols-5 items-center p-2 hover:bg-gray-50"
          >
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
              <span v-else>{{ item.expiryDate || 'N/A' }}</span>
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
              <span
                v-if="getExpirationStatus(item.expiryDate).isExpired"
                class="text-red-600 font-medium"
              >{{ getExpirationStatus(item.expiryDate).text }}</span
              >
              <span v-else>{{ getExpirationStatus(item.expiryDate).text }}</span>
            </div>
            <div class="flex justify-end space-x-2">
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

        <div v-else-if="openSubItems.includes(groupName)" class="mt-1 border-l-2 border-gray-200">
          <div
            v-for="(subGroup, expiryDate) in groupItemsByExpiryDate(group)"
            :key="expiryDate"
            class="grid grid-cols-5 items-center p-2 hover:bg-gray-50"
          >
            <div>{{ subGroup[0].name }}</div>
            <div>{{ expiryDate }}</div>
            <div>{{ getSubGroupTotalQuantity(subGroup) }} {{ subGroup[0].unit || 'stk' }}</div>
            <div>
              <span
                v-if="subGroup[0].expirationStatus && subGroup[0].expirationStatus.isExpired"
                class="text-red-600 font-medium"
              >{{ subGroup[0].expirationStatus.text }}</span
              >
              <span v-else>{{
                  subGroup[0].expirationStatus ? subGroup[0].expirationStatus.text : ''
                }}</span>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </div>

    <p v-else class="text-gray-500 italic text-center mt-4">Ingen varer funnet.</p>
  </div>

  <div v-else class="p-4 bg-white rounded">
    <div
      class="grid grid-cols-5 items-center p-3 font-semibold text-gray-700 border-b border-gray-300"
    >
      <div class="font-medium pb-3">Navn:</div>
      <div class="font-medium pb-3">Utløps dato:</div>
      <div class="font-medium pb-3">Kvantitet:</div>
      <div class="font-medium pb-3">Går ut på dato om:</div>
    </div>

    <div v-if="items && items.length > 0">
      <div
        v-for="item in items"
        :key="item.id"
        class="grid grid-cols-5 items-center p-2 hover:bg-gray-50 border-b border-gray-200"
      >
        <div class="font-medium">{{ item.name }}</div>
        <div>
          <input
            v-if="editingItem === item.id"
            type="date"
            v-model="editingData.expiryDate"
            class="w-full px-2 py-1 border rounded"
          />
          <span v-else>{{ item.expiryDate || 'N/A' }}</span>
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
          <span
            v-if="getExpirationStatus(item.expiryDate).isExpired"
            class="text-red-600 font-medium"
          >{{ getExpirationStatus(item.expiryDate).text }}</span
          >
          <span v-else>{{ getExpirationStatus(item.expiryDate).text }}</span>
        </div>
        <div v-if="isEditing" class="flex justify-end space-x-2">
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

    <p v-else class="text-gray-500 italic text-center mt-4">Ingen varer funnet.</p>
  </div>
</template>