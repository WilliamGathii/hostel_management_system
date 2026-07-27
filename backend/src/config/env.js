const path = require('path');

const dotenv = require('dotenv');

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
  quiet: true,
});

const parsePort = (value) => {
  const parsedPort = Number.parseInt(value, 10);

  if (Number.isNaN(parsedPort)) {
    return 5000;
  }

  return parsedPort;
};

const parseSaltRounds = (value) => {
  const parsedRounds = Number.parseInt(value, 10);

  if (Number.isNaN(parsedRounds) || parsedRounds < 4 || parsedRounds > 15) {
    return 12;
  }

  return parsedRounds;
};

const nodeEnv = process.env.NODE_ENV || 'development';
const isTest = nodeEnv === 'test';

const env = {
  port: parsePort(process.env.PORT),
  nodeEnv,
  databaseUrl: process.env.DATABASE_URL || '',
  testDatabaseUrl: process.env.TEST_DATABASE_URL || '',
  jwtSecret:
    process.env.JWT_SECRET ||
    (isTest ? 'test-only-jwt-secret-for-automated-tests-do-not-use' : ''),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  bcryptSaltRounds: parseSaltRounds(process.env.BCRYPT_SALT_ROUNDS),
  frontendUrl: process.env.FRONTEND_URL || '',
  isDevelopment: nodeEnv === 'development',
  isProduction: nodeEnv === 'production',
  isTest,
};

const getMissingImportantValues = () => {
  const missingValues = [];

  if (!env.isTest && !env.databaseUrl) {
    missingValues.push('DATABASE_URL');
  }

  if (!env.isTest && !env.jwtSecret) {
    missingValues.push('JWT_SECRET');
  }

  return missingValues;
};

const validateRequiredEnv = () => {
  const missingValues = getMissingImportantValues();

  const jwtSecretMissing = missingValues.includes('JWT_SECRET');

  if ((env.isProduction && missingValues.length > 0) || jwtSecretMissing) {
    throw new Error(
      `Missing required environment values: ${missingValues.join(', ')}`
    );
  }

  return missingValues;
};

const warnAboutMissingEnv = (logger) => {
  const missingValues = getMissingImportantValues();

  if (!env.isTest && missingValues.length > 0) {
    logger.warn(
      `Missing environment values: ${missingValues.join(
        ', '
      )}. Database-backed features will not work until they are configured.`
    );
  }

  return missingValues;
};

module.exports = {
  env,
  getMissingImportantValues,
  validateRequiredEnv,
  warnAboutMissingEnv,
};
