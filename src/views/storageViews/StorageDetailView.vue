<script setup>
import {ref, onMounted} from "vue";
import {Droplet, Apple, Pill, Package} from "lucide-vue-next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {Button} from '@/components/ui/button';

import StorageNavbar from "@/components/StorageNavbar.vue";
import EditableNestedItemList from "@/components/EditableNestedItemList.vue";
import SearchBar from '@/components/SearchBar.vue';

// Pinia store and router
import {useStorageStore} from '@/stores/storageStore.js';
import {useRoute} from 'vue-router';

// Component state
const openItem = ref(null);
const isEditing = ref(false);

// Initialize store & route
const storageStore = useStorageStore();
const route = useRoute();

// Extract householdId from route and set in store
const householdId = Number(route.params.householdId);
storageStore.setHouseholdId(householdId);

// Fetch all items on mount
onMounted(async () => {
  try {
    await storageStore.fetchAllItems();
  } catch (e) {
    console.error('Failed to load items:', e);
  }
});

// Accordion toggle
const toggleAccordion = (value) => {
  openItem.value = openItem.value === value ? null : value;
};

// Handle updates/deletes
const handleItemUpdate = (id, data) =>
  storageStore.updateStorageItem(id, data);

const handleItemDelete = (id) =>
  storageStore.removeItemFromStorage(id);
</script>

<template>
  <div>
    <StorageNavbar/>
    <SearchBar/>
    <div class="pl-20 pr-20">

      <div class="mb-4 mt-4 flex justify-between items-center">
        <h2 class="text-xl font-bold">Lager innhold</h2>
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

      <div v-if="storageStore.isLoading" class="flex justify-center py-10">
        <div
          class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="storageStore.error" class="p-4 bg-red-100 text-red-700 rounded">
        {{ storageStore.error }}
      </div>

      <Accordion v-else-if="!storageStore.isEmpty" type="single" collapsible
                 v-model:value="openItem">
        <!-- Væske -->
        <AccordionItem value="vaske">
          <AccordionTrigger @click="toggleAccordion('vaske')">
            <div class="flex items-center gap-3">
              <Droplet/>
              Væske
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <EditableNestedItemList
              :items="storageStore.groupedItems.Væske"
              :isEditing="isEditing"
              @update-item="handleItemUpdate"
              @delete-item="handleItemDelete"
            />
          </AccordionContent>
        </AccordionItem>

        <!-- Mat -->
        <AccordionItem value="mat">
          <AccordionTrigger @click="toggleAccordion('mat')">
            <div class="flex items-center gap-3">
              <Apple/>
              Mat
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <EditableNestedItemList
              :items="storageStore.groupedItems.Mat"
              :isEditing="isEditing"
              @update-item="handleItemUpdate"
              @delete-item="handleItemDelete"
            />
          </AccordionContent>
        </AccordionItem>

        <!-- Medisiner -->
        <AccordionItem value="medisiner">
          <AccordionTrigger @click="toggleAccordion('medisiner')">
            <div class="flex items-center gap-3">
              <Pill/>
              Medisiner
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <EditableNestedItemList
              :items="storageStore.groupedItems.Medisiner"
              :isEditing="isEditing"
              @update-item="handleItemUpdate"
              @delete-item="handleItemDelete"
            />
          </AccordionContent>
        </AccordionItem>

        <!-- Diverse -->
        <AccordionItem value="diverse">
          <AccordionTrigger @click="toggleAccordion('diverse')">
            <div class="flex items-center gap-3">
              <Package/>
              Diverse
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <EditableNestedItemList
              :items="storageStore.groupedItems.Diverse"
              :isEditing="isEditing"
              @update-item="handleItemUpdate"
              @delete-item="handleItemDelete"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div v-else class="py-10 text-center text-gray-500">
        <p>Ingen varer funnet. Legg til varer for å se dem her.</p>
      </div>
    </div>
  </div>
</template>
