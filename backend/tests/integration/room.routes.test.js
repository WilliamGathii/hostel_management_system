const request = require('supertest');

jest.mock('../../src/services/room.service', () => ({
  listRooms: jest.fn(),
  getRoom: jest.fn(),
  createRoom: jest.fn(),
  updateRoom: jest.fn(),
  updateRoomStatus: jest.fn(),
  getMyAllocation: jest.fn(),
  listAllocations: jest.fn(),
  createAllocation: jest.fn(),
  updateAllocation: jest.fn(),
  endAllocation: jest.fn(),
}));

jest.mock('../../src/models/user.model', () => ({
  findUserById: jest.fn(),
}));

const app = require('../../src/app');
const userModel = require('../../src/models/user.model');
const roomService = require('../../src/services/room.service');
const { signAuthToken } = require('../../src/utils/jwt');

const roomId = '11111111-1111-4111-8111-111111111111';
const studentId = '22222222-2222-4222-8222-222222222222';
const allocationId = '33333333-3333-4333-8333-333333333333';
const users = {
  admin: {
    id: 'admin-room-user',
    role: 'admin',
    account_status: 'active',
  },
  student: {
    id: 'student-room-user',
    role: 'student',
    account_status: 'active',
  },
  maintenance_staff: {
    id: 'maintenance-room-user',
    role: 'maintenance_staff',
    account_status: 'active',
  },
};
const room = {
  id: roomId,
  room_number: 'A101',
  room_type: 'Shared',
  capacity: 2,
  current_occupancy: 0,
  status: 'available',
};
const allocation = {
  id: allocationId,
  student_id: studentId,
  room_id: roomId,
  allocation_status: 'active',
  room_number: 'A101',
};
const authorization = (user) => `Bearer ${signAuthToken(user)}`;

describe('room and allocation routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userModel.findUserById.mockImplementation(async (userId) =>
      Object.values(users).find((user) => user.id === userId)
    );
    roomService.listRooms.mockResolvedValue({
      rooms: [room],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    roomService.getRoom.mockResolvedValue(room);
    roomService.createRoom.mockResolvedValue(room);
    roomService.updateRoom.mockResolvedValue(room);
    roomService.updateRoomStatus.mockResolvedValue({
      ...room,
      status: 'inactive',
    });
    roomService.getMyAllocation.mockResolvedValue(allocation);
    roomService.listAllocations.mockResolvedValue({
      allocations: [allocation],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    roomService.createAllocation.mockResolvedValue(allocation);
    roomService.updateAllocation.mockResolvedValue(allocation);
    roomService.endAllocation.mockResolvedValue({
      ...allocation,
      allocation_status: 'completed',
    });
  });

  test('Admin can list rooms', async () => {
    const response = await request(app)
      .get('/api/v1/rooms?status=available')
      .set('Authorization', authorization(users.admin));

    expect(response.status).toBe(200);
    expect(response.body.data.rooms).toHaveLength(1);
  });

  test.each(['student', 'maintenance_staff'])(
    '%s cannot manage rooms',
    async (role) => {
      const response = await request(app)
        .get('/api/v1/rooms')
        .set('Authorization', authorization(users[role]));

      expect(response.status).toBe(403);
    }
  );

  test('Admin can create a room', async () => {
    const response = await request(app)
      .post('/api/v1/rooms')
      .set('Authorization', authorization(users.admin))
      .send({
        room_number: 'A101',
        room_type: 'Shared',
        capacity: 2,
        floor: 'First',
        description: 'Near the study area',
      });

    expect(response.status).toBe(201);
    expect(roomService.createRoom).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'admin' }),
      expect.objectContaining({ room_number: 'A101', capacity: 2 })
    );
  });

  test('room creation rejects invalid capacity', async () => {
    const response = await request(app)
      .post('/api/v1/rooms')
      .set('Authorization', authorization(users.admin))
      .send({
        room_number: 'A101',
        room_type: 'Shared',
        capacity: 0,
      });

    expect(response.status).toBe(422);
    expect(roomService.createRoom).not.toHaveBeenCalled();
  });

  test('Admin can update room status', async () => {
    const response = await request(app)
      .patch(`/api/v1/rooms/${roomId}/status`)
      .set('Authorization', authorization(users.admin))
      .send({ status: 'inactive' });

    expect(response.status).toBe(200);
    expect(roomService.updateRoomStatus).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'admin' }),
      roomId,
      'inactive'
    );
  });

  test('Student can view only the own allocation endpoint', async () => {
    const response = await request(app)
      .get('/api/v1/allocations/me')
      .set('Authorization', authorization(users.student));

    expect(response.status).toBe(200);
    expect(response.body.data.allocation.room_number).toBe('A101');

    const adminListResponse = await request(app)
      .get('/api/v1/allocations')
      .set('Authorization', authorization(users.student));
    expect(adminListResponse.status).toBe(403);
  });

  test('Admin can create an allocation', async () => {
    const response = await request(app)
      .post('/api/v1/allocations')
      .set('Authorization', authorization(users.admin))
      .send({
        student_id: studentId,
        room_id: roomId,
        start_date: '2026-07-27',
        expected_end_date: '2026-12-20',
        notes: 'Semester allocation',
      });

    expect(response.status).toBe(201);
    expect(roomService.createAllocation).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'admin' }),
      expect.objectContaining({
        student_id: studentId,
        room_id: roomId,
        start_date: expect.any(Date),
      })
    );
  });

  test('Admin can change an allocation', async () => {
    const response = await request(app)
      .patch(`/api/v1/allocations/${allocationId}`)
      .set('Authorization', authorization(users.admin))
      .send({ room_id: roomId, notes: 'Changed by Admin' });

    expect(response.status).toBe(200);
  });

  test('Admin can end an allocation', async () => {
    const response = await request(app)
      .patch(`/api/v1/allocations/${allocationId}/end`)
      .set('Authorization', authorization(users.admin))
      .send({
        actual_end_date: '2026-07-27',
        allocation_status: 'completed',
      });

    expect(response.status).toBe(200);
    expect(roomService.endAllocation).toHaveBeenCalled();
  });

  test('allocation endpoints require authentication', async () => {
    const response = await request(app).get('/api/v1/allocations');
    expect(response.status).toBe(401);
  });
});
