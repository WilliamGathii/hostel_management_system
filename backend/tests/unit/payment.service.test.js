jest.mock('../../src/models/payment.model', () => ({
  withTransaction: jest.fn(),
  findStudentByUserId: jest.fn(),
  findAllocationById: jest.fn(),
  findPaymentById: jest.fn(),
  listPayments: jest.fn(),
  countPayments: jest.fn(),
  createPayment: jest.fn(),
  updatePaymentStatus: jest.fn(),
}));
jest.mock('../../src/services/notification.service', () => ({
  createNotification: jest.fn(),
}));

const paymentModel = require('../../src/models/payment.model');
const notificationService = require('../../src/services/notification.service');
const paymentService = require('../../src/services/payment.service');

const users = {
  student: { id: 'student-user', role: 'student' },
  otherStudent: { id: 'other-student-user', role: 'student' },
  admin: { id: 'admin-user', role: 'admin' },
  maintenance: { id: 'maintenance-user', role: 'maintenance_staff' },
};
const payment = {
  id: 'payment-id',
  student_id: 'student-profile',
  student_user_id: users.student.id,
  payment_status: 'pending',
};
const options = {
  page: 1,
  limit: 20,
  search: '',
  status: '',
  studentId: '',
  roomId: '',
  dateFrom: '',
  dateTo: '',
};

describe('payment service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    paymentModel.withTransaction.mockImplementation((operation) =>
      operation({ query: jest.fn() })
    );
    paymentModel.listPayments.mockResolvedValue([payment]);
    paymentModel.countPayments.mockResolvedValue(1);
  });

  test('Student lists only their own payment records', async () => {
    await paymentService.listMyPayments(users.student, options);
    expect(paymentModel.listPayments).toHaveBeenCalledWith(
      expect.objectContaining({ studentUserId: users.student.id })
    );
  });

  test('Non-Admin cannot list all payment records', async () => {
    await expect(
      paymentService.listPayments(users.maintenance, options)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('Student cannot view another Student payment record', async () => {
    paymentModel.findPaymentById.mockResolvedValue(payment);
    await expect(
      paymentService.getPayment(users.otherStudent, payment.id)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('Student creates a pending simulated payment for their profile', async () => {
    paymentModel.findStudentByUserId.mockResolvedValue({
      id: 'student-profile',
      user_id: users.student.id,
    });
    paymentModel.createPayment.mockResolvedValue(payment);

    await expect(
      paymentService.createPayment(users.student, {
        room_allocation_id: null,
        amount: 1500,
        payment_method: 'Cash',
        transaction_reference: 'SIM-001',
        payment_date: new Date('2026-07-29'),
        notes: '',
      })
    ).resolves.toEqual(payment);
    expect(paymentModel.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        student_id: 'student-profile',
        recorded_by: users.student.id,
      }),
      expect.anything()
    );
  });

  test('Admin cannot record a payment without an allocation', async () => {
    await expect(
      paymentService.createPayment(users.admin, {
        room_allocation_id: null,
        amount: 1500,
        payment_method: 'Cash',
        payment_date: new Date('2026-07-29'),
      })
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  test('Admin can move a pending payment to paid', async () => {
    paymentModel.findPaymentById.mockResolvedValue(payment);
    paymentModel.updatePaymentStatus.mockResolvedValue({
      ...payment,
      payment_status: 'paid',
    });
    await expect(
      paymentService.updatePaymentStatus(users.admin, payment.id, {
        payment_status: 'paid',
        notes: 'Reviewed',
      })
    ).resolves.toMatchObject({ payment_status: 'paid' });
    expect(notificationService.createNotification).toHaveBeenCalled();
  });

  test('Admin cannot apply an invalid payment status transition', async () => {
    paymentModel.findPaymentById.mockResolvedValue({
      ...payment,
      payment_status: 'failed',
    });
    await expect(
      paymentService.updatePaymentStatus(users.admin, payment.id, {
        payment_status: 'paid',
      })
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});
