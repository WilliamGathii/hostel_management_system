const notificationModel = require('../models/notification.model');
const AppError = require('../utils/app-error');

const createNotification = (data, database) =>
  notificationModel.createNotification(data, database);

const listNotifications = async (user, options) => {
  if (!user) {
    throw new AppError('Authentication is required', 401);
  }

  const notifications = await notificationModel.listNotifications(
    user.id,
    options
  );
  const total = await notificationModel.countNotifications(
    user.id,
    options.unreadOnly
  );
  const unreadCount = await notificationModel.countUnread(user.id);

  return {
    notifications,
    unread_count: unreadCount,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / options.limit),
    },
  };
};

const markRead = async (user, notificationId) => {
  if (!user) {
    throw new AppError('Authentication is required', 401);
  }

  const notification = await notificationModel.markRead(
    notificationId,
    user.id
  );
  if (!notification) {
    throw new AppError('Notification was not found', 404);
  }
  return notification;
};

const markAllRead = async (user) => {
  if (!user) {
    throw new AppError('Authentication is required', 401);
  }
  return notificationModel.markAllRead(user.id);
};

module.exports = {
  createNotification,
  listNotifications,
  markRead,
  markAllRead,
};
