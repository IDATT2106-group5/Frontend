<script setup>
import { ref, computed, onMounted } from 'vue'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Hourglass, Droplet, Package, Apple, Pill, Hammer } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { useStorageStore } from '@/stores/StorageStore'
import { useHouseholdStore } from '@/stores/HouseholdStore'

// Access stores
const storageStore = useStorageStore()
const householdStore = useHouseholdStore()

// Constants for daily needs per person
const DAILY_CALORIES_NEEDED = 2000 // calories per day per person
const DAILY_WATER_NEEDED = 3 // liters per day per person

// Computed values based on household size
const householdSize = computed(() => householdStore.totalMemberCount || 1)
const weeklyCaloriesNeeded = computed(() => DAILY_CALORIES_NEEDED * 7 * householdSize.value)
const weeklyWaterNeeded = computed(() => DAILY_WATER_NEEDED * 7 * householdSize.value)

// Method to get calories for food items directly from the database
function getCaloriesForFood(item) {
  if (!item || !item.item || item.item.itemType !== 'FOOD') {
    return 0
  }

  // Get the calorie value directly from the item data
  const calories = item.item.calories || 0

  // Get the amount
  const amount = item.amount || 0

  // Return total calories (calories per unit × amount)
  return calories * amount
}

// Calculate total calories from food items
const totalCalories = computed(() => {
  if (!storageStore.items || storageStore.items.length === 0) return 0

  return storageStore.items.reduce((sum, item) => {
    // Only calculate calories for food items
    if (item.item && item.item.itemType === 'FOOD') {
      return sum + getCaloriesForFood(item)
    }
    return sum
  }, 0)
})

// Calculate total water from liquid items
const totalWater = computed(() => {
  if (!storageStore.items || storageStore.items.length === 0) return 0

  return storageStore.items.reduce((sum, item) => {
    // Only count liquid items
    if (item.item && item.item.itemType === 'LIQUIDS') {
      // Convert to liters if necessary
      let amount = item.amount || 0
      const unit = item.unit ? item.unit.toLowerCase() : 'liter'

      // Handle different units
      if (unit === 'ml' || unit === 'milliliter') {
        amount = amount / 1000
      } else if (unit === 'dl' || unit === 'desiliter') {
        amount = amount / 10
      } else if (unit === 'cl' || unit === 'centiliter') {
        amount = amount / 100
      }

      return sum + amount
    }
    return sum
  }, 0)
})

// Calculate days of sustainability
const foodDays = computed(() => {
  if (!totalCalories.value || !householdSize.value) return 0
  return Math.floor(totalCalories.value / (DAILY_CALORIES_NEEDED * householdSize.value))
})

const waterDays = computed(() => {
  if (!totalWater.value || !householdSize.value) return 0
  return Math.floor(totalWater.value / (DAILY_WATER_NEEDED * householdSize.value))
})

// Minimum days the household can sustain (the limiting factor)
const remainingDays = computed(() => Math.min(foodDays.value, waterDays.value))

// Overall preparedness progress (100% = 7 days of supplies)
const overallProgress = computed(() => {
  const progress = (remainingDays.value / 7) * 100
  return Math.min(Math.round(progress), 100) // Cap at 100%
})

// Get earliest expiration date for each category
function getEarliestExpiry(itemType) {
  const items = storageStore.getItemsByType(itemType)
  if (!items || items.length === 0) return 'N/A'

  const now = new Date()
  let earliestDate = null
  let daysUntilExpiry = Infinity

  items.forEach(item => {
    if (item.expiration) {
      const expiryDate = new Date(item.expiration)
      const daysDiff = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))

      if (daysDiff < daysUntilExpiry && daysDiff > 0) {
        daysUntilExpiry = daysDiff
        earliestDate = expiryDate
      }
    }
  })

  return daysUntilExpiry < Infinity ? `${daysUntilExpiry} dager` : 'N/A'
}

// Storage items with computed values
const storageItems = computed(() => [
  {
    icon: Droplet,
    name: 'Væske',
    selfSufficient: `${waterDays.value} dager`,
    expires: getEarliestExpiry('LIQUIDS'),
    alert: waterDays.value < 7
  },
  {
    icon: Apple,
    name: 'Mat',
    selfSufficient: `${foodDays.value} dager`,
    expires: getEarliestExpiry('FOOD'),
    alert: foodDays.value < 7
  },
  {
    icon: Pill,
    name: 'Medisiner',
    selfSufficient: 'N/A',
    expires: getEarliestExpiry('FIRST_AID'),
    alert: false
  },
  {
    icon: Hammer,
    name: 'Redskap',
    selfSufficient: 'N/A',
    expires: getEarliestExpiry('TOOL'),
    alert: false
  },
  {
    icon: Package,
    name: 'Diverse',
    selfSufficient: 'N/A',
    expires: getEarliestExpiry('OTHER'),
    alert: false
  }
])

