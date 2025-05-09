/**
 * @typedef {string} ItemType
 * @type {{LIQUIDS: string, FOOD: string, FIRST_AID: string, TOOL: string, OTHER: string}}
 */
export const ItemType = {
  LIQUIDS: 'LIQUIDS',
  FOOD: 'FOOD',
  FIRST_AID: 'FIRST_AID',
  TOOL: 'TOOL',
  OTHER: 'OTHER'
};

export const ItemTypeDisplayName = {
  [ItemType.LIQUIDS]: 'Væske',
  [ItemType.FOOD]: 'Mat',
  [ItemType.FIRST_AID]: 'Medisiner',
  [ItemType.TOOL]: 'Redskap',
  [ItemType.OTHER]: 'Diverse'
};
