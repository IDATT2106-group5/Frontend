<script setup>
import { computed, onMounted, ref } from 'vue'
import { Apple, Droplet, Hammer, Hourglass, Package, Pill } from 'lucide-vue-next'
import { RouterLink, useRouter } from 'vue-router'
import { useStorageStore } from '@/stores/StorageStore'
import { useHouseholdStore } from '@/stores/HouseholdStore'

/**
 * Storage Dashboard Component
 *
 * This component displays the household's emergency preparedness status,
 * showing available resources, self-sufficiency days, and expiration dates.
 */

// Access stores
const storageStore = useStorageStore()
const householdStore = useHouseholdStore()
const router = useRouter()

// State to track loading state
const isLoading = ref(true)
const hasValidHousehold = ref(false)

/**
 * Constants for daily needs per person according to emergency preparedness standards
 */
const DAILY_CALORIES_NEEDED = 2000 // calories per day per person
const DAILY_WATER_NEEDED = 3 // liters per day per person

/**
 * Computed values based on household size
 */
const householdSize = computed(() => householdStore.totalMemberCount || 1)

/**
 * Calculate calories for a food item
 *
 * @param {Object} item - Food item object from storage
 * @returns {number} - Calculated calories for the item
 */
function getCaloriesForFood(item) {
  if (!item || !item.item || item.item.itemType !== 'FOOD') {
    return 0
  }
  const calories = item.item.caloricAmount || 0
  const amount = item.amount || 0
  return (calories * amount) / 100
}

/**
 * Calculate total calories from all food items
 */
const totalCalories = computed(() => {
  if (!storageStore.items || storageStore.items.length === 0) return 0

  return storageStore.items.reduce((sum, item) => {
    if (item.item && item.item.itemType === 'FOOD') {
      const itemCalories = getCaloriesForFood(item)
      return sum + itemCalories
    }
    return sum
  }, 0)
})

/**
 * Calculate total water from all liquid items
 */
const totalWater = computed(() => {
  if (!storageStore.items || storageStore.items.length === 0) return 0

  return storageStore.items.reduce((sum, item) => {
    if (item.item && item.item.itemType === 'LIQUIDS') {
      const amount = item.amount || 0
      return sum + amount
    }
    return sum
  }, 0)
})

/**
 * Calculate how many days food supplies will last
 */
const foodDays = computed(() => {
  if (!totalCalories.value || !householdSize.value) return 0
  return Math.floor(totalCalories.value / (DAILY_CALORIES_NEEDED * householdSize.value))
})

/**
 * Calculate how many days water supplies will last
 */
const waterDays = computed(() => {
  if (!totalWater.value || !householdSize.value) return 0
  return Math.floor(totalWater.value / (DAILY_WATER_NEEDED * householdSize.value))
})

/**
 * Determine minimum days the household can sustain (the limiting factor)
 */
const remainingDays = computed(() => Math.min(foodDays.value, waterDays.value))

/**
 * Calculate overall preparedness progress (100% = 7 days of supplies)
 */
const overallProgress = computed(() => {
  const progress = (remainingDays.value / 7) * 100
  return Math.min(Math.round(progress), 100) // Cap at 100%
})

/**
 * Determine progress color based on preparedness level
 */
const progressColor = computed(() => {
  if (overallProgress.value >= 100) return 'bg-green-500'
  if (overallProgress.value >= 70) return 'bg-yellow-500'
  return 'bg-primary' // Default color
})

/**
 * Find the earliest expiry date for items of a specific type
 *
 * @param {string} itemType - Type of item to check for expiration
 * @returns {{text: string, isExpired: boolean}} - Formatted days until expiry or N/A
 */
function getEarliestExpiry(itemType) {
  const items = storageStore.getItemsByType(itemType);
  if (!items || items.length === 0) return { text: 'N/A', isExpired: false };

  const now = new Date();
  let daysUntilExpiry = Infinity;
  let isExpired = false;

  items.forEach(item => {
    const expiryDateStr = item.expiryDate || item.expiration ||
      (item.item && item.item.expiryDate) || null;

    if (!expiryDateStr || expiryDateStr === 'N/A') return;

    let expiryDate;

    if (typeof expiryDateStr === 'string' && expiryDateStr.includes('.')) {
      const [day, month, year] = expiryDateStr.split('.').map(Number);
      if (day && month && year) {
        expiryDate = new Date(year, month - 1, day);
      }
    }

    if (!expiryDate || isNaN(expiryDate.getTime())) {
      expiryDate = new Date(expiryDateStr);
    }

    if (isNaN(expiryDate.getTime())) return;

    const daysDiff = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      if (!isExpired || daysDiff > daysUntilExpiry) {
        daysUntilExpiry = daysDiff;
        isExpired = true;
      }
    }
    else if (!isExpired && daysDiff < daysUntilExpiry) {
      daysUntilExpiry = daysDiff;
    }
  });

  if (daysUntilExpiry !== Infinity) {
    return isExpired
      ? { text: 'Gått ut på dato', isExpired: true }
      : { text: `${daysUntilExpiry} dager`, isExpired: false };
  }

  return { text: 'N/A', isExpired: false };
}

/**
 * Storage items with computed values for display
 */
