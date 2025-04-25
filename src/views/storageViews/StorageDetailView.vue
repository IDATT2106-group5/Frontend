<script setup>
import { ref, onMounted } from "vue";
import { Droplet, Apple, Pill, Package } from "lucide-vue-next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

import StorageNavbar from "@/components/StorageNavbar.vue";
import ItemList from "@/components/ItemList.vue";
import SearchBar from '@/components/SearchBar.vue'
import { Button } from '@/components/ui/button/index.js'

// Component state
const groupedItems = ref({
  Væske: [],
  Mat: [],
  Medisiner: [],
  Diverse: [],
});

// Track which accordion items are open
const openItem = ref(null);

const toggleAccordion = (value) => {
  openItem.value = openItem.value === value ? null : value;
};

// Methods
const fetchItems = async () => {
  try {
    const response = await fetch("/api/items");
    const fetchedItems = await response.json();

    // Group items by category
    groupedItems.value = fetchedItems.reduce((groups, item) => {
      const { category } = item;
      if (groups[category]) {
        groups[category].push(item);
      }
      return groups;
    }, {
      Væske: [],
      Mat: [],
      Medisiner: [],
      Diverse: [],
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    // Ensure we have empty arrays for each category even on error
    groupedItems.value = {
      Væske: [],
      Mat: [],
      Medisiner: [],
      Diverse: [],
    };
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchItems();
});
</script>

<template>
  <div>
    <StorageNavbar />
    <SearchBar/>
    <!-- Info header -->
    <div class="flex items-end mb-4 pr-20 pl-20 pt-10">
      <div class="w-1/4 font-semibold text-sm uppercase text-gray-600">Navn</div>
      <div class="w-1/4 font-semibold text-sm uppercase text-gray-600">Tidligst utløpsdato</div>
      <div class="w-1/4 font-semibold text-sm uppercase text-gray-600">Antall</div>
      <div class="w-1/4 font-semibold text-sm uppercase text-gray-600">Hvor lenge varer dette</div>
      <Button type="submit" className="text-black border border-black rounded-2xl px-4 py-2
      text-sm hover:bg-black hover:text-white transition-colors">Rediger</Button>
    </div>

    <div class="pl-20 pr-20">
      <Accordion type="single" collapsible v-model:value="openItem">
        <!-- Væske category -->
        <AccordionItem value="væske">
          <AccordionTrigger @click="toggleAccordion('væske')">
            <div class="flex items-center gap-3">
              <Droplet class="ml-2 h-6 w-6 shrink-0 text-black" />
              <span class="text-lg text-black">Væske</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ItemList :items="groupedItems.Væske" />
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
            <ItemList :items="groupedItems.Mat" />
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
            <ItemList :items="groupedItems.Medisiner" />
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
            <ItemList :items="groupedItems.Diverse" />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </div>
</template>
