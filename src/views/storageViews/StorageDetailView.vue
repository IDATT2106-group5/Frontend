<script setup>
import { ref, onMounted } from "vue";
import { Droplet, Apple, Pill, Package } from "lucide-vue-next";
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

// Import the item store
import { useItemStore } from '@/stores/ItemStore';

// Component state
const openItem = ref(null);
const isEditing = ref(false);

// Get the item store
const itemStore = useItemStore();

// Fetch items when component mounts
onMounted(async () => {
  try {
    await itemStore.fetchAllItems();
  } catch (error) {
    console.error("Failed to load items:", error);
  }
});

const toggleAccordion = (value) => {
  openItem.value = openItem.value === value ? null : value;
};

// Handle item update
const handleItemUpdate = async (id, updatedData) => {
  try {
    await itemStore.updateItem(id, updatedData);
  } catch (error) {
    console.error("Failed to update item:", error);
  }
};

// Handle item deletion
const handleItemDelete = async (id) => {
  try {
    await itemStore.deleteItem(id);
  } catch (error) {
    console.error("Failed to delete item:", error);
  }
};
</script>

<template>
  <div>
    <StorageNavbar />
    <SearchBar />
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

      <div v-if="itemStore.isLoading" class="flex justify-center py-10">
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="itemStore.error" class="p-4 bg-red-100 text-red-700 rounded">
        {{ itemStore.error }}
      </div>

      <Accordion v-else-if="!itemStore.isEmpty" type="single" collapsible v-model:value="openItem">
        <!-- Væske category -->
        <AccordionItem value="væske">
          <AccordionTrigger @click="toggleAccordion('væske')">
            <div class="flex items-center gap-3">
              <Droplet class="ml-2 h-6 w-6 shrink-0 text-black" />
              <span class="text-lg text-black">Væske</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <EditableNestedItemList
              :items="itemStore.groupedItems.Væske"
              :isEditing="isEditing"
              @update-item="handleItemUpdate"
              @delete-item="handleItemDelete"
            />
          </AccordionContent>
        </AccordionItem>

        <!-- Mat category -->
        <AccordionItem value="mat">
          <AccordionTrigger @click="toggleAccordion('mat')">
            <div class="flex items-center gap-3">
              <Apple class="ml-2 h-6 w-6 shrink-0 text-black" />
              <span class="text-lg text-black">Mat</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <EditableNestedItemList
              :items="itemStore.groupedItems.Mat"
              :isEditing="isEditing"
              @update-item="handleItemUpdate"
              @delete-item="handleItemDelete"
            />
          </AccordionContent>
        </AccordionItem>

        <!-- Medisiner category -->
        <AccordionItem value="medisiner">
          <AccordionTrigger @click="toggleAccordion('medisiner')">
            <div class="flex items-center gap-3">
              <Pill class="ml-2 h-6 w-6 shrink-0 text-black" />
              <span class="text-lg text-black">Medisiner</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <EditableNestedItemList
              :items="itemStore.groupedItems.Medisiner"
              :isEditing="isEditing"
              @update-item="handleItemUpdate"
              @delete-item="handleItemDelete"
            />
          </AccordionContent>
        </AccordionItem>

        <!-- Diverse category -->
        <AccordionItem value="diverse">
          <AccordionTrigger @click="toggleAccordion('diverse')">
            <div class="flex items-center gap-3">
              <Package class="ml-2 h-6 w-6 shrink-0 text-black" />
              <span class="text-lg text-black">Diverse</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <EditableNestedItemList
              :items="itemStore.groupedItems.Diverse"
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
