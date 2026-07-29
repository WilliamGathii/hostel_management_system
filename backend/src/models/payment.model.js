const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

const PAYMENT_COLUMNS = `
  p.id,
  p.student_id,
  p.room_allocation_id,
  p.amount,
  p.payment_method,
  p.transaction_reference,
  p.payment_date,
  p.payment_status,
  p.recorded_by,
  p.notes,
  p.created_at,
  p.updated_at,
  sp.student_number,
  student_user.id AS student_user_id,
  student_user.full_name AS student_name,
  student_user.email AS student_email,
  r.room_number,
  recorder.full_name AS recorded_by_name
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

const paymentQuery = (suffix = '') => `
  SELECT ${PAYMENT_COLUMNS}
  FROM payments p
  INNER JOIN student_profiles sp ON sp.id = p.student_id
  INNER JOIN users student_user ON student_user.id = sp.user_id
  LEFT JOIN room_allocations ra ON ra.id = p.room_allocation_id
  LEFT JOIN rooms r ON r.id = ra.room_id
  INNER JOIN users recorder ON recorder.id = p.recorded_by
  ${suffix}
`;

const findStudentByUserId = async (userId, database = getDatabase()) => {
  const result = await database.query(
    `SELECT sp.id, sp.user_id, sp.student_number, u.full_name, u.account_status
     FROM student_profiles sp
     INNER JOIN users u ON u.id = sp.user_id
     WHERE sp.user_id = $1
       AND u.role = 'student'`,
    [userId]
  );
  return result.rows[0] || null;
};

const findAllocationById = async (allocationId, database = getDatabase()) => {
  const result = await database.query(
    `SELECT ra.id, ra.student_id, ra.room_id, ra.allocation_status,
            sp.user_id AS student_user_id, r.room_number
     FROM room_allocations ra
     INNER JOIN student_profiles sp ON sp.id = ra.student_id
     INNER JOIN rooms r ON r.id = ra.room_id
     WHERE ra.id = $1`,
    [allocationId]
  );
  return result.rows[0] || null;
};

const findPaymentById = async (
  paymentId,
  database = getDatabase(),
  forUpdate = false
) => {
  const result = await database.query(
    paymentQuery(`WHERE p.id = $1 ${forUpdate ? 'FOR UPDATE OF p' : ''}`),
    [paymentId]
  );
  return result.rows[0] || null;
};

const buildFilters = ({
  search,
  status,
  studentId,
  roomId,
  dateFrom,
  dateTo,
  studentUserId,
}) => {
  const values = [];
  const conditions = [];
  const add = (value, condition) => {
    values.push(value);
    conditions.push(condition(values.length));
  };

  if (studentUserId) {
    add(studentUserId, (position) => `sp.user_id = $${position}`);
  }
  if (search) {
    add(
      `%${search}%`,
      (position) =>
        `(student_user.full_name ILIKE $${position} OR sp.student_number ILIKE $${position} OR p.transaction_reference ILIKE $${position})`
    );
  }
  if (status) {
    add(status, (position) => `p.payment_status = $${position}`);
  }
  if (studentId) {
    add(studentId, (position) => `p.student_id = $${position}`);
  }
  if (roomId) {
    add(roomId, (position) => `ra.room_id = $${position}`);
  }
  if (dateFrom) {
    add(dateFrom, (position) => `p.payment_date >= $${position}`);
  }
  if (dateTo) {
    add(dateTo, (position) => `p.payment_date <= $${position}`);
  }

  return {
    whereClause:
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
  };
};

const listPayments = async (options, database = getDatabase()) => {
  const { whereClause, values } = buildFilters(options);
  const offset = (options.page - 1) * options.limit;
  const result = await database.query(
    `${paymentQuery(whereClause)}
     ORDER BY p.payment_date DESC, p.created_at DESC
     LIMIT $${values.length + 1}
     OFFSET $${values.length + 2}`,
    [...values, options.limit, offset]
  );
  return result.rows;
};

const countPayments = async (options, database = getDatabase()) => {
  const { whereClause, values } = buildFilters(options);
  const result = await database.query(
    `SELECT COUNT(*)::integer AS total
     FROM payments p
     INNER JOIN student_profiles sp ON sp.id = p.student_id
     INNER JOIN users student_user ON student_user.id = sp.user_id
     LEFT JOIN room_allocations ra ON ra.id = p.room_allocation_id
     ${whereClause}`,
    values
  );
  return result.rows[0]?.total || 0;
};

const createPayment = async (data, database = getDatabase()) => {
  const result = await database.query(
    `INSERT INTO payments (
       student_id, room_allocation_id, amount, payment_method,
       transaction_reference, payment_date, payment_status,
       recorded_by, notes
     )
     VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8)
     RETURNING id`,
    [
      data.student_id,
      data.room_allocation_id,
      data.amount,
      data.payment_method,
      data.transaction_reference,
      data.payment_date,
      data.recorded_by,
      data.notes,
    ]
  );
  return findPaymentById(result.rows[0].id, database);
};

const updatePaymentStatus = async (paymentId, status, notes, database) => {
  await database.query(
    `UPDATE payments
     SET payment_status = $1,
         notes = COALESCE($2::text, notes),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3`,
    [status, notes, paymentId]
  );
  return findPaymentById(paymentId, database);
};

module.exports = {
  withTransaction,
  findStudentByUserId,
  findAllocationById,
  findPaymentById,
  listPayments,
  countPayments,
  createPayment,
  updatePaymentStatus,
};
