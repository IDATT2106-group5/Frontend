import { setActivePinia, createPinia } from 'pinia';
import { useStorageStore } from '@/stores/StorageStore';
import StorageService from '@/service/storageService';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/service/storageService', () => {
  return {
    default: {
      getStorageItemsByHousehold: vi.fn(),
      getExpiringItems: vi.fn(),
      addItemToStorage: vi.fn(),
      updateStorageItem: vi.fn(),
      removeItemFromStorage: vi.fn(),
    }
  };
});

describe('Storage Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initial state is correct', () => {
    const store = useStorageStore();
    expect(store.items).toEqual([]);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBe(null);
    expect(store.isEmpty).toBe(true);
    expect(store.groupedItems).toBeDefined();
  });

  it('sets household ID correctly', () => {
    const store = useStorageStore();
    store.setCurrentHouseholdId('abc123');
    expect(store.currentHouseholdId).toBe('abc123');
  });

  it('fetchItems sets items correctly', async () => {
    const mockData = [
      {
        id: '1',
        item: {
          name: 'Water',
          itemType: 'LIQUIDS',
          caloricAmount: 0
        },
        expiration: '2024-06-01',
        amount: 2,
        unit: 'L'
      }
    ];

    StorageService.getStorageItemsByHousehold.mockResolvedValue(mockData);

    const store = useStorageStore();
    store.setCurrentHouseholdId('abc123');
    await store.fetchItems();

    expect(store.items.length).toBe(1);
    expect(store.items[0].id).toBe('1');
    expect(store.isLoading).toBe(false);
    expect(store.error).toBe(null);
  });

  it('fetchItems handles error', async () => {
    StorageService.getStorageItemsByHousehold.mockRejectedValue(new Error('Failed'));

    const store = useStorageStore();
    store.setCurrentHouseholdId('abc123');
    await store.fetchItems();

    expect(store.items).toEqual([]);
    expect(store.error).toBe('Failed');
    expect(store.isLoading).toBe(false);
  });

  it('fetchItems returns empty if household ID is not set', async () => {
    const store = useStorageStore();
    const result = await store.fetchItems();
    expect(result).toEqual([]);
    expect(store.items).toEqual([]);
  });

  it('getItemsByType filters by type', () => {
    const store = useStorageStore();
    store.items = [
      { id: '1', item: { itemType: 'FOOD' } },
      { id: '2', item: { itemType: 'LIQUIDS' } }
    ];

    const result = store.getItemsByType('FOOD');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('1');
  });

  it('fetchItemsByType returns filtered items', () => {
    const store = useStorageStore();
    store.items = [
      { id: '1', item: { itemType: 'FOOD' } },
      { id: '2', item: { itemType: 'LIQUIDS' } }
    ];

    const result = store.fetchItemsByType('LIQUIDS');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('groupedItems groups correctly by itemType', () => {
    const store = useStorageStore();
    store.items = [
      { id: '1', item: { name: 'Milk', itemType: 'LIQUIDS', caloricAmount: 100 }, expiration: '2025-06-01', amount: 1, unit: 'L' },
      { id: '2', item: { name: 'Bread', itemType: 'FOOD', caloricAmount: 250 }, expiration: '2025-06-02', amount: 2, unit: 'pcs' }
    ];

    const grouped = store.groupedItems;
    expect(grouped['Væske']).toHaveLength(1);
    expect(grouped['Mat']).toHaveLength(1);
  });

  it('addItem calls StorageService and refreshes items', async () => {
    const store = useStorageStore();
    store.setCurrentHouseholdId('abc123');

    StorageService.addItemToStorage.mockResolvedValue({ success: true });
    StorageService.getStorageItemsByHousehold.mockResolvedValue([]);

    const result = await store.addItem('item1', { quantity: 5 });

    expect(StorageService.addItemToStorage).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('updateItem updates correctly with ISO date', async () => {
    const store = useStorageStore();
    store.items = [{
      id: '1',
      item: { name: 'Water', expiration: '2025-01-01', caloricAmount: 0 },
      unit: 'L',
      amount: 2
    }];

    StorageService.updateStorageItem.mockResolvedValue({ success: true });
    StorageService.getStorageItemsByHousehold.mockResolvedValue(store.items);

    const response = await store.updateItem('1', {
      quantity: 5,
      expiryDate: '2025-01-01T00:00:00'
    });

    expect(StorageService.updateStorageItem).toHaveBeenCalledWith('1', {
      unit: 'L',
      amount: 5,
      expirationDate: '2025-01-01T00:00:00'
    });
    expect(response.success).toBe(true);
  });

  it('updateItem handles item object as ID input', async () => {
    const store = useStorageStore();
    const itemObj = { id: '1' };

    store.items = [{
      id: '1',
      item: { name: 'Oil', expiration: '2025-01-01' },
      unit: 'L',
      amount: 2
    }];

    StorageService.updateStorageItem.mockResolvedValue({ success: true });
    StorageService.getStorageItemsByHousehold.mockResolvedValue(store.items);

    const result = await store.updateItem(itemObj, {
      quantity: 4,
      expiryDate: '01.01.2025'
    });

    expect(StorageService.updateStorageItem).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('deleteItem removes item and calls StorageService', async () => {
    const store = useStorageStore();
    store.items = [
      { id: '1', item: { itemType: 'FOOD' } },
      { id: '2', item: { itemType: 'FOOD' } }
    ];

    StorageService.removeItemFromStorage.mockResolvedValue({ success: true });

    const result = await store.deleteItem('1');
    expect(result.success).toBe(true);
    expect(store.items.length).toBe(1);
    expect(store.items[0].id).toBe('2');
  });

  it('fetchExpiringItems calls StorageService', async () => {
    const store = useStorageStore();
    store.setCurrentHouseholdId('abc123');

    const mockExpiring = [{ id: '1' }];
    StorageService.getExpiringItems.mockResolvedValue(mockExpiring);

    const result = await store.fetchExpiringItems('2025-01-01');
    expect(result).toEqual(mockExpiring);
    expect(StorageService.getExpiringItems).toHaveBeenCalled();
  });

  it('isEmpty updates reactively', () => {
    const store = useStorageStore();
    expect(store.isEmpty).toBe(true);
    store.items = [{ id: '1', item: { itemType: 'FOOD' } }];
    expect(store.isEmpty).toBe(false);
  });
  it('formatDate handles null and "N/A" gracefully', () => {
    const store = useStorageStore();
    // indirectly triggers formatDate
    store.items = [{ id: '1', item: { name: 'Test', itemType: 'FOOD', caloricAmount: 0 }, expiration: null, amount: 1, unit: 'pcs' }];
    expect(store.groupedItems['Mat'][0].expiryDate).toBe('N/A');
  });
  
  it('fetchItems maps itemId if id is missing', async () => {
    const store = useStorageStore();
    store.setCurrentHouseholdId('test');
    const mockData = [{ itemId: 'x1', item: { name: 'Test', itemType: 'FOOD' }, expiration: '2024-06-01', amount: 1, unit: 'kg' }];
    StorageService.getStorageItemsByHousehold.mockResolvedValue(mockData);
    await store.fetchItems();
    expect(store.items[0].id).toBe('x1');
  });
  
  it('fetchItems handles item with no id or itemId', async () => {
    const store = useStorageStore();
    store.setCurrentHouseholdId('test');
    const mockData = [{ item: { name: 'Test', itemType: 'FOOD' }, expiration: '2024-06-01', amount: 1, unit: 'kg' }];
    StorageService.getStorageItemsByHousehold.mockResolvedValue(mockData);
    await store.fetchItems();
    expect(store.items[0].id).toBe(undefined); // should log warning
  });
  
  it('groupedItems puts unknown type in Diverse', () => {
    const store = useStorageStore();
    store.items = [{ id: '1', item: { name: 'X', itemType: 'UNKNOWN', caloricAmount: 0 }, expiration: '2025-01-01', amount: 1, unit: 'x' }];
    expect(store.groupedItems['Diverse']).toHaveLength(1);
  });
  
  it('getItemsByType returns all if type is not provided', () => {
    const store = useStorageStore();
    store.items = [{ id: '1', item: { itemType: 'FOOD' } }];
    const all = store.getItemsByType(null);
    expect(all).toHaveLength(1);
  });
});
