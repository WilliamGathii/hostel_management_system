const { Pool } = require('pg');

const { env } = require('./env');
const logger = require('../utils/logger');

const createPool = () => {
  const connectionString = env.isTest ? env.testDatabaseUrl : env.databaseUrl;

  if (!connectionString) {
    return null;
  }

  return new Pool({
    connectionString,
    ssl: env.isProduction ? { rejectUnauthorized: false } : false,
  });
};

const pool = createPool();

const testDatabaseConnection = async () => {
  if (!pool) {
    logger.warn(
      'Database connection was not tested because DATABASE_URL is not set.'
    );
    return false;
  }

  let client;

  try {
    client = await pool.connect();
    await client.query('SELECT 1');
    logger.info('Database connection successful.');
    return true;
  } catch (error) {
    logger.error('Database connection failed.', error.message);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
};

const closeDatabaseConnection = async () => {
  if (!pool) {
    return;
  }

  await pool.end();
  logger.info('Database pool closed.');
};

module.exports = {
  pool,
  testDatabaseConnection,
  closeDatabaseConnection,
};
