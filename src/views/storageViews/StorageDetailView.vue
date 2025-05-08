<script setup>
import { computed, onMounted, provide, ref } from 'vue'
import { Apple, Droplet, Hammer, Package, Pill } from 'lucide-vue-next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

import StorageNavbar from '@/components/storageComponents/StorageNavbar.vue'
import EditableNestedItemList from '@/components/storageComponents/EditableNestedItemList.vue'
import SearchBar from '@/components/storageComponents/SearchBar.vue'
import AddStorageItem from '@/components/storageComponents/AddStorageItem.vue'

import { useStorageStore } from '@/stores/StorageStore.js'
import { useUserStore } from '@/stores/UserStore.js'
import { useHouseholdStore } from '@/stores/HouseholdStore.js'
import UserService from '@/service/userService'

/**
 * Category mapping for accordion values
 * Maps display category names to their corresponding accordion values
 * @type {Object}
 */
const CATEGORY_TO_ACCORDION = {
  all: null,
  væske: 'vaske',
  mat: 'mat',
  medisiner: 'medisiner',
  redskap: 'redskap',
  diverse: 'diverse',
}

const openItem = ref(null)
const isEditing = ref(false)
const isLoading = ref(true)
const error = ref(null)
const activeCategory = ref('all')
const searchQuery = ref('')
const searchResults = ref(null)

const storageStore = useStorageStore()
const userStore = useUserStore()
const householdStore = useHouseholdStore()

/**
 * Computes the capitalized category name for display in the heading
 * @returns {string} The properly capitalized category name
 */
const capitalizedCategory = computed(() => {
  if (activeCategory.value === 'all') {
    return 'Lager innhold'
  }
  return activeCategory.value.charAt(0).toUpperCase() + activeCategory.value.slice(1)
})

/**
 * Event handler for navigation item clicks
 * Sets the active category and updates the open accordion item
 * @param {string} category - The category that was clicked
 */
const handleNavItemClick = (category) => {
  setActiveCategory(category)
}

/**
 * Sets the active category and updates the open accordion item accordingly
 * @param {string} category - The category to set as active
 */
const setActiveCategory = (category) => {
  activeCategory.value = category
  openItem.value = CATEGORY_TO_ACCORDION[category.toLowerCase()]
}

/**
 * Toggles the accordion open/closed state
 * @param {string} value - The accordion item value to toggle
 */
const toggleAccordion = (value) => {
  openItem.value = openItem.value === value ? null : value
}

/**
 * Handles item updates by delegating to the store
 * @param {string|number} id - The ID of the item to update
 * @param {Object} data - The updated item data
 */
const handleItemUpdate = async (id, data) => {
  try {
    await storageStore.updateItem(id, data)

    if (searchQuery.value) {
      handleSearch(searchQuery.value)
    }
  } catch (e) {
    console.error('Failed to update item:', e)
  }
}

/**
 * Handles item deletion by delegating to the store
 * @param {string|number} id - The ID of the item to delete
 */
const handleItemDelete = async (id) => {
  try {
    await storageStore.deleteItem(id)

    if (searchQuery.value) {
      handleSearch(searchQuery.value)
    }
  } catch (e) {
    console.error('Failed to delete item:', e)
  }
}

/**
 * Handles item addition by delegating to the store
 * @param {Object} item - The item object containing itemId and data properties
 * @param {string|number} item.itemId - The ID of the item template
 * @param {Object} item.data - The additional item data
 */
const handleItemAdd = async (item) => {
  try {
    await storageStore.addItem(item.itemId, item.data)

    if (searchQuery.value) {
      handleSearch(searchQuery.value)
    }
  } catch (e) {
    console.error('Failed to add item:', e)
  }
}

/**
 * Gets items from the store by their IDs
 * Used to retrieve full items for search results
 *
 * @param {string} category - The category to look in
 * @param {Array} itemIds - Array of item IDs to retrieve
 * @returns {Array} - The full item objects
 */
const getItemsById = (category, itemIds) => {
  if (!storageStore.groupedItems[category]) return []

  return itemIds
    .map((id) => {
      const originalItem = storageStore.groupedItems[category].find((item) => item.id === id)
      return originalItem || null
    })
    .filter((item) => item !== null)
}

/**
 * Handles search input and filters the storage items
 * NEW IMPLEMENTATION: Store item IDs instead of copies
 * @param {string} query - The search query
 */
const handleSearch = (query) => {
  searchQuery.value = query

  if (!query) {
    searchResults.value = null
    return
  }

  const lowerQuery = query.toLowerCase()
  const results = {}

  Object.entries(storageStore.groupedItems).forEach(([category, items]) => {
    if (!items || !Array.isArray(items)) return

    const matchedItemIds = items
      .filter((item) => {
        const name = (item.name || '').toLowerCase()
        const expiryDate = (item.expiryDate || '').toLowerCase()
        const quantity = String(item.quantity || '')
        const unit = (item.unit || '').toLowerCase()

        return (
          name.includes(lowerQuery) ||
          expiryDate.includes(lowerQuery) ||
          quantity.includes(lowerQuery) ||
          unit.includes(lowerQuery)
        )
      })
      .map((item) => item.id)

    if (matchedItemIds.length > 0) {
      results[category] = matchedItemIds
    }
  })

  searchResults.value = results
}

/**
 * Initializes the component by loading household data and storage items
 * Runs once on component mount
 */
