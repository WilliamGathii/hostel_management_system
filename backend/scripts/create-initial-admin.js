const { closeDatabaseConnection } = require('../src/config/database');
const { env } = require('../src/config/env');
const userModel = require('../src/models/user.model');
const { hashPassword } = require('../src/utils/password');

const requiredValues = {
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_FULL_NAME: process.env.ADMIN_FULL_NAME,
  ADMIN_STAFF_NUMBER: process.env.ADMIN_STAFF_NUMBER,
};

const getMissingValues = () =>
  Object.entries(requiredValues)
    .filter(([, value]) => !value || !value.trim())
    .map(([name]) => name);

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (password) =>
  password.length >= 8 &&
  Buffer.byteLength(password, 'utf8') <= 72 &&
  /[A-Za-z]/.test(password) &&
  /[0-9]/.test(password);

const validateSetup = () => {
  if (env.isProduction) {
    throw new Error('Initial Admin setup cannot run in production.');
  }

  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required.');
  }

  const missingValues = getMissingValues();

  if (missingValues.length > 0) {
    throw new Error(`Missing required values: ${missingValues.join(', ')}`);
  }

  if (!validateEmail(requiredValues.ADMIN_EMAIL.trim())) {
    throw new Error('ADMIN_EMAIL must be a valid email address.');
  }

  if (!validatePassword(requiredValues.ADMIN_PASSWORD)) {
    throw new Error(
      'ADMIN_PASSWORD must be 8 to 72 bytes and contain a letter and number.'
    );
  }
};

const createInitialAdmin = async () => {
  validateSetup();

  const email = requiredValues.ADMIN_EMAIL.trim().toLowerCase();
  const staffNumber = requiredValues.ADMIN_STAFF_NUMBER.trim();

  if (await userModel.emailExists(email)) {
    throw new Error('An account with the Admin email already exists.');
  }

  if (await userModel.staffNumberExists(staffNumber)) {
    throw new Error('An account with the Admin staff number already exists.');
  }

  const passwordHash = await hashPassword(requiredValues.ADMIN_PASSWORD);

  await userModel.createStaffAccount({
    user: {
      fullName: requiredValues.ADMIN_FULL_NAME.trim(),
      email,
      phone: process.env.ADMIN_PHONE?.trim() || null,
      passwordHash,
      role: 'admin',
      accountStatus: 'active',
    },
    profile: {
      staffNumber,
      department: process.env.ADMIN_DEPARTMENT?.trim() || null,
      jobTitle: process.env.ADMIN_JOB_TITLE?.trim() || 'Admin',
    },
  });

  console.info('Initial Admin account created successfully.');
};

createInitialAdmin()
  .catch((error) => {
    console.error(`Initial Admin setup failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabaseConnection();
  });
