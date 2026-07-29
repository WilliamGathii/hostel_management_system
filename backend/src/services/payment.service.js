const paymentModel = require('../models/payment.model');
const notificationService = require('./notification.service');
const AppError = require('../utils/app-error');

const PAYMENT_TRANSITIONS = Object.freeze({
  pending: new Set(['paid', 'failed', 'rejected']),
  paid: new Set(['reversed']),
  failed: new Set(),
  rejected: new Set(),
  reversed: new Set(),
});

const requireRole = (user, roles) => {
  if (!user) {
    throw new AppError('Authentication is required', 401);
  }
  if (!roles.includes(user.role)) {
    throw new AppError('You do not have permission for this action', 403);
  }
};

const normalizeText = (value) =>
  value === null || value === undefined ? null : value.trim() || null;

const pagination = (options, total) => ({
  page: options.page,
  limit: options.limit,
  total,
  totalPages: total === 0 ? 0 : Math.ceil(total / options.limit),
});

const listMyPayments = async (user, options) => {
  requireRole(user, ['student']);
  const query = { ...options, studentUserId: user.id };
  const payments = await paymentModel.listPayments(query);
  const total = await paymentModel.countPayments(query);
  return { payments, pagination: pagination(options, total) };
};

const listPayments = async (user, options) => {
  requireRole(user, ['admin']);
  const payments = await paymentModel.listPayments(options);
  const total = await paymentModel.countPayments(options);
  return { payments, pagination: pagination(options, total) };
};

const getPayment = async (user, paymentId) => {
  requireRole(user, ['student', 'admin']);
  const payment = await paymentModel.findPaymentById(paymentId);
  if (!payment) {
    throw new AppError('Payment record was not found', 404);
  }
  if (user.role === 'student' && payment.student_user_id !== user.id) {
    throw new AppError('You do not have permission for this record', 403);
  }
  return payment;
};

const resolvePaymentStudent = async (user, allocationId, database) => {
  const allocation = allocationId
    ? await paymentModel.findAllocationById(allocationId, database)
    : null;

  if (allocationId && !allocation) {
    throw new AppError('Room allocation was not found', 404);
  }

  if (user.role === 'student') {
    const student = await paymentModel.findStudentByUserId(user.id, database);
    if (!student) {
      throw new AppError('Student profile was not found', 404);
    }
    if (allocation && allocation.student_id !== student.id) {
      throw new AppError(
        'Room allocation does not belong to your account',
        403
      );
    }
    return { studentId: student.id, allocation };
  }

  if (!allocation) {
    throw new AppError(
      'Room allocation is required when an Admin records a payment',
      422
    );
  }
  return { studentId: allocation.student_id, allocation };
};

const createPayment = async (user, data) => {
  requireRole(user, ['student', 'admin']);
  try {
    return await paymentModel.withTransaction(async (database) => {
      const { studentId } = await resolvePaymentStudent(
        user,
        data.room_allocation_id,
        database
      );
      return paymentModel.createPayment(
        {
          ...data,
          student_id: studentId,
          amount: Number(data.amount),
          payment_method: data.payment_method.trim(),
          transaction_reference: normalizeText(data.transaction_reference),
          notes: normalizeText(data.notes),
          recorded_by: user.id,
        },
        database
      );
    });
  } catch (error) {
    if (
      error.code === '23505' &&
      error.constraint === 'payments_transaction_reference_key'
    ) {
      throw new AppError('Transaction reference already exists', 409);
    }
    throw error;
  }
};

const updatePaymentStatus = async (user, paymentId, data) => {
  requireRole(user, ['admin']);
  return paymentModel.withTransaction(async (database) => {
    const payment = await paymentModel.findPaymentById(
      paymentId,
      database,
      true
    );
    if (!payment) {
      throw new AppError('Payment record was not found', 404);
    }
    if (payment.payment_status === data.payment_status) {
      throw new AppError('Payment record already has this status', 409);
    }
    if (
      !PAYMENT_TRANSITIONS[payment.payment_status]?.has(data.payment_status)
    ) {
      throw new AppError('Payment status transition is not allowed', 409);
    }

    const updated = await paymentModel.updatePaymentStatus(
      paymentId,
      data.payment_status,
      normalizeText(data.notes),
      database
    );
    await notificationService.createNotification(
      {
        user_id: payment.student_user_id,
        notification_type: 'payment_status',
        title: 'Payment record updated',
        message: `Your simulated payment record is now ${data.payment_status}.`,
        related_entity_type: 'payment',
        related_entity_id: payment.id,
      },
      database
    );
    return updated;
  });
};

module.exports = {
  listMyPayments,
  listPayments,
  getPayment,
  createPayment,
  updatePaymentStatus,
};
