const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

const SAFE_USER_COLUMNS = `
  id,
  full_name,
  email,
  phone,
  role,
  account_status,
  must_change_password,
  password_changed_at,
  token_version,
  last_login_at,
  created_at,
  updated_at
`;

const getDatabase = () => {
  if (!pool) {
    throw new AppError('Database is not configured', 503);
  }

  return pool;
};

const findUserByEmail = async (email, database = getDatabase()) => {
  const result = await database.query(
    `SELECT ${SAFE_USER_COLUMNS}
     FROM users
     WHERE email = $1`,
    [email]
  );

  return result.rows[0] || null;
};

const findUserByEmailWithPassword = async (email, database = getDatabase()) => {
  const result = await database.query(
    `SELECT ${SAFE_USER_COLUMNS}, password_hash
     FROM users
     WHERE email = $1`,
    [email]
  );

  return result.rows[0] || null;
};

const findUserById = async (userId, database = getDatabase()) => {
  const result = await database.query(
    `SELECT ${SAFE_USER_COLUMNS}
     FROM users
     WHERE id = $1`,
    [userId]
  );

  return result.rows[0] || null;
};

const createUser = async (
  {
    fullName,
    email,
    phone,
    passwordHash,
    role,
    accountStatus = 'active',
    mustChangePassword = false,
  },
  database = getDatabase()
) => {
  const result = await database.query(
    `INSERT INTO users (
       full_name,
       email,
       phone,
       password_hash,
       role,
       account_status,
       must_change_password
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${SAFE_USER_COLUMNS}`,
    [
      fullName,
      email,
      phone || null,
      passwordHash,
      role,
      accountStatus,
      mustChangePassword,
    ]
  );

  return result.rows[0];
};

const createStudentProfile = async (
  {
    userId,
    studentNumber,
    course,
    yearOfStudy,
    emergencyContactName,
    emergencyContactPhone,
  },
  database = getDatabase()
) => {
  const result = await database.query(
    `INSERT INTO student_profiles (
       user_id,
       student_number,
       course,
       year_of_study,
       emergency_contact_name,
       emergency_contact_phone
     )
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING
       id,
       user_id,
       student_number,
       course,
       year_of_study,
       emergency_contact_name,
       emergency_contact_phone,
       created_at,
       updated_at`,
    [
      userId,
      studentNumber,
      course || null,
      yearOfStudy || null,
      emergencyContactName || null,
      emergencyContactPhone || null,
    ]
  );

  return result.rows[0];
};

const createStaffProfile = async (
  { userId, staffNumber, department, jobTitle },
  database = getDatabase()
) => {
  const result = await database.query(
    `INSERT INTO staff_profiles (
       user_id,
       staff_number,
       department,
       job_title
     )
     VALUES ($1, $2, $3, $4)
     RETURNING
       id,
       user_id,
       staff_number,
       department,
       job_title,
       created_at,
       updated_at`,
    [userId, staffNumber, department || null, jobTitle || null]
  );

  return result.rows[0];
};

const findStudentProfileByUserId = async (userId, database = getDatabase()) => {
  const result = await database.query(
    `SELECT
       id,
       user_id,
       student_number,
       course,
       year_of_study,
       emergency_contact_name,
       emergency_contact_phone,
       created_at,
       updated_at
     FROM student_profiles
     WHERE user_id = $1`,
    [userId]
  );

  return result.rows[0] || null;
};

const findStaffProfileByUserId = async (userId, database = getDatabase()) => {
  const result = await database.query(
    `SELECT
       id,
       user_id,
       staff_number,
       department,
       job_title,
       created_at,
       updated_at
     FROM staff_profiles
     WHERE user_id = $1`,
    [userId]
  );

  return result.rows[0] || null;
};

const findUserWithProfile = async (userId, database = getDatabase()) => {
  const user = await findUserById(userId, database);

  if (!user) {
    return null;
  }

  const profile =
    user.role === 'student'
      ? await findStudentProfileByUserId(userId, database)
      : await findStaffProfileByUserId(userId, database);

  return {
    ...user,
    profile,
  };
};

const updateLastLoginAt = async (userId, database = getDatabase()) => {
  const result = await database.query(
    `UPDATE users
     SET last_login_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING last_login_at`,
    [userId]
  );

  return result.rows[0]?.last_login_at || null;
};

const findUserByIdWithPasswordForUpdate = async (
  userId,
  database = getDatabase()
) => {
  const result = await database.query(
    `SELECT ${SAFE_USER_COLUMNS}, password_hash
     FROM users
     WHERE id = $1
     FOR UPDATE`,
    [userId]
  );

  return result.rows[0] || null;
};

const completeRequiredPasswordChange = async (
  userId,
  passwordHash,
  expectedTokenVersion,
  database = getDatabase()
) => {
  const result = await database.query(
    `UPDATE users
     SET password_hash = $1,
         must_change_password = false,
         password_changed_at = CURRENT_TIMESTAMP,
         token_version = token_version + 1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
       AND must_change_password = true
       AND token_version = $3
     RETURNING ${SAFE_USER_COLUMNS}`,
    [passwordHash, userId, expectedTokenVersion]
  );

  return result.rows[0] || null;
};

const emailExists = async (email, database = getDatabase()) => {
  const result = await database.query(
    'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) AS exists',
    [email]
  );

  return result.rows[0].exists;
};

const studentNumberExists = async (studentNumber, database = getDatabase()) => {
  const result = await database.query(
    `SELECT EXISTS(
       SELECT 1
       FROM student_profiles
       WHERE student_number = $1
     ) AS exists`,
    [studentNumber]
  );

  return result.rows[0].exists;
};

const staffNumberExists = async (staffNumber, database = getDatabase()) => {
  const result = await database.query(
    `SELECT EXISTS(
       SELECT 1
       FROM staff_profiles
       WHERE staff_number = $1
     ) AS exists`,
    [staffNumber]
  );

  return result.rows[0].exists;
};

const runInTransaction = async (work) => {
  const client = await getDatabase().connect();

  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const createStudentAccount = async ({ user, profile }) =>
  runInTransaction(async (client) => {
    const createdUser = await createUser(user, client);
    const createdProfile = await createStudentProfile(
      {
        ...profile,
        userId: createdUser.id,
      },
      client
    );

    return {
      user: createdUser,
      profile: createdProfile,
    };
  });

const createStaffAccount = async ({ user, profile }) =>
  runInTransaction(async (client) => {
    const createdUser = await createUser(user, client);
    const createdProfile = await createStaffProfile(
      {
        ...profile,
        userId: createdUser.id,
      },
      client
    );

    return {
      user: createdUser,
      profile: createdProfile,
    };
  });

module.exports = {
  completeRequiredPasswordChange,
  findUserByEmail,
  findUserByEmailWithPassword,
  findUserById,
  findUserByIdWithPasswordForUpdate,
  createUser,
  createStudentProfile,
  createStaffProfile,
  findStudentProfileByUserId,
  findStaffProfileByUserId,
  findUserWithProfile,
  updateLastLoginAt,
  emailExists,
  studentNumberExists,
  staffNumberExists,
  createStudentAccount,
  createStaffAccount,
  runInTransaction,
};
