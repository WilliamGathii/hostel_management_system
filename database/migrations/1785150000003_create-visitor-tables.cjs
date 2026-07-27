/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const up = (pgm) => {
  pgm.createTable('visitors', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    student_id: {
      type: 'uuid',
      notNull: true,
      references: 'student_profiles',
      onDelete: 'RESTRICT',
    },
    visitor_name: { type: 'varchar(150)', notNull: true },
    visitor_phone: { type: 'varchar(30)', notNull: true },
    identification_type: { type: 'varchar(50)' },
    identification_number: { type: 'varchar(100)' },
    visit_date: { type: 'date', notNull: true },
    expected_entry_time: { type: 'time' },
    expected_exit_time: { type: 'time' },
    purpose: { type: 'text', notNull: true },
    approval_status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'pending',
    },
    approved_by: {
      type: 'uuid',
      references: 'users',
      onDelete: 'SET NULL',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.addConstraint('visitors', 'visitors_approval_status_check', {
    check: "approval_status IN ('pending', 'approved', 'rejected', 'expired')",
  });
  pgm.addConstraint('visitors', 'visitors_expected_times_check', {
    check:
      'expected_exit_time IS NULL OR expected_entry_time IS NULL OR expected_exit_time > expected_entry_time',
  });
  pgm.createIndex('visitors', 'student_id');
  pgm.createIndex('visitors', 'approval_status');
  pgm.createIndex('visitors', 'visit_date');

  pgm.createTable('visitor_verifications', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    visitor_id: {
      type: 'uuid',
      notNull: true,
      unique: true,
      references: 'visitors',
      onDelete: 'CASCADE',
    },
    verified_by: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'RESTRICT',
    },
    entry_time: { type: 'timestamptz', notNull: true },
    exit_time: { type: 'timestamptz' },
    verification_status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'checked_in',
    },
    notes: { type: 'text' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.addConstraint(
    'visitor_verifications',
    'visitor_verifications_status_check',
    {
      check:
        "verification_status IN ('checked_in', 'checked_out', 'cancelled')",
    }
  );
  pgm.addConstraint(
    'visitor_verifications',
    'visitor_verifications_times_check',
    { check: 'exit_time IS NULL OR exit_time >= entry_time' }
  );
  pgm.createIndex('visitor_verifications', 'verified_by');
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const down = (pgm) => {
  pgm.dropTable('visitor_verifications');
  pgm.dropTable('visitors');
};

module.exports = { up, down };
