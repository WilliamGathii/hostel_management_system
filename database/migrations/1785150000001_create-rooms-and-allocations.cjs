/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const up = (pgm) => {
  pgm.createTable('rooms', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    room_number: { type: 'varchar(50)', notNull: true, unique: true },
    room_type: { type: 'varchar(80)', notNull: true },
    capacity: { type: 'integer', notNull: true },
    current_occupancy: { type: 'integer', notNull: true, default: 0 },
    status: { type: 'varchar(30)', notNull: true, default: 'available' },
    floor: { type: 'varchar(50)' },
    description: { type: 'text' },
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

  pgm.addConstraint('rooms', 'rooms_capacity_check', {
    check: 'capacity > 0',
  });
  pgm.addConstraint('rooms', 'rooms_occupancy_check', {
    check: 'current_occupancy >= 0 AND current_occupancy <= capacity',
  });
  pgm.addConstraint('rooms', 'rooms_status_check', {
    check:
      "status IN ('available', 'occupied', 'full', 'under_maintenance', 'inactive')",
  });
  pgm.createIndex('rooms', 'status');
  pgm.createIndex('rooms', 'floor');

  pgm.createTable('room_allocations', {
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
    allocated_by: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'RESTRICT',
    },
    start_date: { type: 'date', notNull: true },
    expected_end_date: { type: 'date' },
    actual_end_date: { type: 'date' },
    allocation_status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'active',
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

  pgm.addConstraint('room_allocations', 'room_allocations_status_check', {
    check:
      "allocation_status IN ('pending', 'active', 'completed', 'cancelled')",
  });
  pgm.addConstraint('room_allocations', 'room_allocations_dates_check', {
    check: 'expected_end_date IS NULL OR expected_end_date >= start_date',
  });
  pgm.createIndex('room_allocations', 'room_id');
  pgm.createIndex('room_allocations', 'allocation_status');
  pgm.sql(
    `CREATE UNIQUE INDEX room_allocations_one_active_student
     ON room_allocations (student_id)
     WHERE allocation_status = 'active'`
  );
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const down = (pgm) => {
  pgm.dropTable('room_allocations');
  pgm.dropTable('rooms');
};

module.exports = { up, down };
