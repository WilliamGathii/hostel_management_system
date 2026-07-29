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
  getAllocationReport: jest.fn(),
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
const studentId = '33333333-3333-4333-8333-333333333333';
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
  security: {
    id: 'payment-security-user',
    role: 'security_staff',
    account_status: 'active',
  },
};
const payment = {
  id: paymentId,
  student_id: studentId,
  amount: '1500.00',
  payment_status: 'pending',
};
const listResult = {
  is_simulated: true,
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
    paymentService.getPayment.mockResolvedValue({
      is_simulated: true,
      payment,
    });
    paymentService.createPayment.mockResolvedValue({
      is_simulated: true,
      payment,
    });
    paymentService.updatePaymentStatus.mockResolvedValue({
      is_simulated: true,
      payment: { ...payment, payment_status: 'paid' },
    });
    reportService.getDashboard.mockResolvedValue({ payment_records: 1 });
    reportService.getRoomReport.mockResolvedValue({ rooms: [] });
    reportService.getAllocationReport.mockResolvedValue({ records: [] });
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
    expect(response.body.data.is_simulated).toBe(true);
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

  test('Payment endpoint rejects invalid amounts and Student status fields', async () => {
    const header = authorization(users.student);
    const invalidAmount = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', header)
      .send({
        amount: 0,
        payment_method: 'Cash',
        payment_date: '2026-07-29',
      });
    expect(invalidAmount.status).toBe(422);

    const unsupportedStatus = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', header)
      .send({
        amount: 1500,
        payment_method: 'Cash',
        payment_date: '2026-07-29',
        payment_status: 'paid',
      });
    expect(unsupportedStatus.status).toBe(422);
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

  test('Admin can filter payment records by Student identifier', async () => {
    const response = await request(app)
      .get(`/api/v1/payments?student_id=${studentId}`)
      .set('Authorization', authorization(users.admin));

    expect(response.status).toBe(200);
    expect(paymentService.listPayments).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'admin' }),
      expect.objectContaining({ studentId })
    );
  });

  test('Payment Student filter validates identifiers', async () => {
    const response = await request(app)
      .get('/api/v1/payments?student_id=not-a-uuid')
      .set('Authorization', authorization(users.admin));

    expect(response.status).toBe(422);
    expect(paymentService.listPayments).not.toHaveBeenCalled();
  });

  test('Payment detail responses contain no credential fields', async () => {
    const response = await request(app)
      .get(`/api/v1/payments/${paymentId}`)
      .set('Authorization', authorization(users.admin));
    expect(response.body.data.is_simulated).toBe(true);
    expect(response.body.data.payment).not.toHaveProperty('password_hash');
    expect(response.body.data.payment).not.toHaveProperty('card_number');
    expect(response.body.data.payment).not.toHaveProperty('provider_token');
    expect(response.body.data.payment.student_id).toBe(studentId);
  });

  test('Payment status validation rejects unsupported values', async () => {
    const response = await request(app)
      .patch(`/api/v1/payments/${paymentId}/status`)
      .set('Authorization', authorization(users.admin))
      .send({ payment_status: 'processing' });
    expect(response.status).toBe(422);
  });

  test('Non-Admin cannot list all payments', async () => {
    const response = await request(app)
      .get('/api/v1/payments')
      .set('Authorization', authorization(users.student));
    expect(response.status).toBe(403);
  });

  test.each([users.maintenance, users.security])(
    '$role cannot use the Admin Student payment filter',
    async (user) => {
      const response = await request(app)
        .get(`/api/v1/payments?student_id=${studentId}`)
        .set('Authorization', authorization(user));
      expect(response.status).toBe(403);
    }
  );

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
      'allocations',
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

  test('Report filters reject invalid dates and unsupported statuses', async () => {
    const header = authorization(users.admin);
    const invalidDate = await request(app)
      .get('/api/v1/reports/payments?date_from=not-a-date')
      .set('Authorization', header);
    expect(invalidDate.status).toBe(422);

    const invalidStatus = await request(app)
      .get('/api/v1/reports/payments?status=processing')
      .set('Authorization', header);
    expect(invalidStatus.status).toBe(422);
  });

  test('Payment and report routes require authentication', async () => {
    expect((await request(app).get('/api/v1/payments/me')).status).toBe(401);
    expect((await request(app).get('/api/v1/reports/dashboard')).status).toBe(
      401
    );
  });
});
