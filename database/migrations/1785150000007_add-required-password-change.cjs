/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const up = (pgm) => {
  pgm.addColumns('users', {
    must_change_password: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    password_changed_at: {
      type: 'timestamptz',
    },
    token_version: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
  });

  pgm.addConstraint('users', 'users_token_version_check', {
    check: 'token_version >= 0',
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const down = (pgm) => {
  pgm.dropConstraint('users', 'users_token_version_check');
  pgm.dropColumns('users', [
    'must_change_password',
    'password_changed_at',
    'token_version',
  ]);
};

module.exports = {
  up,
  down,
};
