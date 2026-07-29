const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

const ROOM_TYPE_COLUMNS = `
  rt.id,
  rt.code,
  rt.name,
  rt.monthly_rate,
  rt.default_capacity,
  rt.description,
  rt.status,
  rt.created_at,
  rt.updated_at,
  (
    SELECT COUNT(*)::integer
    FROM rooms r
    WHERE r.room_type_id = rt.id
  ) AS rooms_count
`;

const getDatabase = () => {
  if (!pool) {
    throw new AppError('Database is not configured', 503);
  }

  return pool;
};

const findRoomTypeById = async (
  roomTypeId,
  database = getDatabase(),
  forUpdate = false
) => {
  const result = await database.query(
    `SELECT ${ROOM_TYPE_COLUMNS}
     FROM room_types rt
     WHERE rt.id = $1
     ${forUpdate ? 'FOR UPDATE OF rt' : ''}`,
    [roomTypeId]
  );

  return result.rows[0] || null;
};

const listRoomTypes = async (
  { status = '' } = {},
  database = getDatabase()
) => {
  const values = [];
  let whereClause = '';

  if (status) {
    values.push(status);
    whereClause = 'WHERE rt.status = $1';
  }

  const result = await database.query(
    `SELECT ${ROOM_TYPE_COLUMNS}
     FROM room_types rt
     ${whereClause}
     ORDER BY rt.code ASC`,
    values
  );

  return result.rows;
};

const createRoomType = async (data, database = getDatabase()) => {
  const result = await database.query(
    `INSERT INTO room_types (
       code, name, monthly_rate, default_capacity, description, status
     )
     VALUES ($1, $2, $3, $4, $5, 'active')
     RETURNING id`,
    [
      data.code,
      data.name,
      data.monthly_rate,
      data.default_capacity,
      data.description,
    ]
  );

  return findRoomTypeById(result.rows[0].id, database);
};

const updateRoomType = async (roomTypeId, data, database = getDatabase()) => {
  const fields = [
    'name',
    'monthly_rate',
    'default_capacity',
    'description',
  ].filter((field) => Object.hasOwn(data, field));
  const assignments = fields.map((field, index) => `${field} = $${index + 1}`);
  const values = fields.map((field) => data[field]);
  values.push(roomTypeId);

  const result = await database.query(
    `UPDATE room_types
     SET ${assignments.join(', ')},
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $${values.length}
     RETURNING id`,
    values
  );

  return result.rowCount === 0 ? null : findRoomTypeById(roomTypeId, database);
};

const updateRoomTypeStatus = async (
  roomTypeId,
  status,
  database = getDatabase()
) => {
  const result = await database.query(
    `UPDATE room_types
     SET status = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id`,
    [status, roomTypeId]
  );

  return result.rowCount === 0 ? null : findRoomTypeById(roomTypeId, database);
};

module.exports = {
  createRoomType,
  findRoomTypeById,
  listRoomTypes,
  updateRoomType,
  updateRoomTypeStatus,
};
