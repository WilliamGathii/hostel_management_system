const roomModel = require('../../src/models/room.model');

describe('room model transactions and conflicts', () => {
  test('rolls back the complete operation when a batch fails', async () => {
    const client = {
      query: jest.fn().mockResolvedValue({}),
      release: jest.fn(),
    };
    const database = {
      connect: jest.fn().mockResolvedValue(client),
    };

    await expect(
      roomModel.withTransaction(async () => {
        throw new Error('batch failed');
      }, database)
    ).rejects.toThrow('batch failed');

    expect(client.query.mock.calls.map(([sql]) => sql)).toEqual([
      'BEGIN',
      'ROLLBACK',
    ]);
    expect(client.release).toHaveBeenCalled();
  });

  test('checks both full codes and structured room identity', async () => {
    const database = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    };

    await roomModel.findRoomConflicts(
      'type-a',
      9,
      [
        { roomCode: 'A901', roomNumber: 1 },
        { roomCode: 'A902', roomNumber: 2 },
      ],
      database
    );

    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining('room_type_id = $2'),
      [['A901', 'A902'], 'type-a', 9, [1, 2]]
    );
  });
});
