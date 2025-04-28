<script>
// Mock data for the Storage application with multiple of the same item type
const mockItems = [
  // Væske (Liquid) items
  {
    name: "Vann (Imsdal)",
    expiryDate: "2026-05-10",
    quantity: 10,
    duration: "20 dager",
    category: "Væske",
    unit: "liter"
  },
  {
    name: "Vann (Olden)",
    expiryDate: "2026-03-15",
    quantity: 5,
    duration: "10 dager",
    category: "Væske",
    unit: "liter"
  },
  {
    name: "Vann (Imsdal)",
    expiryDate: "2026-05-10",
    quantity: 8,
    duration: "16 dager",
    category: "Væske",
    unit: "liter"
  },
  {
    name: "Juice (Eple)",
    expiryDate: "2025-07-22",
    quantity: 3,
    duration: "6 dager",
    category: "Væske",
    unit: "liter"
  },
  {
    name: "Juice (Appelsin)",
    expiryDate: "2025-07-22",
    quantity: 5,
    duration: "8 dager",
    category: "Væske",
    unit: "liter"
  },
  {
    name: "Melk",
    expiryDate: "2025-05-12",
    quantity: 4,
    duration: "7 dager",
    category: "Væske",
    unit: "liter"
  },

  // Mat (Food) items
  {
    name: "Hermetikk (Bønner)",
    expiryDate: "2027-03-15",
    quantity: 12,
    duration: "1 måned",
    category: "Mat",
    unit: "bokser"
  },
  {
    name: "Hermetikk (Mais)",
    expiryDate: "2027-03-15",
    quantity: 8,
    duration: "1 måned",
    category: "Mat",
    unit: "bokser"
  },
  {
    name: "Hermetikk (Bønner)",
    expiryDate: "2027-06-20",
    quantity: 4,
    duration: "2 uker",
    category: "Mat",
    unit: "bokser"
  },
  {
    name: "Tørrmat (Pasta)",
    expiryDate: "2026-11-30",
    quantity: 10,
    duration: "25 dager",
    category: "Mat",
    unit: "poser"
  },
  {
    name: "Tørrmat (Ris)",
    expiryDate: "2026-11-30",
    quantity: 8,
    duration: "20 dager",
    category: "Mat",
    unit: "poser"
  },
  {
    name: "Frysetørret mat",
    expiryDate: "2028-01-20",
    quantity: 30,
    duration: "6 måneder",
    category: "Mat",
    unit: "pakker"
  },

  // Medisiner (Medicine) items
  {
    name: "Smertestillende (Paracet)",
    expiryDate: "2026-08-15",
    quantity: 20,
    duration: "1 måned",
    category: "Medisiner",
    unit: "tabletter"
  },
  {
    name: "Smertestillende (Ibuprofen)",
    expiryDate: "2026-08-15",
    quantity: 20,
    duration: "1 måned",
    category: "Medisiner",
    unit: "tabletter"
  },
  {
    name: "Smertestillende (Paracet)",
    expiryDate: "2026-12-01",
    quantity: 30,
    duration: "1.5 måneder",
    category: "Medisiner",
    unit: "tabletter"
  },
  {
    name: "Antibiotika",
    expiryDate: "2025-12-01",
    quantity: 12,
    duration: "14 dager",
    category: "Medisiner",
    unit: "pakker"
  },
  {
    name: "Førstehjelpsutstyr",
    expiryDate: "2027-06-30",
    quantity: 2,
    duration: "1 år",
    category: "Medisiner",
    unit: "sett"
  },

  // Diverse (Miscellaneous) items
  {
    name: "Batterier (AA)",
    expiryDate: "2028-04-25",
    quantity: 24,
    duration: "8 måneder",
    category: "Diverse",
    unit: "stk"
  },
  {
    name: "Batterier (AAA)",
    expiryDate: "2028-04-25",
    quantity: 12,
    duration: "4 måneder",
    category: "Diverse",
    unit: "stk"
  },
  {
    name: "Stearinlys",
    expiryDate: "N/A",
    quantity: 50,
    duration: "6 måneder",
    category: "Diverse",
    unit: "stk"
  },
  {
    name: "Tepper",
    expiryDate: "N/A",
    quantity: 6,
    duration: "Ubegrenset",
    category: "Diverse",
    unit: "stk"
  }
];

// Function to group items by category
function groupItemsByCategory(items) {
  return items.reduce((groups, item) => {
    const { category } = item;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {
    Væske: [],
    Mat: [],
    Medisiner: [],
    Diverse: []
  });
}

const groupedMockItems = groupItemsByCategory(mockItems);

export { mockItems, groupedMockItems };
</script>