onMounted(async () => {
  try {
    isLoading.value = true
    error.value = null

    await householdStore.checkCurrentHousehold()

    if (householdStore.hasHousehold) {
      const response = await UserService.getCurrentHouseholdByUserId(userStore.user.id)
      const householdId = response.id
      storageStore.setCurrentHouseholdId(householdId)
      await storageStore.fetchItems()
    }
  } catch (e) {
    console.error('Failed to initialize storage:', e)
    error.value = e.message || 'Failed to load storage data'
  } finally {
    isLoading.value = false
  }
})

provide('handleNavItemClick', handleNavItemClick)
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <StorageNavbar />
    <div class="px-4 sm:px-8 md:px-12 lg:px-20 mt-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div class="hidden sm:block sm:col-span-1"></div>

        <div class="col-span-1 flex justify-center order-1 sm:order-2">
          <SearchBar @search="handleSearch" class="w-full" />
        </div>

        <div class="col-span-1 flex justify-center sm:justify-end order-2 sm:order-3 mt-4 sm:mt-0">
          <Button
            @click="isEditing = !isEditing"
            class="px-3 sm:px-4 py-2 rounded text-sm font-medium w-full sm:w-auto text-center"
            :class="isEditing ? 'bg-red-600 text-white' : 'bg-[#2c3e50] text-white'"
          >
            {{ isEditing ? 'Lukk' : 'Rediger - / Legg til i lager' }}
          </Button>
        </div>
      </div>
    </div>

    <div class="px-20 flex-grow">
      <div v-if="searchQuery && searchResults" class="mb-6 mt-4">
        <h2 class="text-xl font-bold mb-3">Søkeresultater for "{{ searchQuery }}"</h2>

        <div v-if="Object.keys(searchResults).length === 0" class="p-4 bg-gray-100 rounded">
          Ingen resultater funnet.
        </div>

        <div v-else>
          <div v-for="(itemIds, category) in searchResults" :key="category" class="mb-6">
            <h3 class="font-medium text-lg mb-2">{{ category }}</h3>
            <EditableNestedItemList
              :items="getItemsById(category, itemIds)"
              :isEditing="isEditing"
              :searchQuery="searchQuery"
              @update-item="handleItemUpdate"
              @delete-item="handleItemDelete"
            />
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center py-10">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2c3e50]"></div>
      </div>

      <div v-if="error" class="p-4 bg-red-100 text-red-700 rounded mb-4">
        {{ error }}
      </div>

      <div v-if="!isLoading" class="mb-4 mt-4">
        <h2 class="text-xl font-bold">
          {{ capitalizedCategory }}
        </h2>
      </div>

      <Accordion v-if="!isLoading" type="single" collapsible v-model:value="openItem">
        <AccordionItem v-if="activeCategory === 'all' || activeCategory === 'væske'" value="vaske">
          <AccordionTrigger @click="toggleAccordion('vaske')">
            <div class="flex items-center gap-3">
              <Droplet />
              Væske
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <EditableNestedItemList
              :items="storageStore.groupedItems['Væske']"
              :isEditing="isEditing"
              @update-item="handleItemUpdate"
              @delete-item="handleItemDelete"
            />
            <AddStorageItem v-if="isEditing" category="Væske" @add-item="handleItemAdd" />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem v-if="activeCategory === 'all' || activeCategory === 'mat'" value="mat">
          <AccordionTrigger @click="toggleAccordion('mat')">
            <div class="flex items-center gap-3">
              <Apple />
              Mat
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <EditableNestedItemList
              :items="storageStore.groupedItems['Mat']"
              :isEditing="isEditing"
              @update-item="handleItemUpdate"
              @delete-item="handleItemDelete"
            />
            <AddStorageItem v-if="isEditing" category="Mat" @add-item="handleItemAdd" />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          v-if="activeCategory === 'all' || activeCategory === 'medisiner'"
          value="medisiner"
        >
          <AccordionTrigger @click="toggleAccordion('medisiner')">
            <div class="flex items-center gap-3">
              <Pill />
              Medisiner
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <EditableNestedItemList
              :items="storageStore.groupedItems['Medisiner']"
              :isEditing="isEditing"
              @update-item="handleItemUpdate"
              @delete-item="handleItemDelete"
            />
            <AddStorageItem v-if="isEditing" category="Medisiner" @add-item="handleItemAdd" />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          v-if="activeCategory === 'all' || activeCategory === 'redskap'"
          value="redskap"
        >
          <AccordionTrigger @click="toggleAccordion('redskap')">
            <div class="flex items-center gap-3">
              <Hammer />
              Redskap
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <EditableNestedItemList
              :items="storageStore.groupedItems['Redskap']"
              :isEditing="isEditing"
              @update-item="handleItemUpdate"
              @delete-item="handleItemDelete"
            />
            <AddStorageItem v-if="isEditing" category="Redskap" @add-item="handleItemAdd" />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          v-if="activeCategory === 'all' || activeCategory === 'diverse'"
          value="diverse"
        >
          <AccordionTrigger @click="toggleAccordion('diverse')">
            <div class="flex items-center gap-3">
              <Package />
              Diverse
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <EditableNestedItemList
              :items="storageStore.groupedItems['Diverse']"
              :isEditing="isEditing"
              @update-item="handleItemUpdate"
              @delete-item="handleItemDelete"
            />
            <AddStorageItem v-if="isEditing" category="Diverse" @add-item="handleItemAdd" />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </div>
</template>
