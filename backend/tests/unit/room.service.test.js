jest.mock('../../src/models/room.model', () => ({
  createRoom: jest.fn(),
  createRooms: jest.fn(),
  deleteRoom: jest.fn(),
  findActiveAllocationByStudent: jest.fn(),
  findAllocationById: jest.fn(),
  findRoomConflicts: jest.fn(),
  findRoomUsage: jest.fn(),
  findStudentById: jest.fn(),
  insertAllocation: jest.fn(),
  listFloorSummaries: jest.fn(),
  lockRoomById: jest.fn(),
  withTransaction: jest.fn(),
}));
jest.mock('../../src/models/room-type.model', () => ({
  findRoomTypeById: jest.fn(),
}));
jest.mock('../../src/services/notification.service', () => ({
  createNotification: jest.fn(),
}));

const roomModel = require('../../src/models/room.model');
const roomTypeModel = require('../../src/models/room-type.model');
const notificationService = require('../../src/services/notification.service');
const roomService = require('../../src/services/room.service');

const database = { query: jest.fn() };
const admin = { id: 'admin-user', role: 'admin' };
const student = {
  id: 'student-profile',
  user_id: 'student-user',
  account_status: 'active',
};
const twinRoomType = {
  id: 'type-a',
  code: 'A',
  name: 'Twin Room',
  monthly_rate: '10000.00',
  default_capacity: 2,
  status: 'active',
};

describe('room service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    roomModel.withTransaction.mockImplementation((operation) =>
      operation(database)
    );
    roomTypeModel.findRoomTypeById.mockResolvedValue(twinRoomType);
    roomModel.findRoomConflicts.mockResolvedValue([]);
    roomModel.createRooms.mockResolvedValue([]);
  });

  test('generates a complete batch with inherited capacity', async () => {
    const result = await roomService.createRoomsBulk(admin, {
      room_type_id: twinRoomType.id,
      floor_number: 9,
      starting_room_number: 1,
      quantity: 6,
    });

    expect(result).toMatchObject({
      created_count: 6,
      first_room_code: 'A901',
      last_room_code: 'A906',
    });
    expect(roomModel.createRooms).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          room_code: 'A906',
          capacity: 2,
          floor_number: 9,
          room_number: 6,
        }),
      ]),
      database
    );
  });

  test('rejects duplicate codes before inserting the batch', async () => {
    roomModel.findRoomConflicts.mockResolvedValue(['A903']);

    await expect(
      roomService.createRoomsBulk(admin, {
        room_type_id: twinRoomType.id,
        floor_number: 9,
        starting_room_number: 1,
        quantity: 6,
      })
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(roomModel.createRooms).not.toHaveBeenCalled();
  });

  test('does not hide a failed batch insert', async () => {
    roomModel.createRooms.mockRejectedValue(new Error('insert failed'));

    await expect(
      roomService.createRoomsBulk(admin, {
        room_type_id: twinRoomType.id,
        floor_number: 9,
        starting_room_number: 1,
        quantity: 2,
      })
    ).rejects.toThrow('insert failed');
  });

  test('inactive room types cannot generate rooms', async () => {
    roomTypeModel.findRoomTypeById.mockResolvedValue({
      ...twinRoomType,
      status: 'inactive',
    });

    await expect(
      roomService.createRoomsBulk(admin, {
        room_type_id: twinRoomType.id,
        floor_number: 9,
        starting_room_number: 1,
        quantity: 2,
      })
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(roomModel.createRooms).not.toHaveBeenCalled();
  });

  test('lists floor summaries for Admin', async () => {
    const summaries = [
      {
        floor_number: 9,
        room_count: 6,
        total_capacity: 12,
        current_occupancy: 4,
      },
    ];
    roomModel.listFloorSummaries.mockResolvedValue(summaries);

    await expect(roomService.listFloors(admin)).resolves.toEqual(summaries);
    expect(roomModel.listFloorSummaries).toHaveBeenCalledTimes(1);
  });

  test('does not list floor summaries for a Student', async () => {
    await expect(
      roomService.listFloors({ id: 'student-user', role: 'student' })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('deletes a room with no allocation or maintenance history', async () => {
    const unusedRoom = { id: 'room-id', room_code: 'A901' };
    roomModel.lockRoomById.mockResolvedValue(unusedRoom);
    roomModel.findRoomUsage.mockResolvedValue({
      allocation_count: 0,
      maintenance_count: 0,
    });
    roomModel.deleteRoom.mockResolvedValue(unusedRoom);

    await expect(roomService.deleteRoom(admin, 'room-id')).resolves.toEqual(
      unusedRoom
    );
    expect(roomModel.deleteRoom).toHaveBeenCalledWith('room-id', database);
  });

  test.each([
    ['allocation', { allocation_count: 1, maintenance_count: 0 }],
    ['maintenance', { allocation_count: 0, maintenance_count: 1 }],
  ])('does not delete a room with %s history', async (_label, usage) => {
    roomModel.lockRoomById.mockResolvedValue({
      id: 'room-id',
      room_code: 'A901',
    });
    roomModel.findRoomUsage.mockResolvedValue(usage);

    await expect(
      roomService.deleteRoom(admin, 'room-id')
    ).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('Mark it inactive instead'),
    });
    expect(roomModel.deleteRoom).not.toHaveBeenCalled();
  });

  test.each([
    [
      'full',
      { current_occupancy: 2, capacity: 2, operational_status: 'active' },
    ],
    [
      'under maintenance',
      {
        current_occupancy: 0,
        capacity: 2,
        operational_status: 'under_maintenance',
      },
    ],
  ])('cannot allocate a %s room', async (_label, unavailableRoom) => {
    roomModel.findStudentById.mockResolvedValue(student);
    roomModel.findActiveAllocationByStudent.mockResolvedValue(null);
    roomModel.lockRoomById.mockResolvedValue(unavailableRoom);

    await expect(
      roomService.createAllocation(admin, {
        student_id: student.id,
        room_id: 'room-id',
        start_date: new Date('2026-07-29'),
      })
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(roomModel.insertAllocation).not.toHaveBeenCalled();
  });

  test('saves the current monthly rate on the allocation', async () => {
    roomModel.findStudentById.mockResolvedValue(student);
    roomModel.findActiveAllocationByStudent.mockResolvedValue(null);
    roomModel.lockRoomById.mockResolvedValue({
      id: 'room-id',
      room_code: 'A901',
      monthly_rate: '10000.00',
      current_occupancy: 1,
      capacity: 2,
      operational_status: 'active',
    });
    roomModel.insertAllocation.mockResolvedValue('allocation-id');
    roomModel.findAllocationById.mockResolvedValue({
      id: 'allocation-id',
      monthly_rate_at_allocation: '10000.00',
    });
    notificationService.createNotification.mockResolvedValue({});

    await roomService.createAllocation(admin, {
      student_id: student.id,
      room_id: 'room-id',
      start_date: new Date('2026-07-29'),
    });

    expect(roomModel.insertAllocation).toHaveBeenCalledWith(
      expect.objectContaining({
        monthly_rate_at_allocation: '10000.00',
      }),
      database
    );
  });
});
