<script>
import { defineComponent, ref } from 'vue';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion/index.js";
import StorageNavbar from '@/components/StorageNavbar.vue';
import { ChevronDown, ChevronUp } from 'lucide-vue-next';

export default defineComponent({
  components: { StorageNavbar, Accordion, AccordionContent, AccordionItem, AccordionTrigger },
  setup() {
    const showDetails = ref({}); // Use an object to track toggle states for each item

    const toggleDetails = (item) => {
      showDetails.value[item] = !showDetails.value[item];
    };

    return { showDetails, toggleDetails, ChevronDown, ChevronUp };
  },
});
</script>

<template>
  <div>
    <StorageNavbar />
  </div>

  <Accordion type="single" collapsible>
    <AccordionItem value="item-1">
      <AccordionTrigger @click="toggleDetails('item-1')">
        Væske
        <component
          :is="showDetails['item-1'] ? ChevronUp : ChevronDown"
          class="text-black w-8 h-8"
        />
      </AccordionTrigger>
      <AccordionContent>
        Yes. It adheres to the WAI-ARIA design pattern.
      </AccordionContent>
    </AccordionItem>
  </Accordion>

  <Accordion type="single" collapsible>
    <AccordionItem value="item-2">
      <AccordionTrigger @click="toggleDetails('item-2')">
        Mat
      </AccordionTrigger>
      <AccordionContent>
        Yes. It adheres to the WAI-ARIA design pattern.
      </AccordionContent>
    </AccordionItem>
  </Accordion>

  <Accordion type="single" collapsible>
    <AccordionItem value="item-3">
      <AccordionTrigger @click="toggleDetails('item-3')">
        Medisiner
      </AccordionTrigger>
      <AccordionContent>
        Yes. It adheres to the WAI-ARIA design pattern.
      </AccordionContent>
    </AccordionItem>
  </Accordion>

  <Accordion type="single" collapsible>
    <AccordionItem value="item-4">
      <AccordionTrigger @click="toggleDetails('item-4')">
        Diverse
      </AccordionTrigger>
      <AccordionContent>
        Yes. It adheres to the WAI-ARIA design pattern.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
