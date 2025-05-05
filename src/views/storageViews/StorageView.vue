<script setup>
import { ref } from 'vue'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Hourglass, Droplet, Package, Apple, Pill } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

// Mock data - replace with actual data in your implementation
const remainingDays = ref(14)
const overallProgress = ref(75)

const storageItems = ref([
  {
    icon: Apple,
    name: 'Mat',
    selfSufficient: '18 dager',
    expires: '140 dager',
    alert: false
  },
  {
    icon: Droplet,
    name: 'Væske',
    selfSufficient: '12 dager',
    expires: '120 dager',
    alert: true
  },
  {
    icon: Pill,
    name: 'Medisiner',
    selfSufficient: '3 dager',
    expires: '100 dager',
    alert: false
  },
  {
    icon: Package,
    name: 'Diverse',
    selfSufficient: 'N/A',
    expires: '160 dager',
    alert: false
  }
])
</script>

<template>
  <div class="w-full max-w-3xl mx-auto p-6 text-center">
    <h1 class="text-3xl font-bold mb-4">Mitt lagerinnhold</h1>

    <div class="flex items-center justify-center mb-8 gap-2">
      <Hourglass class="h-5 w-5" />
      <p class="text-lg font-medium">Beredskap varer i: {{ remainingDays }} dager</p>
    </div>

    <!-- Overall progress bar -->
    <div class="mb-12">
      <Progress :value="overallProgress" class="h-4 mb-1" />
      <span class="text-sm font-medium">{{ overallProgress }}%</span>
    </div>

    <!-- Storage content section -->
    <div class="border rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-8 border-b pb-2">Lager innhold</h2>

      <div class="grid grid-cols-3 gap-4 mb-4 font-medium">
        <div>Ressurs</div>
        <div>Selvforsynt i:</div>
        <div>Utløper om:</div>
      </div>

      <div v-for="(item, index) in storageItems" :key="index" class="grid grid-cols-3 gap-4 py-4 border-t">
        <div class="flex items-center gap-2">
          <component :is="item.icon" class="h-6 w-6" />
          <span>{{ item.name }}</span>
        </div>
        <div class="flex items-center">
          <span>{{ item.selfSufficient }}</span>
          <span v-if="item.alert" class="text-red-500 ml-2">•</span>
        </div>
        <div>{{ item.expires }}</div>
      </div>

      <div class="mt-8 flex justify-end">
        <RouterLink to="/storage-detail">
        <Button variant="secondary" class="px-4">
          Se detaljert lagerinnhold
        </Button>
        </RouterLink>
      </div>
    </div>
    <div class="border rounded-lg p-6">


    </div>

  </div>

</template>


