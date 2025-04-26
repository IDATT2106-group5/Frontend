<template>
  <div class="p-4 bg-white rounded">
    <div v-if="groupedSubItems && Object.keys(groupedSubItems).length > 0">
      <div v-for="(group, groupName) in groupedSubItems" :key="groupName" class="mb-4">
        <!-- Sub-accordion header -->
        <div
          @click="toggleSubAccordion(groupName)"
          class="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 border-b border-gray-200"
        >
          <div class="flex-1 font-medium">{{ groupName }}</div>
          <div class="flex-1">{{ getEarliestExpiryDate(group) }}</div>
          <div class="flex-1">{{ getTotalQuantity(group) }} {{ group[0].unit }}</div>
          <div class="flex-1">{{ calculateDuration(getTotalQuantity(group), group[0]) }}</div>
          <div class="w-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              :class="['h-5 w-5 transform transition-transform', openSubItems.includes(groupName) ? 'rotate-180' : '']"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>

        <!-- Sub-accordion content -->
        <div v-if="openSubItems.includes(groupName)" class="pl-4 mt-1 border-l-2 border-gray-200">
          <table class="table-auto w-full">
            <tbody>
            <tr v-for="(subGroup, expiryDate) in groupItemsByExpiryDate(group)" :key="expiryDate"
                class="hover:bg-gray-50">
              <td class="p-2 w-1/4">{{ subGroup[0].name }}</td>
              <td class="p-2 w-1/4">{{ expiryDate }}</td>
              <td class="p-2 w-1/4">{{ getSubGroupTotalQuantity(subGroup) }} {{ subGroup[0].unit }}</td>
              <td class="p-2 w-1/4">{{ calculateDuration(getSubGroupTotalQuantity(subGroup), subGroup[0]) }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Fallback message if no items are provided -->
    <p v-else class="text-gray-500 italic text-center mt-4">
      No items to display.
    </p>
  </div>
</template>

<script>
export default {
  name: "NestedItemList",
  props: {
    items: {
      type: Array,
      required: true,
    }
  },
  data() {
    return {
      openSubItems: [],
    };
  },
  computed: {
    groupedSubItems() {
      // Group items by name (e.g., group all "Water" items together)
      const grouped = {};
      this.items.forEach(item => {
        const baseName = this.getBaseName(item.name);
        if (!grouped[baseName]) {
          grouped[baseName] = [];
        }
        grouped[baseName].push(item);
      });
      return grouped;
    }
  },
  methods: {
    getBaseName(fullName) {
      // Extract the base name (e.g., "Water" from "Water (Brand A)")
      // You can customize this logic based on your naming pattern
      const match = fullName.match(/^([^(]+)/);
      return match ? match[1].trim() : fullName;
    },
    toggleSubAccordion(groupName) {
      if (this.openSubItems.includes(groupName)) {
        this.openSubItems = this.openSubItems.filter(item => item !== groupName);
      } else {
        this.openSubItems.push(groupName);
      }
    },
    getEarliestExpiryDate(group) {
      // Find the earliest expiry date in a group
      return group
        .map(item => item.expiryDate)
        .sort((a, b) => new Date(a) - new Date(b))[0];
    },
    getTotalQuantity(group) {
      // Sum up the quantities in a group
      return group.reduce((sum, item) => sum + parseFloat(item.quantity), 0);
    },
    getSubGroupTotalQuantity(subGroup) {
      // Sum up quantities for items with the same expiry date
      return subGroup.reduce((sum, item) => sum + parseFloat(item.quantity), 0);
    },
    groupItemsByExpiryDate(items) {
      // Group items by expiry date
      const grouped = {};
      items.forEach(item => {
        if (!grouped[item.expiryDate]) {
          grouped[item.expiryDate] = [];
        }
        grouped[item.expiryDate].push(item);
      });
      return grouped;
    },
    calculateDuration(quantity, item) {
      // Return the duration value from the item or calculate it if needed
      // You may need to adjust this based on how your duration is calculated
      return item.duration || `${Math.ceil(quantity / 3)} dager`;
    }
  }
};
</script>
