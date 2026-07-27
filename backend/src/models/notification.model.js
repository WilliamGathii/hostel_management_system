const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

const getDatabase = () => {
  if (!pool) {
    throw new AppError('Database is not configured', 503);
  }
  return pool;
};

const createNotification = async (data, database = getDatabase()) => {
  const result = await database.query(
    `INSERT INTO notifications (
       user_id, notification_type, title, message,
       related_entity_type, related_entity_id
     )
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      data.user_id,
      data.notification_type,
      data.title,
      data.message,
      data.related_entity_type || null,
      data.related_entity_id || null,
    ]
  );
  return result.rows[0].id;
};

const listNotifications = async (userId, options, database = getDatabase()) => {
  const values = [userId];
  const conditions = ['user_id = $1'];

  if (options.unreadOnly) {
    conditions.push('read_at IS NULL');
  }

  const offset = (options.page - 1) * options.limit;
  values.push(options.limit, offset);
  const result = await database.query(
    `SELECT
       id,
       notification_type,
       title,
       message,
       related_entity_type,
       related_entity_id,
       read_at,
       created_at,
       updated_at
     FROM notifications
     WHERE ${conditions.join(' AND ')}
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    values
  );
  return result.rows;
};

const countNotifications = async (
  userId,
  unreadOnly,
  database = getDatabase()
) => {
  const result = await database.query(
    `SELECT COUNT(*)::integer AS total
     FROM notifications
     WHERE user_id = $1
       AND ($2::boolean = false OR read_at IS NULL)`,
    [userId, unreadOnly]
  );
  return result.rows[0]?.total || 0;
};

const countUnread = async (userId, database = getDatabase()) => {
  const result = await database.query(
    `SELECT COUNT(*)::integer AS total
     FROM notifications
     WHERE user_id = $1
       AND read_at IS NULL`,
    [userId]
  );
  return result.rows[0]?.total || 0;
};

const markRead = async (notificationId, userId, database = getDatabase()) => {
  const result = await database.query(
    `UPDATE notifications
     SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
       AND user_id = $2
     RETURNING
       id,
       notification_type,
       title,
       message,
       related_entity_type,
       related_entity_id,
       read_at,
       created_at,
       updated_at`,
    [notificationId, userId]
  );
  return result.rows[0] || null;
};

const markAllRead = async (userId, database = getDatabase()) => {
  const result = await database.query(
    `UPDATE notifications
     SET read_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $1
       AND read_at IS NULL`,
    [userId]
  );
  return result.rowCount;
};

module.exports = {
  createNotification,
  listNotifications,
  countNotifications,
  countUnread,
  markRead,
  markAllRead,
};
