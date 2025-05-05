<script setup>
import { ref, onMounted, provide, computed } from "vue";
import { Droplet, Apple, Pill, Hammer, Package } from "lucide-vue-next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

import StorageNavbar from "@/components/StorageNavbar.vue";
import EditableNestedItemList from "@/components/EditableNestedItemList.vue";
import SearchBar from '@/components/SearchBar.vue';
import AddStorageItem from '@/components/AddStorageItem.vue';

import { useStorageStore } from '@/stores/StorageStore.js';
import { useUserStore } from '@/stores/UserStore.js';
import { useHouseholdStore } from '@/stores/HouseholdStore.js';
import UserService from '@/service/userService';

/**
 * Category mapping for accordion values
 * Maps display category names to their corresponding accordion values
 * @type {Object}
 */
const CATEGORY_TO_ACCORDION = {
  'all': null,
  'væske': 'vaske',
  'mat': 'mat',
  'medisiner': 'medisiner',
  'redskap': 'redskap',
  'diverse': 'diverse'
};

const openItem = ref(null);
const isEditing = ref(false);
const isLoading = ref(true);
const error = ref(null);
const activeCategory = ref('all');

const storageStore = useStorageStore();
const userStore = useUserStore();
const householdStore = useHouseholdStore();

/**
 * Computes the capitalized category name for display in the heading
 * @returns {string} The properly capitalized category name
 */
const capitalizedCategory = computed(() => {
  if (activeCategory.value === 'all') {
    return 'Lager innhold';
  }
  return activeCategory.value.charAt(0).toUpperCase() + activeCategory.value.slice(1);
});

/**
 * Event handler for navigation item clicks
 * Sets the active category and updates the open accordion item
 * @param {string} category - The category that was clicked
 */
const handleNavItemClick = (category) => {
  console.log(`Nav item clicked: ${category}`);
  setActiveCategory(category);
};

/**
 * Sets the active category and updates the open accordion item accordingly
 * @param {string} category - The category to set as active
 */
const setActiveCategory = (category) => {
  activeCategory.value = category;
  openItem.value = CATEGORY_TO_ACCORDION[category.toLowerCase()];
};

/**
 * Toggles the accordion open/closed state
 * @param {string} value - The accordion item value to toggle
 */
const toggleAccordion = (value) => {
  openItem.value = openItem.value === value ? null : value;
};

/**
 * Handles item updates by delegating to the store
 * @param {string|number} id - The ID of the item to update
 * @param {Object} data - The updated item data
 */
const handleItemUpdate = async (id, data) => {
  console.log("Parent received update-item event with ID:", id);
  console.log("Data to update:", data);
  try {
    await storageStore.updateItem(id, data);
  } catch (e) {
    console.error('Failed to update item:', e);
  }
};

/**
 * Handles item deletion by delegating to the store
 * @param {string|number} id - The ID of the item to delete
 */
const handleItemDelete = async (id) => {
  try {
    await storageStore.deleteItem(id);
  } catch (e) {
    console.error('Failed to delete item:', e);
  }
};

/**
 * Handles item addition by delegating to the store
 * @param {Object} item - The item object containing itemId and data properties
 * @param {string|number} item.itemId - The ID of the item template
 * @param {Object} item.data - The additional item data
 */
const handleItemAdd = async (item) => {
  try {
    await storageStore.addItem(item.itemId, item.data);
  } catch (e) {
    console.error('Failed to add item:', e);
  }
};

/**
 * Initializes the component by loading household data and storage items
 * Runs once on component mount
 */
onMounted(async () => {
  try {
    isLoading.value = true;
    error.value = null;

    await householdStore.checkCurrentHousehold();

    if (householdStore.hasHousehold) {
      const response = await UserService.getCurrentHouseholdByUserId(userStore.user.id);
      const householdId = response.id;
      storageStore.setCurrentHouseholdId(householdId);
      await storageStore.fetchItems();
      console.log('Items:', storageStore.items);
    }

  } catch (e) {
    console.error('Failed to initialize storage:', e);
    error.value = e.message || 'Failed to load storage data';
  } finally {
    isLoading.value = false;
  }
});

provide('handleNavItemClick', handleNavItemClick);
</script>

<template>
  <div>
    <StorageNavbar />
    <div>
      <div class="mt-6">
        <SearchBar />
      </div>
      <div class="pl-20 pr-20" >
        <div class="mb-4 mt-4 flex justify-between items-center">
          <h2 class="text-xl font-bold">
            {{ capitalizedCategory }}
          </h2>
          <div class="flex gap-2">
            <Button
              @click="isEditing = !isEditing"
              class="px-4 py-2 rounded text-sm font-medium"
              :class="isEditing ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'"
            >
              {{ isEditing ? 'Lukk' : 'Rediger' }}
            </Button>
          </div>
        </div>

        <div v-if="isLoading || storageStore.isLoading" class="flex justify-center py-10">
          <div
            class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>

        <div v-else-if="error" class="p-4 bg-red-100 text-red-700 rounded">
          {{ error }}
        </div>

        <div v-else-if="storageStore.error" class="p-4 bg-red-100 text-red-700 rounded">
          {{ storageStore.error }}
        </div>

        <Accordion type="single" collapsible
                   v-model:value="openItem">
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
              <AddStorageItem
                v-if="isEditing"
                category="Væske"
                @add-item="handleItemAdd"
              />
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
              <AddStorageItem
                v-if="isEditing"
                category="Mat"
                @add-item="handleItemAdd"
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem v-if="activeCategory === 'all' || activeCategory === 'medisiner'" value="medisiner">
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
              <AddStorageItem
                v-if="isEditing"
                category="Medisiner"
                @add-item="handleItemAdd"
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem v-if="activeCategory === 'all' || activeCategory === 'redskap'" value="redskap">
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
              <AddStorageItem
                v-if="isEditing"
                category="Redskap"
                @add-item="handleItemAdd"
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem v-if="activeCategory === 'all' || activeCategory === 'diverse'" value="diverse">
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
              <AddStorageItem
                v-if="isEditing"
                category="Diverse"
                @add-item="handleItemAdd"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  </div>
</template>