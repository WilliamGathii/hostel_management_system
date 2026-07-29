const request = require('supertest');

jest.mock('../../src/services/room-type.service', () => ({
  createRoomType: jest.fn(),
  getRoomType: jest.fn(),
  listRoomTypes: jest.fn(),
  updateRoomType: jest.fn(),
  updateRoomTypeStatus: jest.fn(),
}));

jest.mock('../../src/models/user.model', () => ({
  findUserById: jest.fn(),
}));

const app = require('../../src/app');
const userModel = require('../../src/models/user.model');
const roomTypeService = require('../../src/services/room-type.service');
const { signAuthToken } = require('../../src/utils/jwt');

const roomTypeId = '44444444-4444-4444-8444-444444444444';
const users = {
  admin: {
    id: 'admin-room-type-user',
    role: 'admin',
    account_status: 'active',
  },
  student: {
    id: 'student-room-type-user',
    role: 'student',
    account_status: 'active',
  },
};
const twinRoom = {
  id: roomTypeId,
  code: 'A',
  name: 'Twin Room',
  monthly_rate: '10000.00',
  default_capacity: 2,
  status: 'active',
};
const authorization = (user) => `Bearer ${signAuthToken(user)}`;

describe('room type routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userModel.findUserById.mockImplementation(async (userId) =>
      Object.values(users).find((user) => user.id === userId)
    );
    roomTypeService.listRoomTypes.mockResolvedValue([twinRoom]);
    roomTypeService.getRoomType.mockResolvedValue(twinRoom);
    roomTypeService.updateRoomType.mockResolvedValue(twinRoom);
    roomTypeService.updateRoomTypeStatus.mockResolvedValue({
      ...twinRoom,
      status: 'inactive',
    });
  });

  test('Admin can view room types', async () => {
    const response = await request(app)
      .get('/api/v1/room-types')
      .set('Authorization', authorization(users.admin));

    expect(response.status).toBe(200);
    expect(response.body.data.room_types[0]).toMatchObject({
      code: 'A',
      monthly_rate: '10000.00',
      default_capacity: 2,
    });
  });

  test('Student cannot manage room types', async () => {
    const response = await request(app)
      .get('/api/v1/room-types')
      .set('Authorization', authorization(users.student));

    expect(response.status).toBe(403);
  });

  test('room type code cannot be changed', async () => {
    const response = await request(app)
      .patch(`/api/v1/room-types/${roomTypeId}`)
      .set('Authorization', authorization(users.admin))
      .send({ code: 'Z' });

    expect(response.status).toBe(422);
    expect(roomTypeService.updateRoomType).not.toHaveBeenCalled();
  });

  test('Admin can update a monthly rate without a code field', async () => {
    const response = await request(app)
      .patch(`/api/v1/room-types/${roomTypeId}`)
      .set('Authorization', authorization(users.admin))
      .send({ monthly_rate: 12000 });

    expect(response.status).toBe(200);
    expect(roomTypeService.updateRoomType).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'admin' }),
      roomTypeId,
      { monthly_rate: 12000 }
    );
  });
});
