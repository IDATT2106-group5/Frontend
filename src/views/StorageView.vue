<script>
import { defineComponent } from 'vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Navbar from '@/components/Navbar.vue'
import StorageNavbar from '@/components/StorageNavbar.vue'


export default defineComponent({
  components: { StorageNavbar, Accordion, AccordionContent, AccordionItem, AccordionTrigger, Navbar }
})


</script>

<template>
  <div>
    <Navbar />
    <StorageNavbar />
  </div>


  <Accordion type="single" collapsible>
    <AccordionItem value="item-1">
      <AccordionTrigger>Is it accessible?</AccordionTrigger>
      <AccordionContent>
        Yes. It adheres to the WAI-ARIA design pattern.
      </AccordionContent>
    </AccordionItem>
  </Accordion>


</template>
