const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

const REQUEST_COLUMNS = `
  mr.id,
  mr.student_id,
  mr.room_id,
  mr.assigned_staff_id,
  mr.title,
  mr.description,
  mr.priority,
  mr.status,
  mr.submitted_at,
  mr.completed_at,
  mr.created_at,
  mr.updated_at,
  sp.student_number,
  student_user.id AS student_user_id,
  student_user.full_name AS student_name,
  student_user.email AS student_email,
  r.room_number,
  staff.full_name AS assigned_staff_name
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

const requestQuery = (suffix) => `
  SELECT ${REQUEST_COLUMNS}
  FROM maintenance_requests mr
  INNER JOIN student_profiles sp ON sp.id = mr.student_id
  INNER JOIN users student_user ON student_user.id = sp.user_id
  INNER JOIN rooms r ON r.id = mr.room_id
  LEFT JOIN users staff ON staff.id = mr.assigned_staff_id
  ${suffix}
`;

const findStudentByUserId = async (userId, database = getDatabase()) => {
  const result = await database.query(
    `SELECT sp.id, sp.user_id
     FROM student_profiles sp
     INNER JOIN users u ON u.id = sp.user_id
     WHERE sp.user_id = $1
       AND u.role = 'student'
       AND u.account_status = 'active'`,
    [userId]
  );
  return result.rows[0] || null;
};

const findActiveAllocation = async (
  studentId,
  roomId,
  database = getDatabase()
) => {
  const result = await database.query(
    `SELECT id
     FROM room_allocations
     WHERE student_id = $1
       AND room_id = $2
       AND allocation_status = 'active'`,
    [studentId, roomId]
  );
  return result.rows[0] || null;
};

const findMaintenanceStaff = async (userId, database = getDatabase()) => {
  const result = await database.query(
    `SELECT id, full_name, email
     FROM users
     WHERE id = $1
       AND role = 'maintenance_staff'
       AND account_status = 'active'`,
    [userId]
  );
  return result.rows[0] || null;
};

const listMaintenanceStaff = async (database = getDatabase()) => {
  const result = await database.query(
    `SELECT id, full_name, email
     FROM users
     WHERE role = 'maintenance_staff'
       AND account_status = 'active'
     ORDER BY full_name ASC`
  );
  return result.rows;
};

const createRequest = async (data, database = getDatabase()) => {
  const result = await database.query(
    `INSERT INTO maintenance_requests (
       student_id, room_id, title, description, priority
     )
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [data.student_id, data.room_id, data.title, data.description, data.priority]
  );
  return findRequestById(result.rows[0].id, database);
};

const findRequestById = async (
  requestId,
  database = getDatabase(),
  forUpdate = false
) => {
  const result = await database.query(
    requestQuery(`WHERE mr.id = $1 ${forUpdate ? 'FOR UPDATE OF mr' : ''}`),
    [requestId]
  );
  return result.rows[0] || null;
};

const buildFilters = ({
  search,
  status,
  priority,
  roomId,
  studentId,
  assignedStaffId,
  ownerUserId,
}) => {
  const values = [];
  const conditions = [];
  const add = (value, condition) => {
    values.push(value);
    conditions.push(condition(values.length));
  };

  if (search) {
    add(`%${search}%`, (index) =>
      [
        `(mr.title ILIKE $${index}`,
        `student_user.full_name ILIKE $${index}`,
        `r.room_number ILIKE $${index})`,
      ].join(' OR ')
    );
  }
  if (status) {
    add(status, (index) => `mr.status = $${index}`);
  }
  if (priority) {
    add(priority, (index) => `mr.priority = $${index}`);
  }
  if (roomId) {
    add(roomId, (index) => `mr.room_id = $${index}`);
  }
  if (studentId) {
    add(studentId, (index) => `mr.student_id = $${index}`);
  }
  if (assignedStaffId) {
    add(assignedStaffId, (index) => `mr.assigned_staff_id = $${index}`);
  }
  if (ownerUserId) {
    add(ownerUserId, (index) => `sp.user_id = $${index}`);
  }

  return {
    whereClause:
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
  };
};

const listRequests = async (options, database = getDatabase()) => {
  const { whereClause, values } = buildFilters(options);
  const offset = (options.page - 1) * options.limit;
  const result = await database.query(
    `${requestQuery(whereClause)}
     ORDER BY
       CASE mr.priority
         WHEN 'urgent' THEN 1
         WHEN 'high' THEN 2
         WHEN 'medium' THEN 3
         ELSE 4
       END,
       mr.submitted_at DESC
     LIMIT $${values.length + 1}
     OFFSET $${values.length + 2}`,
    [...values, options.limit, offset]
  );
  return result.rows;
};

const countRequests = async (options, database = getDatabase()) => {
  const { whereClause, values } = buildFilters(options);
  const result = await database.query(
    `SELECT COUNT(*)::integer AS total
     FROM maintenance_requests mr
     INNER JOIN student_profiles sp ON sp.id = mr.student_id
     INNER JOIN users student_user ON student_user.id = sp.user_id
     INNER JOIN rooms r ON r.id = mr.room_id
     ${whereClause}`,
    values
  );
  return result.rows[0]?.total || 0;
};

const listUpdates = async (requestId, database = getDatabase()) => {
  const result = await database.query(
    `SELECT
       mu.id,
       mu.maintenance_request_id,
       mu.updated_by,
       mu.status,
       mu.note,
       mu.created_at,
       u.full_name AS updated_by_name,
       u.role AS updated_by_role
     FROM maintenance_updates mu
     INNER JOIN users u ON u.id = mu.updated_by
     WHERE mu.maintenance_request_id = $1
     ORDER BY mu.created_at ASC`,
    [requestId]
  );
  return result.rows;
};

const assignRequest = async (requestId, staffId, userId, database) => {
  await database.query(
    `UPDATE maintenance_requests
     SET assigned_staff_id = $1,
         status = 'assigned',
         completed_at = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [staffId, requestId]
  );
  await insertUpdate(
    {
      request_id: requestId,
      updated_by: userId,
      status: 'assigned',
      note: 'Request assigned to Maintenance Staff.',
    },
    database
  );
};

const updateRequestStatus = async (
  requestId,
  status,
  userId,
  note,
  database
) => {
  await database.query(
    `UPDATE maintenance_requests
     SET status = $1::varchar,
         completed_at = CASE
           WHEN $1::varchar = 'completed' THEN CURRENT_TIMESTAMP
           ELSE NULL
         END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [status, requestId]
  );
  await insertUpdate(
    {
      request_id: requestId,
      updated_by: userId,
      status,
      note,
    },
    database
  );
};

const insertUpdate = async (data, database) => {
  const result = await database.query(
    `INSERT INTO maintenance_updates (
       maintenance_request_id, updated_by, status, note
     )
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [data.request_id, data.updated_by, data.status, data.note]
  );
  return result.rows[0].id;
};

module.exports = {
  withTransaction,
  findStudentByUserId,
  findActiveAllocation,
  findMaintenanceStaff,
  listMaintenanceStaff,
  createRequest,
  findRequestById,
  listRequests,
  countRequests,
  listUpdates,
  assignRequest,
  updateRequestStatus,
  insertUpdate,
};
