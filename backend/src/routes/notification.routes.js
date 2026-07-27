const express = require('express');

const notificationController = require('../controllers/notification.controller');
const authenticate = require('../middleware/authenticate');
const {
  notificationListValidation,
  notificationIdentifierValidation,
  handleNotificationValidation,
} = require('../validators/notification.validator');

const router = express.Router();

router.use(authenticate);
router.get(
  '/',
  notificationListValidation,
  handleNotificationValidation,
  notificationController.listNotifications
);
router.patch('/read-all', notificationController.markAllRead);
router.patch(
  '/:notificationId/read',
  notificationIdentifierValidation,
  handleNotificationValidation,
  notificationController.markRead
);

module.exports = router;
