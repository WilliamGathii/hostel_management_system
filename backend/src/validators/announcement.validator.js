const { body, param, query } = require('express-validator');

const {
  handleValidation,
  validateAllowedFields,
} = require('./common.validator');

const ROLES = [
  'all',
  'student',
  'admin',
  'maintenance_staff',
  'security_staff',
];
const STATUSES = ['draft', 'published', 'expired', 'archived'];
const announcementIdentifierValidation = [
  param('announcementId')
    .isUUID()
    .withMessage('Announcement identifier must be a valid UUID'),
];
const announcementListValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('search').optional().isString().trim().isLength({ max: 100 }),
  query('status').optional().isIn(STATUSES),
];
const sharedFields = [
  body('title')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 180 })
    .withMessage('Title must be between 3 and 180 characters'),
  body('message')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 5, max: 5000 })
    .withMessage('Message must be between 5 and 5000 characters'),
  body('target_role')
    .optional({ nullable: true })
    .isIn(ROLES)
    .withMessage('Target audience is not supported'),
  body('published_at')
    .optional({ nullable: true })
    .isISO8601()
    .toDate()
    .withMessage('Published date is invalid'),
  body('expires_at')
    .optional({ nullable: true })
    .isISO8601()
    .toDate()
    .withMessage('Expiry date is invalid'),
  body('status')
    .optional()
    .isIn(STATUSES)
    .withMessage('Status is not supported'),
];
const announcementCreateValidation = [
  body().custom(
    validateAllowedFields(
      new Set([
        'title',
        'message',
        'target_role',
        'published_at',
        'expires_at',
        'status',
      ]),
      'Announcement details are required'
    )
  ),
  body('title')
    .isString()
    .trim()
    .isLength({ min: 3, max: 180 })
    .withMessage('Title must be between 3 and 180 characters'),
  body('message')
    .isString()
    .trim()
    .isLength({ min: 5, max: 5000 })
    .withMessage('Message must be between 5 and 5000 characters'),
  body('target_role')
    .isIn(ROLES)
    .withMessage('Target audience is not supported'),
  body('status').isIn(STATUSES).withMessage('Status is not supported'),
  ...sharedFields.slice(3, 5),
];
const announcementUpdateValidation = [
  body().custom(
    validateAllowedFields(
      new Set([
        'title',
        'message',
        'target_role',
        'published_at',
        'expires_at',
        'status',
      ]),
      'Provide at least one announcement field to update'
    )
  ),
  ...sharedFields,
];

module.exports = {
  announcementIdentifierValidation,
  announcementListValidation,
  announcementCreateValidation,
  announcementUpdateValidation,
  handleAnnouncementValidation: handleValidation,
};
