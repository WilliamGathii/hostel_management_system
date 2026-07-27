const { spawnSync } = require('child_process');
const path = require('path');

const { env } = require('../src/config/env');

const supportedActions = new Set(['create', 'up', 'down']);
const action = process.argv[2];
const extraArguments = process.argv.slice(3);

if (!supportedActions.has(action)) {
  console.error('Use one of these migration actions: create, up, or down.');
  process.exit(1);
}

if (action === 'create' && extraArguments.length === 0) {
  console.error('Provide a short migration name.');
  process.exit(1);
}

if (action !== 'create') {
  if (env.isProduction) {
    console.error('Migrations cannot be run by this script in production.');
    process.exit(1);
  }

  if (!env.databaseUrl) {
    console.error('DATABASE_URL is required to run database migrations.');
    process.exit(1);
  }
}

console.info(`Migration environment: ${env.nodeEnv}`);

const migrationCli = require.resolve('node-pg-migrate/bin/node-pg-migrate');
const migrationsDirectory = path.resolve(
  __dirname,
  '../../database/migrations'
);
const migrationArguments = [
  migrationCli,
  action,
  ...extraArguments,
  '--migrations-dir',
  migrationsDirectory,
  '--migration-file-language',
  'cjs',
];

const result = spawnSync(process.execPath, migrationArguments, {
  env: process.env,
  stdio: 'inherit',
});

if (result.error) {
  console.error('Unable to start the migration command.');
  process.exit(1);
}

process.exit(result.status ?? 1);
