
// types/ItemType.js

// This enum matches your backend ItemType values
export const ItemType = {
  LIQUIDS: 'LIQUIDS',
  FOOD: 'FOOD',
  MEDICINE: 'MEDICINE',
  OTHER: 'OTHER'
};

// Map to display names in Norwegian
export const ItemTypeDisplayName = {
  [ItemType.LIQUIDS]: 'Væske',
  [ItemType.FOOD]: 'Mat',
  [ItemType.MEDICINE]: 'Medisiner',
  [ItemType.OTHER]: 'Diverse'
};
