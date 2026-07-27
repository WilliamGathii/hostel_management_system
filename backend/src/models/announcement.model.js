const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

const ANNOUNCEMENT_COLUMNS = `
  a.id,
  a.title,
  a.message,
  a.created_by,
  a.target_role,
  a.published_at,
  a.expires_at,
  a.status,
  a.created_at,
  a.updated_at,
  creator.full_name AS created_by_name
`;

const getDatabase = () => {
  if (!pool) {
    throw new AppError('Database is not configured', 503);
  }
  return pool;
};

const withTransaction = async (operation, database = getDatabase()) => {
  const client = await database.connect();
  try {
    await client.query('BEGIN');
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const findAnnouncementById = async (
  announcementId,
  database = getDatabase(),
  forUpdate = false
) => {
  const result = await database.query(
    `SELECT ${ANNOUNCEMENT_COLUMNS}
     FROM announcements a
     INNER JOIN users creator ON creator.id = a.created_by
     WHERE a.id = $1
     ${forUpdate ? 'FOR UPDATE OF a' : ''}`,
    [announcementId]
  );
  return result.rows[0] || null;
};

const buildFilters = ({ search, status, role, isAdmin }) => {
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(a.title ILIKE $${values.length} OR a.message ILIKE $${values.length})`
    );
  }

  if (isAdmin) {
    if (status) {
      values.push(status);
      conditions.push(`a.status = $${values.length}`);
    }
  } else {
    values.push(role);
    conditions.push("a.status = 'published'");
    conditions.push('a.published_at <= CURRENT_TIMESTAMP');
    conditions.push(
      '(a.expires_at IS NULL OR a.expires_at > CURRENT_TIMESTAMP)'
    );
    conditions.push(
      `(a.target_role IS NULL OR a.target_role = $${values.length})`
    );
  }

  return {
    whereClause:
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
  };
};

const listAnnouncements = async (options, database = getDatabase()) => {
  const { whereClause, values } = buildFilters(options);
  const offset = (options.page - 1) * options.limit;
  const result = await database.query(
    `SELECT ${ANNOUNCEMENT_COLUMNS}
     FROM announcements a
     INNER JOIN users creator ON creator.id = a.created_by
     ${whereClause}
     ORDER BY COALESCE(a.published_at, a.created_at) DESC
     LIMIT $${values.length + 1}
     OFFSET $${values.length + 2}`,
    [...values, options.limit, offset]
  );
  return result.rows;
};

const countAnnouncements = async (options, database = getDatabase()) => {
  const { whereClause, values } = buildFilters(options);
  const result = await database.query(
    `SELECT COUNT(*)::integer AS total
     FROM announcements a
     ${whereClause}`,
    values
  );
  return result.rows[0]?.total || 0;
};

const createAnnouncement = async (data, database) => {
  const result = await database.query(
    `INSERT INTO announcements (
       title, message, created_by, target_role,
       published_at, expires_at, status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      data.title,
      data.message,
      data.created_by,
      data.target_role,
      data.published_at,
      data.expires_at,
      data.status,
    ]
  );
  return result.rows[0].id;
};

const updateAnnouncement = async (announcementId, data, database) => {
  const fields = [
    'title',
    'message',
    'target_role',
    'published_at',
    'expires_at',
    'status',
  ].filter((field) => Object.hasOwn(data, field));
  const assignments = fields.map((field, index) => `${field} = $${index + 1}`);
  const values = fields.map((field) => data[field]);
  values.push(announcementId);

  await database.query(
    `UPDATE announcements
     SET ${assignments.join(', ')},
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $${values.length}`,
    values
  );
};

const createRecipientsAndNotifications = async (announcement, database) => {
  const result = await database.query(
    `WITH new_recipients AS (
       INSERT INTO announcement_recipients (announcement_id, user_id)
       SELECT $1, u.id
       FROM users u
       WHERE u.account_status = 'active'
         AND ($2::varchar IS NULL OR u.role = $2)
       ON CONFLICT (announcement_id, user_id) DO NOTHING
       RETURNING user_id
     )
     INSERT INTO notifications (
       user_id, notification_type, title, message,
       related_entity_type, related_entity_id
     )
     SELECT
       user_id,
       'announcement',
       $3,
       $4,
       'announcement',
       $1
     FROM new_recipients`,
    [
      announcement.id,
      announcement.target_role,
      announcement.title,
      announcement.message,
    ]
  );
  return result.rowCount;
};

const deleteAnnouncement = async (announcementId, database = getDatabase()) => {
  const result = await database.query(
    `DELETE FROM announcements
     WHERE id = $1
     RETURNING id`,
    [announcementId]
  );
  return result.rows[0] || null;
};

module.exports = {
  withTransaction,
  findAnnouncementById,
  listAnnouncements,
  countAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  createRecipientsAndNotifications,
  deleteAnnouncement,
};
