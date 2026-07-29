const { body, param, query } = require('express-validator');

const {
  handleValidation,
  validateAllowedFields,
} = require('./common.validator');

const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'rejected', 'reversed'];
const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
];

const paymentIdentifierValidation = [
  param('paymentId')
    .isUUID()
    .withMessage('Payment identifier must be a valid UUID'),
];

const paymentListValidation = [
  ...paginationValidation,
  query('search').optional().isString().trim().isLength({ max: 100 }),
  query('status').optional().isIn(PAYMENT_STATUSES),
  query('student_id').optional().isUUID(),
  query('room_id').optional().isUUID(),
  query('date_from').optional().isISO8601({ strict: true }).toDate(),
  query('date_to')
    .optional()
    .isISO8601({ strict: true })
    .toDate()
    .custom((value, { req }) => {
      if (
        value &&
        req.query.date_from &&
        value < new Date(req.query.date_from)
      ) {
        throw new Error('End date cannot be before start date');
      }
      return true;
    }),
];

const paymentCreateValidation = [
  body().custom(
    validateAllowedFields(
      new Set([
        'room_allocation_id',
        'amount',
        'payment_method',
        'transaction_reference',
        'payment_date',
        'notes',
      ]),
      'Payment details are required'
    )
  ),
  body('room_allocation_id').optional({ nullable: true }).isUUID(),
  body('amount')
    .isFloat({ gt: 0, max: 9999999999.99 })
    .withMessage('Amount must be greater than zero')
    .toFloat(),
  body('payment_method')
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Payment method must not exceed 50 characters'),
  body('transaction_reference')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 }),
  body('payment_date').isISO8601({ strict: true }).toDate(),
  body('notes')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 1000 }),
];

const paymentStatusValidation = [
  body().custom(
    validateAllowedFields(
      new Set(['payment_status', 'notes']),
      'Payment status is required'
    )
  ),
  body('payment_status')
    .isIn(PAYMENT_STATUSES.filter((status) => status !== 'pending'))
    .withMessage('Payment status is not supported'),
  body('notes')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 1000 }),
];

module.exports = {
  paymentIdentifierValidation,
  paymentListValidation,
  paymentCreateValidation,
  paymentStatusValidation,
  handlePaymentValidation: handleValidation,
};
