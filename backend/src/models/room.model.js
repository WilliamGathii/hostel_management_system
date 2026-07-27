const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

const ROOM_COLUMNS = `
  r.id,
  r.room_number,
  r.room_type,
  r.capacity,
  r.current_occupancy,
  r.status,
  r.floor,
  r.description,
  r.created_at,
  r.updated_at
`;

const ALLOCATION_COLUMNS = `
  ra.id,
  ra.student_id,
  ra.room_id,
  ra.allocated_by,
  ra.start_date,
  ra.expected_end_date,
  ra.actual_end_date,
  ra.allocation_status,
  ra.notes,
  ra.created_at,
  ra.updated_at,
  sp.student_number,
  u.id AS student_user_id,
  u.full_name AS student_name,
  u.email AS student_email,
  r.room_number,
  r.room_type,
  r.capacity,
  r.current_occupancy,
  r.status AS room_status,
  r.floor,
  allocator.full_name AS allocated_by_name
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

const findRoomById = async (roomId, database = getDatabase()) => {
  const result = await database.query(
    `SELECT ${ROOM_COLUMNS}
     FROM rooms r
     WHERE r.id = $1`,
    [roomId]
  );

  return result.rows[0] || null;
};

const lockRoomById = async (roomId, database) => {
  const result = await database.query(
    `SELECT ${ROOM_COLUMNS}
     FROM rooms r
     WHERE r.id = $1
     FOR UPDATE`,
    [roomId]
  );

  return result.rows[0] || null;
};

const buildRoomFilters = ({ search, status }) => {
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(r.room_number ILIKE $${values.length} OR r.room_type ILIKE $${values.length} OR r.floor ILIKE $${values.length})`
    );
  }

  if (status) {
    values.push(status);
    conditions.push(`r.status = $${values.length}`);
  }

  return {
    whereClause:
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
  };
};

const listRooms = async (options, database = getDatabase()) => {
  const { whereClause, values } = buildRoomFilters(options);
  const offset = (options.page - 1) * options.limit;
  const queryValues = [...values, options.limit, offset];

  const result = await database.query(
    `SELECT ${ROOM_COLUMNS}
     FROM rooms r
     ${whereClause}
     ORDER BY r.room_number ASC
     LIMIT $${values.length + 1}
     OFFSET $${values.length + 2}`,
    queryValues
  );

  return result.rows;
};

const countRooms = async (options, database = getDatabase()) => {
  const { whereClause, values } = buildRoomFilters(options);
  const result = await database.query(
    `SELECT COUNT(*)::integer AS total
     FROM rooms r
     ${whereClause}`,
    values
  );

  return result.rows[0]?.total || 0;
};

const createRoom = async (roomData, database = getDatabase()) => {
  const result = await database.query(
    `INSERT INTO rooms (
       room_number, room_type, capacity, floor, description
     )
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      roomData.room_number,
      roomData.room_type,
      roomData.capacity,
      roomData.floor,
      roomData.description,
    ]
  );

  return findRoomById(result.rows[0].id, database);
};

const updateRoom = async (roomId, roomData, database = getDatabase()) => {
  const fields = ['room_type', 'capacity', 'floor', 'description'].filter(
    (field) => Object.hasOwn(roomData, field)
  );
  const assignments = fields.map((field, index) => `${field} = $${index + 1}`);
  const values = fields.map((field) => roomData[field]);
  values.push(roomId);

  const result = await database.query(
    `UPDATE rooms
     SET ${assignments.join(', ')},
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $${values.length}
     RETURNING id`,
    values
  );

  return result.rowCount === 0 ? null : findRoomById(roomId, database);
};

const updateRoomStatus = async (roomId, status, database = getDatabase()) => {
  const result = await database.query(
    `UPDATE rooms
     SET status = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id`,
    [status, roomId]
  );

  return result.rowCount === 0 ? null : findRoomById(roomId, database);
};

const findStudentById = async (studentId, database = getDatabase()) => {
  const result = await database.query(
    `SELECT sp.id, sp.user_id, u.full_name, u.account_status
     FROM student_profiles sp
     INNER JOIN users u ON u.id = sp.user_id
     WHERE sp.id = $1
       AND u.role = 'student'`,
    [studentId]
  );

  return result.rows[0] || null;
};

const findStudentByUserId = async (userId, database = getDatabase()) => {
  const result = await database.query(
    `SELECT sp.id, sp.user_id, u.full_name, u.account_status
     FROM student_profiles sp
     INNER JOIN users u ON u.id = sp.user_id
     WHERE sp.user_id = $1
       AND u.role = 'student'`,
    [userId]
  );

  return result.rows[0] || null;
};

const allocationQuery = (suffix) => `
  SELECT ${ALLOCATION_COLUMNS}
  FROM room_allocations ra
  INNER JOIN student_profiles sp ON sp.id = ra.student_id
  INNER JOIN users u ON u.id = sp.user_id
  INNER JOIN rooms r ON r.id = ra.room_id
  INNER JOIN users allocator ON allocator.id = ra.allocated_by
  ${suffix}
`;

const findAllocationById = async (
  allocationId,
  database = getDatabase(),
  forUpdate = false
) => {
  const result = await database.query(
    allocationQuery(`WHERE ra.id = $1 ${forUpdate ? 'FOR UPDATE OF ra' : ''}`),
    [allocationId]
  );

  return result.rows[0] || null;
};

const findActiveAllocationByStudent = async (
  studentId,
  database = getDatabase()
) => {
  const result = await database.query(
    allocationQuery(
      `WHERE ra.student_id = $1 AND ra.allocation_status = 'active'`
    ),
    [studentId]
  );

  return result.rows[0] || null;
};

const findCurrentAllocationByUser = async (
  userId,
  database = getDatabase()
) => {
  const result = await database.query(
    allocationQuery(
      `WHERE sp.user_id = $1 AND ra.allocation_status = 'active'`
    ),
    [userId]
  );

  return result.rows[0] || null;
};

const buildAllocationFilters = ({ search, status, roomId, studentId }) => {
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(u.full_name ILIKE $${values.length} OR sp.student_number ILIKE $${values.length} OR r.room_number ILIKE $${values.length})`
    );
  }

  [
    ['status', status, 'ra.allocation_status'],
    ['roomId', roomId, 'ra.room_id'],
    ['studentId', studentId, 'ra.student_id'],
  ].forEach(([, value, column]) => {
    if (value) {
      values.push(value);
      conditions.push(`${column} = $${values.length}`);
    }
  });

  return {
    whereClause:
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
  };
};

