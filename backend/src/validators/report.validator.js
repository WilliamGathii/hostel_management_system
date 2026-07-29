const { query } = require('express-validator');

const { handleValidation } = require('./common.validator');

const REPORT_STATUSES = [
  'active',
  'suspended',
  'inactive',
  'available',
  'occupied',
  'full',
  'under_maintenance',
  'pending',
  'completed',
  'cancelled',
  'submitted',
  'assigned',
  'in_progress',
  'rejected',
  'expired',
  'approved',
  'paid',
  'failed',
  'reversed',
];

const reportValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('search').optional().isString().trim().isLength({ max: 100 }),
  query('status').optional().isIn(REPORT_STATUSES),
  query('room_id').optional().isUUID(),
  query('student_id').optional().isUUID(),
  query('assigned_staff_id').optional().isUUID(),
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

module.exports = {
  reportValidation,
  handleReportValidation: handleValidation,
};
