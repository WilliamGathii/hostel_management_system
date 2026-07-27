const notificationService = require('../services/notification.service');
const { sendSuccess } = require('../utils/api-response');

const listNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.listNotifications(req.user, {
      page: req.validatedQuery.page || 1,
      limit: req.validatedQuery.limit || 20,
      unreadOnly: req.validatedQuery.unread_only || false,
    });
    return sendSuccess(res, {
      message: 'Notifications retrieved successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const markRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markRead(
      req.user,
      req.validatedParams.notificationId
    );
    return sendSuccess(res, {
      message: 'Notification marked as read',
      data: { notification },
    });
  } catch (error) {
    return next(error);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    const updatedCount = await notificationService.markAllRead(req.user);
    return sendSuccess(res, {
      message: 'Notifications marked as read',
      data: { updated_count: updatedCount },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listNotifications,
  markRead,
  markAllRead,
};