const listAllocations = async (options, database = getDatabase()) => {
  const { whereClause, values } = buildAllocationFilters(options);
  const offset = (options.page - 1) * options.limit;
  const result = await database.query(
    `${allocationQuery(whereClause)}
     ORDER BY ra.created_at DESC
     LIMIT $${values.length + 1}
     OFFSET $${values.length + 2}`,
    [...values, options.limit, offset]
  );

  return result.rows;
};

const countAllocations = async (options, database = getDatabase()) => {
  const { whereClause, values } = buildAllocationFilters(options);
  const result = await database.query(
    `SELECT COUNT(*)::integer AS total
     FROM room_allocations ra
     INNER JOIN student_profiles sp ON sp.id = ra.student_id
     INNER JOIN users u ON u.id = sp.user_id
     INNER JOIN rooms r ON r.id = ra.room_id
     ${whereClause}`,
    values
  );

  return result.rows[0]?.total || 0;
};

const insertAllocation = async (data, database) => {
  const result = await database.query(
    `INSERT INTO room_allocations (
       student_id, room_id, allocated_by, start_date, expected_end_date,
       allocation_status, notes
     )
     VALUES ($1, $2, $3, $4, $5, 'active', $6)
     RETURNING id`,
    [
      data.student_id,
      data.room_id,
      data.allocated_by,
      data.start_date,
      data.expected_end_date,
      data.notes,
    ]
  );

  return result.rows[0].id;
};

const updateAllocationRecord = async (allocationId, data, database) => {
  const fields = ['room_id', 'expected_end_date', 'notes'].filter((field) =>
    Object.hasOwn(data, field)
  );
  const assignments = fields.map((field, index) => `${field} = $${index + 1}`);
  const values = fields.map((field) => data[field]);
  values.push(allocationId);

  await database.query(
    `UPDATE room_allocations
     SET ${assignments.join(', ')},
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $${values.length}`,
    values
  );
};

const finishAllocation = async (allocationId, data, database) => {
  await database.query(
    `UPDATE room_allocations
     SET allocation_status = $1,
         actual_end_date = $2,
         notes = COALESCE($3, notes),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $4`,
    [data.allocation_status, data.actual_end_date, data.notes, allocationId]
  );
};

const adjustRoomOccupancy = async (roomId, change, database) => {
  await database.query(
    `UPDATE rooms
     SET current_occupancy = current_occupancy + $1,
         status = CASE
           WHEN status IN ('under_maintenance', 'inactive') THEN status
           WHEN current_occupancy + $1 = 0 THEN 'available'
           WHEN current_occupancy + $1 >= capacity THEN 'full'
           ELSE 'occupied'
         END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [change, roomId]
  );
};

module.exports = {
  withTransaction,
  findRoomById,
  lockRoomById,
  listRooms,
  countRooms,
  createRoom,
  updateRoom,
  updateRoomStatus,
  findStudentById,
  findStudentByUserId,
  findAllocationById,
  findActiveAllocationByStudent,
  findCurrentAllocationByUser,
  listAllocations,
  countAllocations,
  insertAllocation,
  updateAllocationRecord,
  finishAllocation,
  adjustRoomOccupancy,
};
