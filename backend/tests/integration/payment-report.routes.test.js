const request = require('supertest');

jest.mock('../../src/services/payment.service', () => ({
  listMyPayments: jest.fn(),
  listPayments: jest.fn(),
  getPayment: jest.fn(),
  createPayment: jest.fn(),
  updatePaymentStatus: jest.fn(),
}));
jest.mock('../../src/services/report.service', () => ({
  getDashboard: jest.fn(),
  getRoomReport: jest.fn(),
  getStudentReport: jest.fn(),
  getMaintenanceReport: jest.fn(),
  getVisitorReport: jest.fn(),
  getPaymentReport: jest.fn(),
}));
jest.mock('../../src/models/user.model', () => ({
  findUserById: jest.fn(),
}));

const app = require('../../src/app');
const userModel = require('../../src/models/user.model');
const paymentService = require('../../src/services/payment.service');
const reportService = require('../../src/services/report.service');
const { signAuthToken } = require('../../src/utils/jwt');

const paymentId = '11111111-1111-4111-8111-111111111111';
const allocationId = '22222222-2222-4222-8222-222222222222';
const users = {
  student: {
    id: 'payment-student-user',
    role: 'student',
    account_status: 'active',
  },
  admin: {
    id: 'payment-admin-user',
    role: 'admin',
    account_status: 'active',
  },
  maintenance: {
    id: 'payment-maintenance-user',
    role: 'maintenance_staff',
    account_status: 'active',
  },
};
const payment = {
  id: paymentId,
  amount: '1500.00',
  payment_status: 'pending',
};
const listResult = {
  payments: [payment],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
};
const authorization = (user) => `Bearer ${signAuthToken(user)}`;

describe('payment and report routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userModel.findUserById.mockImplementation(async (userId) =>
      Object.values(users).find((user) => user.id === userId)
    );
    paymentService.listMyPayments.mockResolvedValue(listResult);
    paymentService.listPayments.mockResolvedValue(listResult);
    paymentService.getPayment.mockResolvedValue(payment);
    paymentService.createPayment.mockResolvedValue(payment);
    paymentService.updatePaymentStatus.mockResolvedValue({
      ...payment,
      payment_status: 'paid',
    });
    reportService.getDashboard.mockResolvedValue({ payment_records: 1 });
    reportService.getRoomReport.mockResolvedValue({ rooms: [] });
    reportService.getStudentReport.mockResolvedValue({ records: [] });
    reportService.getMaintenanceReport.mockResolvedValue({ records: [] });
    reportService.getVisitorReport.mockResolvedValue({ records: [] });
    reportService.getPaymentReport.mockResolvedValue({ records: [] });
  });

  test('Student can list their own simulated payments', async () => {
    const response = await request(app)
      .get('/api/v1/payments/me')
      .set('Authorization', authorization(users.student));
    expect(response.status).toBe(200);
    expect(response.body.data.payments).toHaveLength(1);
  });

  test('Student can submit supported simulated payment fields', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', authorization(users.student))
      .send({
        amount: 1500,
        payment_method: 'Cash',
        transaction_reference: 'SIM-001',
        payment_date: '2026-07-29',
      });
    expect(response.status).toBe(201);
  });

  test('Payment endpoint rejects gateway and card fields', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', authorization(users.student))
      .send({
        amount: 1500,
        payment_method: 'Cash',
        payment_date: '2026-07-29',
        card_number: '4111111111111111',
      });
    expect(response.status).toBe(422);
  });

  test('Admin can list, view, create, and review payments', async () => {
    const header = authorization(users.admin);
    expect(
      (await request(app).get('/api/v1/payments').set('Authorization', header))
        .status
    ).toBe(200);
    expect(
      (
        await request(app)
          .get(`/api/v1/payments/${paymentId}`)
          .set('Authorization', header)
      ).status
    ).toBe(200);
    expect(
      (
        await request(app)
          .post('/api/v1/payments')
          .set('Authorization', header)
          .send({
            room_allocation_id: allocationId,
            amount: 1500,
            payment_method: 'Cash',
            payment_date: '2026-07-29',
          })
      ).status
    ).toBe(201);
    expect(
      (
        await request(app)
          .patch(`/api/v1/payments/${paymentId}/status`)
          .set('Authorization', header)
          .send({ payment_status: 'paid' })
      ).status
    ).toBe(200);
  });

  test('Non-Admin cannot list all payments', async () => {
    const response = await request(app)
      .get('/api/v1/payments')
      .set('Authorization', authorization(users.student));
    expect(response.status).toBe(403);
  });

  test.each(Object.values(users))(
    '$role can view role-specific dashboard statistics',
    async (user) => {
      const response = await request(app)
        .get('/api/v1/reports/dashboard')
        .set('Authorization', authorization(user));
      expect(response.status).toBe(200);
    }
  );

  test('Admin can view every approved report group', async () => {
    const header = authorization(users.admin);
    for (const path of [
      'rooms',
      'students',
      'maintenance',
      'visitors',
      'payments',
    ]) {
      const response = await request(app)
        .get(`/api/v1/reports/${path}`)
        .set('Authorization', header);
      expect(response.status).toBe(200);
    }
  });

  test('Student cannot view Admin reports', async () => {
    const response = await request(app)
      .get('/api/v1/reports/rooms')
      .set('Authorization', authorization(users.student));
    expect(response.status).toBe(403);
  });

  test('Payment and report routes require authentication', async () => {
    expect((await request(app).get('/api/v1/payments/me')).status).toBe(401);
    expect((await request(app).get('/api/v1/reports/dashboard')).status).toBe(
      401
    );
  });
});
