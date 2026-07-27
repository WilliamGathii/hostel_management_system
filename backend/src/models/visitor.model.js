const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

const VISITOR_COLUMNS = `
  v.id,
  v.student_id,
  v.visitor_name,
  v.visitor_phone,
  v.identification_type,
  v.visit_date,
  v.expected_entry_time,
  v.expected_exit_time,
  v.purpose,
  v.approval_status,
  v.approved_by,
  v.created_at,
  v.updated_at,
  sp.student_number,
  student_user.id AS student_user_id,
  student_user.full_name AS student_name,
  approver.full_name AS approved_by_name,
  vv.id AS verification_id,
  vv.verified_by,
  vv.entry_time,
  vv.exit_time,
  vv.verification_status,
  vv.notes AS verification_notes,
  verifier.full_name AS verified_by_name,
  (v.visit_date < CURRENT_DATE) AS visit_is_expired
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

const visitorQuery = (suffix, includeIdentification = false) => `
  SELECT
    ${VISITOR_COLUMNS}
    ${includeIdentification ? ', v.identification_number' : ''}
  FROM visitors v
  INNER JOIN student_profiles sp ON sp.id = v.student_id
  INNER JOIN users student_user ON student_user.id = sp.user_id
  LEFT JOIN users approver ON approver.id = v.approved_by
  LEFT JOIN visitor_verifications vv ON vv.visitor_id = v.id
  LEFT JOIN users verifier ON verifier.id = vv.verified_by
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

const createVisitor = async (data, database = getDatabase()) => {
  const result = await database.query(
    `INSERT INTO visitors (
       student_id, visitor_name, visitor_phone, identification_type,
       identification_number, visit_date, expected_entry_time,
       expected_exit_time, purpose
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      data.student_id,
      data.visitor_name,
      data.visitor_phone,
      data.identification_type,
      data.identification_number,
      data.visit_date,
      data.expected_entry_time,
      data.expected_exit_time,
      data.purpose,
    ]
  );
  return findVisitorById(result.rows[0].id, database);
};

const findVisitorById = async (
  visitorId,
  database = getDatabase(),
  forUpdate = false
) => {
  const result = await database.query(
    visitorQuery(`WHERE v.id = $1 ${forUpdate ? 'FOR UPDATE OF v' : ''}`, true),
    [visitorId]
  );
  return result.rows[0] || null;
};

const buildFilters = ({
  search,
  approvalStatus,
  verificationStatus,
  visitDate,
  ownerUserId,
  securityView,
}) => {
  const values = [];
  const conditions = [];
  const add = (value, column) => {
    values.push(value);
    conditions.push(`${column} = $${values.length}`);
  };

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(
      v.visitor_name ILIKE $${values.length}
      OR student_user.full_name ILIKE $${values.length}
      OR sp.student_number ILIKE $${values.length}
    )`);
  }
  if (approvalStatus) {
    add(approvalStatus, 'v.approval_status');
  }
  if (verificationStatus) {
    add(verificationStatus, 'vv.verification_status');
  }
  if (visitDate) {
    add(visitDate, 'v.visit_date');
  }
  if (ownerUserId) {
    add(ownerUserId, 'sp.user_id');
  }
  if (securityView) {
    conditions.push("v.approval_status = 'approved'");
  }

  return {
    whereClause:
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
  };
};

const listVisitors = async (options, database = getDatabase()) => {
  const { whereClause, values } = buildFilters(options);
  const offset = (options.page - 1) * options.limit;
  const result = await database.query(
    `${visitorQuery(whereClause)}
     ORDER BY v.visit_date DESC, v.expected_entry_time ASC, v.created_at DESC
     LIMIT $${values.length + 1}
     OFFSET $${values.length + 2}`,
    [...values, options.limit, offset]
  );
  return result.rows;
};

const countVisitors = async (options, database = getDatabase()) => {
  const { whereClause, values } = buildFilters(options);
  const result = await database.query(
    `SELECT COUNT(*)::integer AS total
     FROM visitors v
     INNER JOIN student_profiles sp ON sp.id = v.student_id
     INNER JOIN users student_user ON student_user.id = sp.user_id
     LEFT JOIN visitor_verifications vv ON vv.visitor_id = v.id
     ${whereClause}`,
    values
  );
  return result.rows[0]?.total || 0;
};

const updateApproval = async (visitorId, status, adminId, database) => {
  await database.query(
    `UPDATE visitors
     SET approval_status = $1,
         approved_by = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3`,
    [status, adminId, visitorId]
  );
};

const createEntryVerification = async (
  visitorId,
  securityUserId,
  notes,
  database
) => {
  await database.query(
    `INSERT INTO visitor_verifications (
       visitor_id, verified_by, entry_time, verification_status, notes
     )
     VALUES ($1, $2, CURRENT_TIMESTAMP, 'checked_in', $3)`,
    [visitorId, securityUserId, notes]
  );
};

const recordExit = async (visitorId, notes, database) => {
  await database.query(
    `UPDATE visitor_verifications
     SET exit_time = CURRENT_TIMESTAMP,
         verification_status = 'checked_out',
         notes = COALESCE($1, notes),
         updated_at = CURRENT_TIMESTAMP
     WHERE visitor_id = $2`,
    [notes, visitorId]
  );
};

module.exports = {
  withTransaction,
  findStudentByUserId,
  createVisitor,
  findVisitorById,
  listVisitors,
  countVisitors,
  updateApproval,
  createEntryVerification,
  recordExit,
};
