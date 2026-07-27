const { body, param, query } = require('express-validator');

const {
  handleValidation,
  validateAllowedFields,
} = require('./common.validator');

const ROOM_STATUSES = [
  'available',
  'occupied',
  'full',
  'under_maintenance',
  'inactive',
];
const ALLOCATION_STATUSES = ['pending', 'active', 'completed', 'cancelled'];
const text = (field, label, options = {}) => {
  let validator = body(field);

  if (options.optional) {
    validator = validator.optional({ nullable: true });
  }

  return validator
    .isString()
    .withMessage(`${label} must be text`)
    .bail()
    .trim()
    .isLength({ min: options.minimum || 1, max: options.maximum })
    .withMessage(`${label} must not exceed ${options.maximum} characters`);
};

const roomIdentifierValidation = [
  param('roomId').isUUID().withMessage('Room identifier must be a valid UUID'),
];
const allocationIdentifierValidation = [
  param('allocationId')
    .isUUID()
    .withMessage('Allocation identifier must be a valid UUID'),
];
const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
];

const roomListValidation = [
  ...paginationValidation,
  query('search').optional().isString().trim().isLength({ max: 100 }),
  query('status').optional().isIn(ROOM_STATUSES),
];

const roomCreateValidation = [
  body().custom(
    validateAllowedFields(
      new Set(['room_number', 'room_type', 'capacity', 'floor', 'description']),
      'Room details are required'
    )
  ),
  text('room_number', 'Room number', { maximum: 50 }),
  text('room_type', 'Room type', { maximum: 80 }),
  body('capacity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Capacity must be between 1 and 100')
    .toInt(),
  text('floor', 'Floor', { maximum: 50, optional: true }),
  text('description', 'Description', {
    maximum: 1000,
    optional: true,
  }),
];

const roomUpdateValidation = [
  body().custom(
    validateAllowedFields(
      new Set(['room_type', 'capacity', 'floor', 'description']),
      'Provide at least one room field to update'
    )
  ),
  text('room_type', 'Room type', { maximum: 80, optional: true }),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Capacity must be between 1 and 100')
    .toInt(),
  text('floor', 'Floor', { maximum: 50, optional: true }),
  text('description', 'Description', {
    maximum: 1000,
    optional: true,
  }),
];

const roomStatusValidation = [
  body().custom(
    validateAllowedFields(new Set(['status']), 'Room status is required')
  ),
  body('status')
    .isIn(ROOM_STATUSES)
    .withMessage('Room status is not supported'),
];

const allocationListValidation = [
  ...paginationValidation,
  query('search').optional().isString().trim().isLength({ max: 100 }),
  query('status').optional().isIn(ALLOCATION_STATUSES),
  query('room_id').optional().isUUID(),
  query('student_id').optional().isUUID(),
];

const allocationCreateValidation = [
  body().custom(
    validateAllowedFields(
      new Set([
        'student_id',
        'room_id',
        'start_date',
        'expected_end_date',
        'notes',
      ]),
      'Allocation details are required'
    )
  ),
  body('student_id').isUUID().withMessage('Student identifier is invalid'),
  body('room_id').isUUID().withMessage('Room identifier is invalid'),
  body('start_date').isISO8601({ strict: true }).toDate(),
  body('expected_end_date')
    .optional({ nullable: true })
    .isISO8601({ strict: true })
    .toDate()
    .custom((value, { req }) => {
      if (
        value &&
        req.body.start_date &&
        value < new Date(req.body.start_date)
      ) {
        throw new Error('Expected end date cannot be before start date');
      }
      return true;
    }),
  text('notes', 'Notes', { maximum: 1000, optional: true }),
];

const allocationUpdateValidation = [
  body().custom(
    validateAllowedFields(
      new Set(['room_id', 'expected_end_date', 'notes']),
      'Provide at least one allocation field to update'
    )
  ),
  body('room_id').optional().isUUID(),
  body('expected_end_date')
    .optional({ nullable: true })
    .isISO8601({ strict: true })
    .toDate(),
  text('notes', 'Notes', { maximum: 1000, optional: true }),
];

const allocationEndValidation = [
  body().custom(
    validateAllowedFields(
      new Set(['actual_end_date', 'notes', 'allocation_status']),
      'Allocation end details are required'
    )
  ),
  body('actual_end_date').isISO8601({ strict: true }).toDate(),
  text('notes', 'Notes', { maximum: 1000, optional: true }),
  body('allocation_status')
    .optional()
    .isIn(['completed', 'cancelled'])
    .withMessage('End status must be completed or cancelled'),
];

module.exports = {
  roomIdentifierValidation,
  allocationIdentifierValidation,
  roomListValidation,
  roomCreateValidation,
  roomUpdateValidation,
  roomStatusValidation,
  allocationListValidation,
  allocationCreateValidation,
  allocationUpdateValidation,
  allocationEndValidation,
  handleRoomValidation: handleValidation,
};
