const { body, param, query } = require('express-validator');

const {
  handleValidation,
  validateAllowedFields,
} = require('./common.validator');

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = [
  'submitted',
  'assigned',
  'in_progress',
  'completed',
  'rejected',
  'cancelled',
];
const listValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('search').optional().isString().trim().isLength({ max: 100 }),
  query('status').optional().isIn(STATUSES),
  query('priority').optional().isIn(PRIORITIES),
  query('room_id').optional().isUUID(),
  query('student_id').optional().isUUID(),
  query('assigned_staff_id').optional().isUUID(),
];
const requestIdentifierValidation = [
  param('requestId')
    .isUUID()
    .withMessage('Maintenance request identifier must be a valid UUID'),
];
const requestCreateValidation = [
  body().custom(
    validateAllowedFields(
      new Set(['room_id', 'title', 'description', 'priority']),
      'Maintenance request details are required'
    )
  ),
  body('room_id').isUUID().withMessage('Room identifier is invalid'),
  body('title')
    .isString()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Title must be between 3 and 150 characters'),
  body('description')
    .isString()
    .trim()
    .isLength({ min: 10, max: 3000 })
    .withMessage('Description must be between 10 and 3000 characters'),
  body('priority').isIn(PRIORITIES).withMessage('Priority is not supported'),
];
const requestAssignValidation = [
  body().custom(
    validateAllowedFields(
      new Set(['assigned_staff_id']),
      'Maintenance Staff identifier is required'
    )
  ),
  body('assigned_staff_id')
    .isUUID()
    .withMessage('Maintenance Staff identifier is invalid'),
];
const requestStatusValidation = [
  body().custom(
    validateAllowedFields(
      new Set(['status', 'note']),
      'Maintenance status is required'
    )
  ),
  body('status').isIn(STATUSES).withMessage('Status is not supported'),
  body('note')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 1500 })
    .withMessage('Note must not exceed 1500 characters'),
];
const requestUpdateValidation = [
  body().custom(
    validateAllowedFields(new Set(['note']), 'Progress note is required')
  ),
  body('note')
    .isString()
    .trim()
    .isLength({ min: 2, max: 1500 })
    .withMessage('Progress note must be between 2 and 1500 characters'),
];

module.exports = {
  listValidation,
  requestIdentifierValidation,
  requestCreateValidation,
  requestAssignValidation,
  requestStatusValidation,
  requestUpdateValidation,
  handleMaintenanceValidation: handleValidation,
};