const storageItems = computed(() => [
  {
    icon: Droplet,
    name: 'Væske',
    selfSufficient: `${waterDays.value} dager`,
    expires: getEarliestExpiry('LIQUIDS'),
    alert: waterDays.value < 7,
  },
  {
    icon: Apple,
    name: 'Mat',
    selfSufficient: `${foodDays.value} dager`,
    expires: getEarliestExpiry('FOOD'),
    alert: foodDays.value < 7,
  },
  {
    icon: Pill,
    name: 'Medisiner',
    selfSufficient: 'N/A',
    expires: getEarliestExpiry('FIRST_AID'),
    alert: false,
  },
  {
    icon: Hammer,
    name: 'Redskap',
    selfSufficient: 'N/A',
    expires: getEarliestExpiry('TOOL'),
    alert: false,
  },
  {
    icon: Package,
    name: 'Diverse',
    selfSufficient: 'N/A',
    expires: getEarliestExpiry('OTHER'),
    alert: false,
  },
])

/**
 * Initialize component and fetch data
 */
onMounted(async () => {
  isLoading.value = true

  try {
    if (!householdStore.hasHousehold) {
      const hasHousehold = await householdStore.checkCurrentHousehold()

      if (!hasHousehold) {
        await router.replace('/household')
        return
      }
    }

    if (householdStore.currentHousehold && householdStore.currentHousehold.id) {
      hasValidHousehold.value = true
      storageStore.setCurrentHouseholdId(householdStore.currentHousehold.id)
      await storageStore.fetchItems()
    } else {
      console.error('Household flag is true but no valid household data found')
      await router.replace('/')
    }
  } catch (error) {
    console.error('Error initializing storage dashboard:', error)
    // Handle error case, redirect if no household is found
    await router.replace('/household')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div
    v-if="isLoading"
    class="w-full max-w-3xl mx-auto p-4 md:p-6 flex justify-center items-center min-h-[50vh]"
  >
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p class="text-lg">Laster inn...</p>
    </div>
  </div>

  <div v-if="!isLoading && hasValidHousehold" class="w-full max-w-3xl mx-auto p-4 md:p-6">
    <h1 class="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-center">Mitt lagerinnhold</h1>

    <div class="flex items-center justify-center mb-6 md:mb-8 gap-2">
      <Hourglass class="h-4 w-4 md:h-5 md:w-5" />
      <p class="text-base md:text-lg font-medium">Beredskap varer i: {{ remainingDays }} dager</p>
    </div>

    <div class="mb-8 md:mb-12">
      <div class="w-full bg-gray-200 rounded-full h-3 md:h-4 mb-1">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="progressColor"
          :style="`width: ${overallProgress}%`"
        ></div>
      </div>
      <span class="text-xs md:text-sm font-medium"
        >{{ overallProgress }}% av anbefalt (7 dager)</span
      >
    </div>

    <div class="border rounded-lg p-4 md:p-6 mb-6">
      <h2 class="text-lg md:text-xl font-semibold mb-6 md:mb-8 border-b pb-2 text-left">
        Lager innhold
      </h2>

      <div class="hidden md:grid md:grid-cols-3 gap-4 mb-4 font-medium">
        <div class="text-left">Ressurs</div>
        <div class="text-left">Selvforsynt i:</div>
        <div class="text-left">Utløper om:</div>
      </div>

      <div
        v-for="(item, index) in storageItems"
        :key="index"
        class="flex flex-col md:grid md:grid-cols-3 gap-2 md:gap-4 py-3 md:py-4 border-t"
      >
        <div class="flex items-center gap-2 font-medium text-left">
          <component :is="item.icon" class="h-5 w-5 md:h-6 md:w-6" />
          <span>{{ item.name }}</span>
        </div>

        <div class="flex items-center justify-between md:justify-start">
          <span class="md:hidden font-medium">Selvforsynt i:</span>
          <div class="flex items-center">
            <span>{{ item.selfSufficient }}</span>
            <span v-if="item.alert" class="text-red-500 ml-2">•</span>
          </div>
        </div>

        <div class="flex justify-between md:justify-start">
          <span class="md:hidden font-medium">Utløper om:</span>
          <span :class="{ 'text-red-500': item.expires.isExpired }">{{ item.expires.text }}</span>
        </div>
      </div>

      <div class="mt-6 md:mt-8 flex justify-center md:justify-end">
        <RouterLink to="/storage-detail">
          <div
            class="flex items-center gap-2 text-white bg-[#2c3e50] border border-white rounded-sm py-2 px-6 hover:bg-slate-700 transition-colors"
          >
            <span class="font-medium">Se detaljert lagerinnhold</span>
          </div>
        </RouterLink>
      </div>
    </div>

    <div class="border rounded-lg p-4 md:p-6">
      <h2 class="text-lg md:text-xl font-semibold mb-4 border-b pb-2 text-left">Beredskapsråd</h2>
      <p class="text-sm md:text-base text-left">
        DSB anbefaler at alle husstander bør være selvforsynte i minst 7 dager. Basert på ditt
        lager, har du beredskap for <strong>{{ remainingDays }} dager</strong>.
        <span v-if="remainingDays < 7" class="text-red-500">
          Du bør vurdere å fylle på ditt lager av
          {{ foodDays.value <= waterDays.value ? 'mat' : 'vann' }}.
        </span>
      </p>
    </div>
  </div>
</template>