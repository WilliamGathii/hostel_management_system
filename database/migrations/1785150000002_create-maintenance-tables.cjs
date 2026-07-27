/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const up = (pgm) => {
  pgm.createTable('maintenance_requests', {
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
    room_id: {
      type: 'uuid',
      notNull: true,
      references: 'rooms',
      onDelete: 'RESTRICT',
    },
    assigned_staff_id: {
      type: 'uuid',
      references: 'users',
      onDelete: 'SET NULL',
    },
    title: { type: 'varchar(150)', notNull: true },
    description: { type: 'text', notNull: true },
    priority: { type: 'varchar(20)', notNull: true, default: 'medium' },
    status: { type: 'varchar(20)', notNull: true, default: 'submitted' },
    submitted_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    completed_at: { type: 'timestamptz' },
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
    'maintenance_requests',
    'maintenance_requests_priority_check',
    { check: "priority IN ('low', 'medium', 'high', 'urgent')" }
  );
  pgm.addConstraint(
    'maintenance_requests',
    'maintenance_requests_status_check',
    {
      check:
        "status IN ('submitted', 'assigned', 'in_progress', 'completed', 'rejected', 'cancelled')",
    }
  );
  pgm.createIndex('maintenance_requests', 'student_id');
  pgm.createIndex('maintenance_requests', 'room_id');
  pgm.createIndex('maintenance_requests', 'assigned_staff_id');
  pgm.createIndex('maintenance_requests', 'status');
  pgm.createIndex('maintenance_requests', 'priority');

  pgm.createTable('maintenance_updates', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    maintenance_request_id: {
      type: 'uuid',
      notNull: true,
      references: 'maintenance_requests',
      onDelete: 'CASCADE',
    },
    updated_by: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'RESTRICT',
    },
    status: { type: 'varchar(20)', notNull: true },
    note: { type: 'text' },
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

  pgm.addConstraint('maintenance_updates', 'maintenance_updates_status_check', {
    check:
      "status IN ('submitted', 'assigned', 'in_progress', 'completed', 'rejected', 'cancelled')",
  });
  pgm.createIndex('maintenance_updates', 'maintenance_request_id');
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const down = (pgm) => {
  pgm.dropTable('maintenance_updates');
  pgm.dropTable('maintenance_requests');
};

module.exports = { up, down };