// Fetch data on component mount
onMounted(async () => {
  if (householdStore.hasHousehold && householdStore.currentHousehold) {
    // Set the current household ID in the storage store
    storageStore.setCurrentHouseholdId(householdStore.currentHousehold.id)
    // Fetch all items
    await storageStore.fetchItems()
  } else {
    // Check if the user has a household if not set
    const hasHousehold = await householdStore.checkCurrentHousehold()
    if (hasHousehold && householdStore.currentHousehold) {
      storageStore.setCurrentHouseholdId(householdStore.currentHousehold.id)
      await storageStore.fetchItems()
    }
  }
})
</script>

<template>
  <div class="w-full max-w-3xl mx-auto p-4 md:p-6 text-center">
    <h1 class="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Mitt lagerinnhold</h1>

    <div class="flex items-center justify-center mb-6 md:mb-8 gap-2">
      <Hourglass class="h-4 w-4 md:h-5 md:w-5" />
      <p class="text-base md:text-lg font-medium">Beredskap varer i: {{ remainingDays }} dager</p>
    </div>

    <!-- Overall progress bar -->
    <div class="mb-8 md:mb-12">
      <Progress :value="overallProgress" class="h-3 md:h-4 mb-1" />
      <span class="text-xs md:text-sm font-medium">{{ overallProgress }}% av anbefalt (7 dager)</span>
    </div>

    <!-- Storage content section -->
    <div class="border rounded-lg p-4 md:p-6 mb-6">
      <h2 class="text-lg md:text-xl font-semibold mb-6 md:mb-8 border-b pb-2">Lager innhold</h2>

      <!-- Table headers - hidden on mobile, visible on larger screens -->
      <div class="hidden md:grid md:grid-cols-3 gap-4 mb-4 font-medium">
        <div>Ressurs</div>
        <div>Selvforsynt i:</div>
        <div>Utløper om:</div>
      </div>

      <!-- Table rows with responsive design -->
      <div v-for="(item, index) in storageItems" :key="index"
           class="flex flex-col md:grid md:grid-cols-3 gap-2 md:gap-4 py-3 md:py-4 border-t">
        <!-- Resource name and icon - always visible -->
        <div class="flex items-center gap-2 font-medium">
          <component :is="item.icon" class="h-5 w-5 md:h-6 md:w-6" />
          <span>{{ item.name }}</span>
        </div>

        <!-- Self-sufficient period with responsive labels -->
        <div class="flex items-center justify-between md:justify-start">
          <span class="md:hidden font-medium">Selvforsynt i:</span>
          <div class="flex items-center">
            <span>{{ item.selfSufficient }}</span>
            <span v-if="item.alert" class="text-red-500 ml-2">•</span>
          </div>
        </div>

        <!-- Expiration with responsive labels -->
        <div class="flex justify-between md:justify-start">
          <span class="md:hidden font-medium">Utløper om:</span>
          <span>{{ item.expires }}</span>
        </div>
      </div>

      <div class="mt-6 md:mt-8 flex justify-center md:justify-end">
        <RouterLink to="/storage-detail">
          <Button variant="secondary" class="w-full md:w-auto px-4">
            Se detaljert lagerinnhold
          </Button>
        </RouterLink>
      </div>
    </div>

    <!-- Additional section with preparedness advice -->
    <div class="border rounded-lg p-4 md:p-6">
      <h2 class="text-lg md:text-xl font-semibold mb-4 border-b pb-2">Beredskapsråd</h2>
      <p class="text-sm md:text-base text-left">
        DSB anbefaler at alle husstander bør være selvforsynte i minst 7 dager.
        Basert på ditt lager, har du beredskap for <strong>{{ remainingDays }} dager</strong>.
        <span v-if="remainingDays < 7" class="text-red-500">
          Du bør vurdere å fylle på ditt lager av {{ foodDays.value <= waterDays.value ? 'mat' : 'vann' }}.
        </span>
      </p>
    </div>
  </div>
</template>