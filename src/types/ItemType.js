
// types/ItemType.js

// This enum matches your backend ItemType values
export const ItemType = {
  LIQUIDS: 'LIQUIDS',
  FOOD: 'FOOD',
  FIRST_AID: 'FIRST_AID',
  TOOL: 'TOOL',
  OTHER: 'OTHER'
};

// Map to display names in Norwegian
export const ItemTypeDisplayName = {
  [ItemType.LIQUIDS]: 'Væske',
  [ItemType.FOOD]: 'Mat',
  [ItemType.FIRST_AID]: 'Medisiner',
  [ItemType.TOOL]: 'Redskap',
  [ItemType.OTHER]: 'Diverse'
};
