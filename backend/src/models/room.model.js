const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

const ACTIVE_OCCUPANCY = `(
  SELECT COUNT(*)::integer
  FROM room_allocations active_ra
  WHERE active_ra.room_id = r.id
    AND active_ra.allocation_status = 'active'
)`;

const ROOM_COLUMNS = `
  r.id,
  r.room_type_id,
  r.floor_number,
  r.room_number,
  r.room_code,
  r.capacity,
  r.operational_status,
  r.description,
  r.created_at,
  r.updated_at,
  rt.code AS room_type_code,
  rt.name AS room_type_name,
  rt.name AS room_type,
  rt.monthly_rate,
  rt.status AS room_type_status,
  ${ACTIVE_OCCUPANCY} AS current_occupancy,
  CASE
    WHEN r.operational_status = 'under_maintenance' THEN 'under_maintenance'
    WHEN r.operational_status = 'inactive' THEN 'inactive'
    WHEN ${ACTIVE_OCCUPANCY} = 0 THEN 'available'
    WHEN ${ACTIVE_OCCUPANCY} >= r.capacity THEN 'full'
    ELSE 'partially_occupied'
  END AS occupancy_status
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
  ra.monthly_rate_at_allocation,
  ra.notes,
  ra.created_at,
  ra.updated_at,
  sp.student_number,
  u.id AS student_user_id,
  u.full_name AS student_name,
  u.email AS student_email,
  r.room_code,
  r.room_code AS room_number,
  r.room_number AS room_sequence_number,
  r.room_type_id,
  r.floor_number,
  r.floor_number::text AS floor,
  r.capacity,
  r.operational_status,
  r.operational_status AS room_status,
  rt.code AS room_type_code,
  rt.name AS room_type_name,
  rt.name AS room_type,
  rt.monthly_rate AS current_monthly_rate,
  rt.status AS room_type_status,
  ${ACTIVE_OCCUPANCY} AS current_occupancy,
  CASE
    WHEN r.operational_status = 'under_maintenance' THEN 'under_maintenance'
    WHEN r.operational_status = 'inactive' THEN 'inactive'
    WHEN ${ACTIVE_OCCUPANCY} = 0 THEN 'available'
    WHEN ${ACTIVE_OCCUPANCY} >= r.capacity THEN 'full'
    ELSE 'partially_occupied'
  END AS occupancy_status,
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

const roomQuery = (suffix = '') => `
  SELECT ${ROOM_COLUMNS}
  FROM rooms r
  INNER JOIN room_types rt ON rt.id = r.room_type_id
  ${suffix}
