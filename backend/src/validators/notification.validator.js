const { param, query } = require('express-validator');

const { handleValidation } = require('./common.validator');

const notificationListValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('unread_only').optional().isBoolean().toBoolean(),
];
const notificationIdentifierValidation = [
  param('notificationId')
    .isUUID()
    .withMessage('Notification identifier must be a valid UUID'),
];

module.exports = {
  notificationListValidation,
  notificationIdentifierValidation,
  handleNotificationValidation: handleValidation,
};
