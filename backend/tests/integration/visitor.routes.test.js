const request = require('supertest');

jest.mock('../../src/services/visitor.service', () => ({
  createVisitor: jest.fn(),
  listMyVisitors: jest.fn(),
  listVisitors: jest.fn(),
  getVisitor: jest.fn(),
  updateApproval: jest.fn(),
  verifyEntry: jest.fn(),
  verifyExit: jest.fn(),
}));
jest.mock('../../src/models/user.model', () => ({
  findUserById: jest.fn(),
}));

const app = require('../../src/app');
const userModel = require('../../src/models/user.model');
const visitorService = require('../../src/services/visitor.service');
const { signAuthToken } = require('../../src/utils/jwt');

const visitorId = '11111111-1111-4111-8111-111111111111';
const users = {
  student: {
    id: 'visitor-student-user',
    role: 'student',
    account_status: 'active',
  },
  admin: {
    id: 'visitor-admin-user',
    role: 'admin',
    account_status: 'active',
  },
  security_staff: {
    id: 'visitor-security-user',
    role: 'security_staff',
    account_status: 'active',
  },
  maintenance_staff: {
    id: 'visitor-maintenance-user',
    role: 'maintenance_staff',
    account_status: 'active',
  },
};
const visitor = {
  id: visitorId,
  visitor_name: 'Jane Visitor',
  approval_status: 'pending',
};
const authorization = (user) => `Bearer ${signAuthToken(user)}`;

describe('visitor routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userModel.findUserById.mockImplementation(async (userId) =>
      Object.values(users).find((user) => user.id === userId)
    );
    visitorService.createVisitor.mockResolvedValue(visitor);
    visitorService.listMyVisitors.mockResolvedValue({
      visitors: [visitor],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    visitorService.listVisitors.mockResolvedValue({
      visitors: [visitor],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    visitorService.getVisitor.mockResolvedValue(visitor);
    visitorService.updateApproval.mockResolvedValue({
      ...visitor,
      approval_status: 'approved',
    });
    visitorService.verifyEntry.mockResolvedValue({
      ...visitor,
      approval_status: 'approved',
      entry_time: '2026-07-27T10:00:00.000Z',
    });
    visitorService.verifyExit.mockResolvedValue({
      ...visitor,
      approval_status: 'approved',
      entry_time: '2026-07-27T10:00:00.000Z',
      exit_time: '2026-07-27T12:00:00.000Z',
    });
  });

  test('Student can register a visitor', async () => {
    const response = await request(app)
      .post('/api/v1/visitors')
      .set('Authorization', authorization(users.student))
      .send({
        visitor_name: 'Jane Visitor',
        visitor_phone: '+254700000000',
        identification_type: 'National ID',
        identification_number: 'ID123',
        visit_date: '2026-07-28',
        expected_entry_time: '10:00',
        expected_exit_time: '12:00',
        purpose: 'Visit a student',
      });
    expect(response.status).toBe(201);
  });

  test('Student can view own visitors', async () => {
    const response = await request(app)
      .get('/api/v1/visitors/me')
      .set('Authorization', authorization(users.student));
    expect(response.status).toBe(200);
  });

  test.each(['admin', 'security_staff'])(
    '%s can list permitted visitor records',
    async (role) => {
      const response = await request(app)
        .get('/api/v1/visitors')
        .set('Authorization', authorization(users[role]));
      expect(response.status).toBe(200);
    }
  );

  test('Maintenance Staff cannot view visitors', async () => {
    const response = await request(app)
      .get('/api/v1/visitors')
      .set('Authorization', authorization(users.maintenance_staff));
    expect(response.status).toBe(403);
  });

  test('Admin can approve a visitor', async () => {
    const response = await request(app)
      .patch(`/api/v1/visitors/${visitorId}/approval`)
      .set('Authorization', authorization(users.admin))
      .send({ approval_status: 'approved' });
    expect(response.status).toBe(200);
  });

  test('Security Staff cannot approve a visitor', async () => {
    const response = await request(app)
      .patch(`/api/v1/visitors/${visitorId}/approval`)
      .set('Authorization', authorization(users.security_staff))
      .send({ approval_status: 'approved' });
    expect(response.status).toBe(403);
  });

  test('Security Staff can verify entry', async () => {
    const response = await request(app)
      .post(`/api/v1/visitors/${visitorId}/verify-entry`)
      .set('Authorization', authorization(users.security_staff))
      .send({ notes: 'Identification checked' });
    expect(response.status).toBe(201);
  });

  test('Security Staff can record exit', async () => {
    const response = await request(app)
      .patch(`/api/v1/visitors/${visitorId}/verify-exit`)
      .set('Authorization', authorization(users.security_staff))
      .send({ notes: 'Visitor left' });
    expect(response.status).toBe(200);
  });

  test('Admin cannot use Security verification endpoints', async () => {
    const response = await request(app)
      .post(`/api/v1/visitors/${visitorId}/verify-entry`)
      .set('Authorization', authorization(users.admin))
      .send({ notes: '' });
    expect(response.status).toBe(403);
  });

  test('visitor endpoints require authentication', async () => {
    const response = await request(app).get('/api/v1/visitors');
    expect(response.status).toBe(401);
  });
});
