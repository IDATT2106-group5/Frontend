<template>
  <div>
    <table v-if="items && items.length > 0" class="table-auto w-full border-collapse border border-gray-300">
      <thead class="bg-gray-100 border-b border-gray-300">
      <tr>
        <th class="p-2 text-left">Date</th>
        <th class="p-2 text-left">Quantity</th>
        <th class="p-2 text-left">Duration</th>
      </tr>
      </thead>
      <tbody>
      <tr
        v-for="(item, index) in items"
        :key="index"
        class="hover:bg-gray-50 border-b border-gray-300"
      >
        <td class="p-2">{{ item.date }}</td>
        <td class="p-2">{{ item.quantity }}</td>
        <td class="p-2">{{ item.duration }}</td>
      </tr>
      </tbody>
    </table>

    <!-- Fallback message if no items are provided -->
    <p v-else class="text-gray-500 italic">No items to display.</p>
  </div>
</template>

<script>
export default {
  name: "ItemList",
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped>
/* Optional styles for better table aesthetics */
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  text-align: left;
  border: 1px solid #ddd;
}

th {
  background-color: #f9f9f9;
  font-weight: bold;
}
</style>
