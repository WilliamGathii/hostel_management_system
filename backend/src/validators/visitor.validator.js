const { body, param, query } = require('express-validator');

const {
  handleValidation,
  validateAllowedFields,
} = require('./common.validator');

const APPROVAL_STATUSES = ['pending', 'approved', 'rejected', 'expired'];
const VERIFICATION_STATUSES = ['checked_in', 'checked_out', 'cancelled'];
const visitorIdentifierValidation = [
  param('visitorId')
    .isUUID()
    .withMessage('Visitor identifier must be a valid UUID'),
];
const visitorListValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('search').optional().isString().trim().isLength({ max: 100 }),
  query('approval_status').optional().isIn(APPROVAL_STATUSES),
  query('verification_status').optional().isIn(VERIFICATION_STATUSES),
  query('visit_date').optional().isISO8601({ strict: true }),
  query('student_id').optional().isUUID(),
];
const visitorCreateValidation = [
  body().custom(
    validateAllowedFields(
      new Set([
        'visitor_name',
        'visitor_phone',
        'identification_type',
        'identification_number',
        'visit_date',
        'expected_entry_time',
        'expected_exit_time',
        'purpose',
      ]),
      'Visitor details are required'
    )
  ),
  body('visitor_name')
    .isString()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Visitor name must be between 2 and 150 characters'),
  body('visitor_phone')
    .isString()
    .trim()
    .isLength({ min: 7, max: 30 })
    .matches(/^[0-9+()\-\s]+$/)
    .withMessage('Enter a valid visitor phone number'),
  body('identification_type')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 50 }),
  body('identification_number')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 100 }),
  body('visit_date').isISO8601({ strict: true }).toDate(),
  body('expected_entry_time')
    .optional({ nullable: true })
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('Expected entry time must use HH:MM format'),
  body('expected_exit_time')
    .optional({ nullable: true })
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('Expected exit time must use HH:MM format'),
  body('purpose')
    .isString()
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Purpose must be between 3 and 1000 characters'),
];
const visitorApprovalValidation = [
  body().custom(
    validateAllowedFields(
      new Set(['approval_status']),
      'Approval status is required'
    )
  ),
  body('approval_status')
    .isIn(['approved', 'rejected'])
    .withMessage('Approval status must be approved or rejected'),
];
const visitorVerificationValidation = [
  body().custom((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('Verification details must be an object');
    }
    const unsupportedFields = Object.keys(value).filter(
      (field) => field !== 'notes'
    );
    if (unsupportedFields.length > 0) {
      throw new Error(`Unsupported field: ${unsupportedFields.join(', ')}`);
    }
    return true;
  }),
  body('notes')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
];

module.exports = {
  visitorIdentifierValidation,
  visitorListValidation,
  visitorCreateValidation,
  visitorApprovalValidation,
  visitorVerificationValidation,
  handleVisitorValidation: handleValidation,
};
