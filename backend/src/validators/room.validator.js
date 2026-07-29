const { body, param, query } = require('express-validator');

const {
  handleValidation,
  validateAllowedFields,
} = require('./common.validator');

const ROOM_OPERATIONAL_STATUSES = ['active', 'under_maintenance', 'inactive'];
const ROOM_OCCUPANCY_STATUSES = [
  'available',
  'partially_occupied',
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
  query('floor').optional().isInt({ min: 1 }).toInt(),
  query('room_type_id').optional().isUUID(),
  query('room_type_code')
    .optional()
    .isString()
    .trim()
    .toUpperCase()
    .matches(/^[A-Z]$/),
  query('operational_status').optional().isIn(ROOM_OPERATIONAL_STATUSES),
  query('occupancy_status').optional().isIn(ROOM_OCCUPANCY_STATUSES),
];

const roomCreateValidation = [
  body().custom(
    validateAllowedFields(
      new Set(['room_type_id', 'floor_number', 'room_number', 'description']),
      'Room details are required'
    )
  ),
  body('room_type_id').isUUID().withMessage('Room type identifier is invalid'),
  body('floor_number')
    .isInt({ min: 1 })
    .withMessage('Floor number must be greater than zero')
    .toInt(),
  body('room_number')
    .isInt({ min: 1, max: 99 })
    .withMessage('Room number must be between 1 and 99')
    .toInt(),
  text('description', 'Description', {
    maximum: 1000,
    optional: true,
  }),
];

const roomUpdateValidation = [
  body().custom(
    validateAllowedFields(
      new Set(['capacity', 'description']),
      'Provide at least one room field to update'
    )
  ),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Capacity must be between 1 and 100')
    .toInt(),
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
    .isIn(ROOM_OPERATIONAL_STATUSES)
    .withMessage('Room operational status is not supported'),
];

const roomBulkCreateValidation = [
  body().custom(
    validateAllowedFields(
      new Set([
        'room_type_id',
        'floor_number',
        'starting_room_number',
        'quantity',
      ]),
      'Bulk room details are required'
    )
  ),
  body('room_type_id').isUUID().withMessage('Room type identifier is invalid'),
  body('floor_number')
    .isInt({ min: 1 })
    .withMessage('Floor number must be greater than zero')
    .toInt(),
  body('starting_room_number')
    .isInt({ min: 1, max: 99 })
    .withMessage('Starting room number must be between 1 and 99')
    .toInt(),
  body('quantity')
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantity must be between 1 and 99')
    .toInt()
    .custom((quantity, { req }) => {
      const startingRoomNumber = Number(req.body.starting_room_number);

      if (
        Number.isInteger(startingRoomNumber) &&
        startingRoomNumber + quantity - 1 > 99
      ) {
        throw new Error('Final room number must not exceed 99');
      }
      return true;
    }),
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
  roomBulkCreateValidation,
  roomUpdateValidation,
  roomStatusValidation,
  allocationListValidation,
  allocationCreateValidation,
  allocationUpdateValidation,
  allocationEndValidation,
  handleRoomValidation: handleValidation,
};
