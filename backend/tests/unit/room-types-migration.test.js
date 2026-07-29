const {
  DEFAULT_ROOM_TYPES,
} = require('../../../database/migrations/1785150000006_add-room-types-and-structured-rooms.cjs');

describe('approved room type defaults', () => {
  test('stores the approved codes, rates, and capacities', () => {
    expect(DEFAULT_ROOM_TYPES).toEqual([
      expect.objectContaining({
        code: 'A',
        name: 'Twin Room',
        monthlyRate: 10000,
        defaultCapacity: 2,
      }),
      expect.objectContaining({
        code: 'B',
        name: 'Studio',
        monthlyRate: 14000,
        defaultCapacity: 1,
      }),
      expect.objectContaining({
        code: 'C',
        name: 'Superior Studio',
        monthlyRate: 16500,
        defaultCapacity: 1,
      }),
      expect.objectContaining({
        code: 'D',
        name: 'One Bedroom',
        monthlyRate: 20000,
        defaultCapacity: 1,
      }),
      expect.objectContaining({
        code: 'E',
        name: 'Two Bedroom',
        monthlyRate: 30000,
        defaultCapacity: 2,
      }),
    ]);
  });

  test('only A and E have a capacity of two', () => {
    const capacityTwoCodes = DEFAULT_ROOM_TYPES.filter(
      (roomType) => roomType.defaultCapacity === 2
    ).map((roomType) => roomType.code);
    const capacityOneCodes = DEFAULT_ROOM_TYPES.filter(
      (roomType) => roomType.defaultCapacity === 1
    ).map((roomType) => roomType.code);

    expect(capacityTwoCodes).toEqual(['A', 'E']);
    expect(capacityOneCodes).toEqual(['B', 'C', 'D']);
  });
});
