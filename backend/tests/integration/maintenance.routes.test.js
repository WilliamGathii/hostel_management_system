const request = require('supertest');

jest.mock('../../src/services/maintenance.service', () => ({
  createRequest: jest.fn(),
  listMyRequests: jest.fn(),
  listRequests: jest.fn(),
  getRequest: jest.fn(),
  assignRequest: jest.fn(),
  updateStatus: jest.fn(),
  addUpdate: jest.fn(),
}));

jest.mock('../../src/models/user.model', () => ({
  findUserById: jest.fn(),
}));

const app = require('../../src/app');
const userModel = require('../../src/models/user.model');
const maintenanceService = require('../../src/services/maintenance.service');
const { signAuthToken } = require('../../src/utils/jwt');

const requestId = '11111111-1111-4111-8111-111111111111';
const roomId = '22222222-2222-4222-8222-222222222222';
const staffId = '33333333-3333-4333-8333-333333333333';
const users = {
  student: {
    id: 'maintenance-student-user',
    role: 'student',
    account_status: 'active',
  },
  admin: {
    id: 'maintenance-admin-user',
    role: 'admin',
    account_status: 'active',
  },
  maintenance_staff: {
    id: staffId,
    role: 'maintenance_staff',
    account_status: 'active',
  },
  security_staff: {
    id: 'maintenance-security-user',
    role: 'security_staff',
    account_status: 'active',
  },
};
const maintenanceRequest = {
  id: requestId,
  room_id: roomId,
  title: 'Broken tap',
  priority: 'high',
  status: 'submitted',
};
const authorization = (user) => `Bearer ${signAuthToken(user)}`;

describe('maintenance request routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userModel.findUserById.mockImplementation(async (userId) =>
      Object.values(users).find((user) => user.id === userId)
    );
    maintenanceService.createRequest.mockResolvedValue(maintenanceRequest);
    maintenanceService.listMyRequests.mockResolvedValue({
      maintenance_requests: [maintenanceRequest],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    maintenanceService.listRequests.mockResolvedValue({
      maintenance_requests: [maintenanceRequest],
      maintenance_staff: [],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    maintenanceService.getRequest.mockResolvedValue({
      maintenance_request: maintenanceRequest,
      updates: [],
    });
    maintenanceService.assignRequest.mockResolvedValue({
      ...maintenanceRequest,
      assigned_staff_id: staffId,
      status: 'assigned',
    });
    maintenanceService.updateStatus.mockResolvedValue({
      ...maintenanceRequest,
      status: 'in_progress',
    });
    maintenanceService.addUpdate.mockResolvedValue({
      id: 'update-1',
      note: 'Work started',
    });
  });

  test('Student can submit a maintenance request', async () => {
    const response = await request(app)
      .post('/api/v1/maintenance-requests')
      .set('Authorization', authorization(users.student))
      .send({
        room_id: roomId,
        title: 'Broken tap',
        description: 'The bathroom tap is leaking continuously.',
        priority: 'high',
      });

    expect(response.status).toBe(201);
    expect(maintenanceService.createRequest).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'student' }),
      expect.objectContaining({ priority: 'high' })
    );
  });

  test('maintenance submission rejects invalid priority', async () => {
    const response = await request(app)
      .post('/api/v1/maintenance-requests')
      .set('Authorization', authorization(users.student))
      .send({
        room_id: roomId,
        title: 'Broken tap',
        description: 'The bathroom tap is leaking continuously.',
        priority: 'critical',
      });

    expect(response.status).toBe(422);
  });

  test('Student can list own requests', async () => {
    const response = await request(app)
      .get('/api/v1/maintenance-requests/me')
      .set('Authorization', authorization(users.student));
    expect(response.status).toBe(200);
  });

  test.each(['admin', 'maintenance_staff'])(
    '%s can list permitted maintenance requests',
    async (role) => {
      const response = await request(app)
        .get('/api/v1/maintenance-requests?status=submitted')
        .set('Authorization', authorization(users[role]));
      expect(response.status).toBe(200);
    }
  );

  test('Security Staff cannot view maintenance requests', async () => {
    const response = await request(app)
      .get('/api/v1/maintenance-requests')
      .set('Authorization', authorization(users.security_staff));
    expect(response.status).toBe(403);
  });

  test('Admin can assign Maintenance Staff', async () => {
    const response = await request(app)
      .patch(`/api/v1/maintenance-requests/${requestId}/assign`)
      .set('Authorization', authorization(users.admin))
      .send({ assigned_staff_id: staffId });

    expect(response.status).toBe(200);
    expect(maintenanceService.assignRequest).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'admin' }),
      requestId,
      staffId
    );
  });

  test('Maintenance Staff cannot assign a request', async () => {
    const response = await request(app)
      .patch(`/api/v1/maintenance-requests/${requestId}/assign`)
      .set('Authorization', authorization(users.maintenance_staff))
      .send({ assigned_staff_id: staffId });
    expect(response.status).toBe(403);
  });

  test('Maintenance Staff can update assigned request status', async () => {
    const response = await request(app)
      .patch(`/api/v1/maintenance-requests/${requestId}/status`)
      .set('Authorization', authorization(users.maintenance_staff))
      .send({ status: 'in_progress', note: 'Work started' });
    expect(response.status).toBe(200);
  });

  test('Maintenance Staff can add progress notes', async () => {
    const response = await request(app)
      .post(`/api/v1/maintenance-requests/${requestId}/updates`)
      .set('Authorization', authorization(users.maintenance_staff))
      .send({ note: 'Replacement part ordered.' });
    expect(response.status).toBe(201);
  });

  test('maintenance endpoints require authentication', async () => {
    const response = await request(app).get('/api/v1/maintenance-requests');
    expect(response.status).toBe(401);
  });
});
