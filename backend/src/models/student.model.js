const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

const SAFE_STUDENT_COLUMNS = `
  sp.id,
  sp.user_id,
  sp.student_number,
  sp.course,
  sp.year_of_study,
  sp.emergency_contact_name,
  sp.emergency_contact_phone,
  sp.created_at AS profile_created_at,
  sp.updated_at AS profile_updated_at,
  u.full_name,
  u.email,
  u.phone,
  u.role,
  u.account_status,
  u.last_login_at,
  u.created_at AS account_created_at,
  u.updated_at AS account_updated_at
`;

const getDatabase = () => {
  if (!pool) {
    throw new AppError('Database is not configured', 503);
  }

  return pool;
};

const findStudentByUserId = async (userId, database = getDatabase()) => {
  const result = await database.query(
    `SELECT ${SAFE_STUDENT_COLUMNS}
     FROM student_profiles sp
     INNER JOIN users u ON u.id = sp.user_id
     WHERE sp.user_id = $1
       AND u.role = 'student'`,
    [userId]
  );

  return result.rows[0] || null;
};

const findStudentById = async (studentId, database = getDatabase()) => {
  const result = await database.query(
    `SELECT ${SAFE_STUDENT_COLUMNS}
     FROM student_profiles sp
     INNER JOIN users u ON u.id = sp.user_id
     WHERE sp.id = $1
       AND u.role = 'student'`,
    [studentId]
  );

  return result.rows[0] || null;
};

const buildStudentFilters = ({ search, status }) => {
  const values = [];
  const conditions = ["u.role = 'student'"];

  if (search) {
    values.push(`%${search}%`);
    const searchParameter = `$${values.length}`;

    conditions.push(`(
      u.full_name ILIKE ${searchParameter}
      OR u.email ILIKE ${searchParameter}
      OR sp.student_number ILIKE ${searchParameter}
    )`);
  }

  if (status) {
    values.push(status);
    conditions.push(`u.account_status = $${values.length}`);
  }

  return {
    whereClause: conditions.join(' AND '),
    values,
  };
};

const listStudents = async (
  { page, limit, search, status },
  database = getDatabase()
) => {
  const { whereClause, values } = buildStudentFilters({ search, status });
  const offset = (page - 1) * limit;
  const queryValues = [...values, limit, offset];
  const limitParameter = `$${values.length + 1}`;
  const offsetParameter = `$${values.length + 2}`;

  const result = await database.query(
    `SELECT ${SAFE_STUDENT_COLUMNS}
     FROM student_profiles sp
     INNER JOIN users u ON u.id = sp.user_id
     WHERE ${whereClause}
     ORDER BY u.created_at DESC, sp.id ASC
     LIMIT ${limitParameter}
     OFFSET ${offsetParameter}`,
    queryValues
  );

  return result.rows;
};

const countStudents = async ({ search, status }, database = getDatabase()) => {
  const { whereClause, values } = buildStudentFilters({ search, status });
  const result = await database.query(
    `SELECT COUNT(*)::integer AS total
     FROM student_profiles sp
     INNER JOIN users u ON u.id = sp.user_id
     WHERE ${whereClause}`,
    values
  );

  return result.rows[0]?.total || 0;
};

const updateStudentProfile = async (
  userId,
  profileData,
  database = getDatabase()
) => {
  const client = await database.connect();

  try {
    await client.query('BEGIN');

    if (Object.hasOwn(profileData, 'phone')) {
      await client.query(
        `UPDATE users
         SET phone = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
           AND role = 'student'`,
        [profileData.phone, userId]
      );
    }

    const profileFields = [
      'course',
      'year_of_study',
      'emergency_contact_name',
      'emergency_contact_phone',
    ].filter((field) => Object.hasOwn(profileData, field));

    if (profileFields.length > 0) {
      const assignments = profileFields.map(
        (field, index) => `${field} = $${index + 1}`
      );
      const values = profileFields.map((field) => profileData[field]);

      values.push(userId);

      await client.query(
        `UPDATE student_profiles
         SET ${assignments.join(', ')},
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $${values.length}`,
        values
      );
    }

    const updatedStudent = await findStudentByUserId(userId, client);

    await client.query('COMMIT');
    return updatedStudent;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateStudentAccount = async (
  studentId,
  studentData,
  database = getDatabase()
) => {
  const client = await database.connect();

  try {
    await client.query('BEGIN');

    const userFields = ['full_name', 'email', 'phone'].filter((field) =>
      Object.hasOwn(studentData, field)
    );

    if (userFields.length > 0) {
      const assignments = userFields.map(
        (field, index) => `${field} = $${index + 1}`
      );
      const values = userFields.map((field) => studentData[field]);

      values.push(studentId);

      await client.query(
        `UPDATE users u
         SET ${assignments.join(', ')},
             updated_at = CURRENT_TIMESTAMP
         FROM student_profiles sp
         WHERE sp.user_id = u.id
           AND sp.id = $${values.length}
           AND u.role = 'student'`,
        values
      );
    }

    const profileFields = [
      'student_number',
      'course',
      'year_of_study',
      'emergency_contact_name',
      'emergency_contact_phone',
    ].filter((field) => Object.hasOwn(studentData, field));

    if (profileFields.length > 0) {
      const assignments = profileFields.map(
        (field, index) => `${field} = $${index + 1}`
      );
      const values = profileFields.map((field) => studentData[field]);

      values.push(studentId);

      await client.query(
        `UPDATE student_profiles
         SET ${assignments.join(', ')},
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $${values.length}`,
        values
      );
    }

    const updatedStudent = await findStudentById(studentId, client);

    await client.query('COMMIT');
    return updatedStudent;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateStudentAccountStatus = async (
  studentId,
  accountStatus,
  database = getDatabase()
) => {
  const result = await database.query(
    `UPDATE users u
     SET account_status = $1,
         updated_at = CURRENT_TIMESTAMP
     FROM student_profiles sp
     WHERE sp.user_id = u.id
       AND sp.id = $2
       AND u.role = 'student'
     RETURNING u.id`,
    [accountStatus, studentId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return findStudentById(studentId, database);
};

const studentExistsById = async (studentId, database = getDatabase()) => {
  const result = await database.query(
    `SELECT EXISTS(
       SELECT 1
       FROM student_profiles sp
       INNER JOIN users u ON u.id = sp.user_id
       WHERE sp.id = $1
         AND u.role = 'student'
     ) AS exists`,
    [studentId]
  );

  return result.rows[0]?.exists || false;
};

module.exports = {
  findStudentByUserId,
  findStudentById,
  listStudents,
  countStudents,
  updateStudentProfile,
  updateStudentAccount,
  updateStudentAccountStatus,
  studentExistsById,
};