`;

const findRoomById = async (roomId, database = getDatabase()) => {
  const result = await database.query(roomQuery('WHERE r.id = $1'), [roomId]);
  return result.rows[0] || null;
};

const lockRoomById = async (roomId, database) => {
  const result = await database.query(
    roomQuery('WHERE r.id = $1 FOR UPDATE OF r'),
    [roomId]
  );
  return result.rows[0] || null;
};

const buildRoomFilters = ({
  search,
  floor,
  roomTypeId,
  roomTypeCode,
  operationalStatus,
  occupancyStatus,
}) => {
  const values = [];
  const conditions = [];
  const add = (value, condition) => {
    values.push(value);
    conditions.push(condition(values.length));
  };

  if (search) {
    add(
      `%${search}%`,
      (position) =>
        `(r.room_code ILIKE $${position} OR rt.name ILIKE $${position})`
    );
  }
  if (floor) {
    add(floor, (position) => `r.floor_number = $${position}`);
  }
  if (roomTypeId) {
    add(roomTypeId, (position) => `r.room_type_id = $${position}`);
  }
  if (roomTypeCode) {
    add(roomTypeCode, (position) => `rt.code = $${position}`);
  }
  if (operationalStatus) {
    add(operationalStatus, (position) => `r.operational_status = $${position}`);
  }
  if (occupancyStatus) {
    const occupancyConditions = {
      available: `${ACTIVE_OCCUPANCY} = 0 AND r.operational_status = 'active'`,
      partially_occupied: `${ACTIVE_OCCUPANCY} > 0 AND ${ACTIVE_OCCUPANCY} < r.capacity AND r.operational_status = 'active'`,
      full: `${ACTIVE_OCCUPANCY} >= r.capacity AND r.operational_status = 'active'`,
      under_maintenance: "r.operational_status = 'under_maintenance'",
      inactive: "r.operational_status = 'inactive'",
    };
    conditions.push(occupancyConditions[occupancyStatus]);
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
  const result = await database.query(
    `${roomQuery(whereClause)}
     ORDER BY r.floor_number ASC, rt.code ASC, r.room_number ASC
     LIMIT $${values.length + 1}
     OFFSET $${values.length + 2}`,
    [...values, options.limit, offset]
  );

  return result.rows;
};

const countRooms = async (options, database = getDatabase()) => {
  const { whereClause, values } = buildRoomFilters(options);
  const result = await database.query(
    `SELECT COUNT(*)::integer AS total
     FROM rooms r
     INNER JOIN room_types rt ON rt.id = r.room_type_id
     ${whereClause}`,
    values
  );

  return result.rows[0]?.total || 0;
};

const createRoom = async (roomData, database = getDatabase()) => {
  const result = await database.query(
    `INSERT INTO rooms (
       room_type_id, floor_number, room_number, room_code, capacity,
       operational_status, description
     )
     VALUES ($1, $2, $3, $4, $5, 'active', $6)
     RETURNING id`,
    [
      roomData.room_type_id,
      roomData.floor_number,
      roomData.room_number,
      roomData.room_code,
      roomData.capacity,
      roomData.description,
    ]
  );

  return findRoomById(result.rows[0].id, database);
};

const findRoomConflicts = async (
  roomTypeId,
  floorNumber,
  generatedRooms,
  database
) => {
  const roomCodes = generatedRooms.map((room) => room.roomCode);
  const roomNumbers = generatedRooms.map((room) => room.roomNumber);
  const result = await database.query(
    `SELECT room_code
     FROM rooms
     WHERE room_code = ANY($1::text[])
        OR (
          room_type_id = $2
          AND floor_number = $3
          AND room_number = ANY($4::integer[])
        )
     ORDER BY room_code ASC`,
    [roomCodes, roomTypeId, floorNumber, roomNumbers]
  );

  return result.rows.map((room) => room.room_code);
};

const createRooms = async (rooms, database) => {
  const values = [];
  const placeholders = rooms.map((room, index) => {
    const offset = index * 6;
    values.push(
      room.room_type_id,
      room.floor_number,
      room.room_number,
      room.room_code,
      room.capacity,
      room.description
    );
    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, 'active', $${offset + 6})`;
  });
  const result = await database.query(
    `INSERT INTO rooms (
       room_type_id, floor_number, room_number, room_code, capacity,
       operational_status, description
     )
     VALUES ${placeholders.join(', ')}
     RETURNING id, room_code`,
    values
  );

  return result.rows;
};

const updateRoom = async (roomId, roomData, database = getDatabase()) => {
  const fields = ['capacity', 'description'].filter((field) =>
    Object.hasOwn(roomData, field)
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
     SET operational_status = $1,
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

const allocationQuery = (suffix = '') => `
  SELECT ${ALLOCATION_COLUMNS}
  FROM room_allocations ra
  INNER JOIN student_profiles sp ON sp.id = ra.student_id
  INNER JOIN users u ON u.id = sp.user_id
  INNER JOIN rooms r ON r.id = ra.room_id
  INNER JOIN room_types rt ON rt.id = r.room_type_id
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
      `(u.full_name ILIKE $${values.length} OR sp.student_number ILIKE $${values.length} OR r.room_code ILIKE $${values.length})`
    );
  }

  [
    [status, 'ra.allocation_status'],
    [roomId, 'ra.room_id'],
    [studentId, 'ra.student_id'],
  ].forEach(([value, column]) => {
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
     INNER JOIN room_types rt ON rt.id = r.room_type_id
     ${whereClause}`,
    values
  );

  return result.rows[0]?.total || 0;
};

const insertAllocation = async (data, database) => {
  const result = await database.query(
    `INSERT INTO room_allocations (
       student_id, room_id, allocated_by, start_date, expected_end_date,
       allocation_status, monthly_rate_at_allocation, notes
     )
     VALUES ($1, $2, $3, $4, $5, 'active', $6, $7)
     RETURNING id`,
    [
      data.student_id,
      data.room_id,
      data.allocated_by,
      data.start_date,
      data.expected_end_date,
      data.monthly_rate_at_allocation,
      data.notes,
    ]
  );

  return result.rows[0].id;
};

const updateAllocationRecord = async (allocationId, data, database) => {
  const fields = [
    'room_id',
    'expected_end_date',
    'monthly_rate_at_allocation',
    'notes',
  ].filter((field) => Object.hasOwn(data, field));
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

module.exports = {
  countAllocations,
  countRooms,
  createRoom,
  createRooms,
  findActiveAllocationByStudent,
  findAllocationById,
  findCurrentAllocationByUser,
  findRoomById,
  findRoomConflicts,
  findStudentById,
  findStudentByUserId,
  finishAllocation,
  insertAllocation,
  listAllocations,
  listRooms,
  lockRoomById,
  updateAllocationRecord,
  updateRoom,
  updateRoomStatus,
  withTransaction,
};
