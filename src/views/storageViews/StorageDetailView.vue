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

// Services and store
import { useStorageStore } from '@/stores/StorageStore.js';
import { useUserStore } from '@/stores/UserStore.js';
import UserService from '@/service/userService';
import AddStorageItem from '@/components/AddStorageItem.vue'
import { useHouseholdStore } from '@/stores/HouseholdStore.js'

// Component state
const openItem = ref(null);
const isEditing = ref(false);
const isLoading = ref(true);
const error = ref(null);
const activeCategory = ref('all'); // New state to track active category

// Initialize store
const storageStore = useStorageStore();
const userStore = useUserStore();
const householdStore = useHouseholdStore();

// Custom event bus to listen for navbar clicks
const handleNavItemClick = (category) => {
  console.log(`Nav item clicked: ${category}`);
  setActiveCategory(category);
};

// Capitalize first letter of category for heading
const capitalizedCategory = computed(() => {
  if (activeCategory.value === 'all') {
    return 'Lager innhold';
  }
  return activeCategory.value.charAt(0).toUpperCase() + activeCategory.value.slice(1);
});

// Provide the event handler to be used by StorageNavbar
provide('handleNavItemClick', handleNavItemClick);

// Set active category and open corresponding accordion
const setActiveCategory = (category) => {
  activeCategory.value = category;

  // Map category names to accordion values
  const categoryToAccordion = {
    'all': null, // Show all accordions but keep them closed
    'væske': 'vaske',
    'mat': 'mat',
    'medisiner': 'medisiner',
    'redskap': 'redskap',
    'diverse': 'diverse'
  };

  // Set the open accordion based on category
  openItem.value = categoryToAccordion[category.toLowerCase()];
};

// Fetch household ID and then storage items on mount
onMounted(async () => {
  try {
    isLoading.value = true;
    error.value = null;

    // Check if user has a household
    await householdStore.checkCurrentHousehold();

    // If they do, load their household items
    if (householdStore.hasHousehold) {
      const response = await UserService.getCurrentHouseholdByUserId(userStore.user.id);
      const householdId = response.id;
      storageStore.setCurrentHouseholdId(householdId);
      await storageStore.fetchItems();
    }

  } catch (e) {
    console.error('Failed to initialize storage:', e);
    error.value = e.message || 'Failed to load storage data';
  } finally {
    isLoading.value = false;
  }
});

// Accordion toggle (keeping this for manual toggles)
const toggleAccordion = (value) => {
  openItem.value = openItem.value === value ? null : value;
};

// Handle updates/deletes
const handleItemUpdate = async (id, data) => {
  console.log("Parent received update-item event with ID:", id);
  console.log("Data to update:", data);
  try {
    await storageStore.updateItem(id, data);
  } catch (e) {
    console.error('Failed to update item:', e);
    // You could show an error message to the user here
  }
};

const handleItemDelete = async (id) => {
  try {
    await storageStore.deleteItem(id);
  } catch (e) {
    console.error('Failed to delete item:', e);
    // You could show an error message to the user here
  }
};

const handleItemAdd = async (item) => {
  try {
    // The item object now contains itemId and data properties
    await storageStore.addItem(item.itemId, item.data);
  } catch (e) {
    console.error('Failed to add item:', e);
    // Show an error message to the user
  }
};
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

        <!-- Show loading state during initial household and items fetch -->
        <div v-if="isLoading || storageStore.isLoading" class="flex justify-center py-10">
          <div
            class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>

        <!-- Show primary errors from component level -->
        <div v-else-if="error" class="p-4 bg-red-100 text-red-700 rounded">
          {{ error }}
        </div>

        <!-- Show errors from store -->
        <div v-else-if="storageStore.error" class="p-4 bg-red-100 text-red-700 rounded">
          {{ storageStore.error }}
        </div>

        <!-- Main content when data is available -->
        <Accordion type="single" collapsible
                   v-model:value="openItem">
          <!-- Væske - Only show when activeCategory is 'all' or 'væske' -->
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
              <!-- Only show AddStorageItem when in edit mode -->
              <AddStorageItem
                v-if="isEditing"
                category="Væske"
                @add-item="handleItemAdd"
              />
            </AccordionContent>
          </AccordionItem>

          <!-- Mat - Only show when activeCategory is 'all' or 'mat' -->
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
              <!-- Only show AddStorageItem when in edit mode -->
              <AddStorageItem
                v-if="isEditing"
                category="Mat"
                @add-item="handleItemAdd"
              />
            </AccordionContent>
          </AccordionItem>

          <!-- Medisiner - Only show when activeCategory is 'all' or 'medisiner' -->
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
              <!-- Only show AddStorageItem when in edit mode -->
              <AddStorageItem
                v-if="isEditing"
                category="Medisiner"
                @add-item="handleItemAdd"
              />
            </AccordionContent>
          </AccordionItem>

          <!-- Redskap - Only show when activeCategory is 'all' or 'redskap' -->
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
              <!-- Only show AddStorageItem when in edit mode -->
              <AddStorageItem
                v-if="isEditing"
                category="Redskap"
                @add-item="handleItemAdd"
              />
            </AccordionContent>
          </AccordionItem>

          <!-- Diverse - Only show when activeCategory is 'all' or 'diverse' -->
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
              <!-- Only show AddStorageItem when in edit mode -->
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