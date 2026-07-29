const {
  generateRoomCode,
  generateRoomCodes,
} = require('../../../shared/room-code.js');

describe('room code utility', () => {
  test.each([
    ['A', 9, 6, 'A906'],
    ['A', 10, 6, 'A1006'],
    ['B', 12, 11, 'B1211'],
  ])('generates %s floor %s room %s as %s', (code, floor, room, expected) => {
    expect(generateRoomCode(code, floor, room)).toBe(expected);
  });

  test('allows numbering to restart for each room type', () => {
    expect(generateRoomCode('A', 9, 1)).toBe('A901');
    expect(generateRoomCode('B', 9, 1)).toBe('B901');
  });

  test.each([
    ['invalid floor', () => generateRoomCode('A', 0, 1)],
    ['invalid room number', () => generateRoomCode('A', 9, 100)],
    ['invalid quantity', () => generateRoomCodes('A', 9, 1, 0)],
    ['batch past room 99', () => generateRoomCodes('A', 9, 98, 3)],
  ])('rejects %s', (_label, operation) => {
    expect(operation).toThrow();
  });
});
