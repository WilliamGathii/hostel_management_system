/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const up = (pgm) => {
  pgm.createTable('payments', {
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
    room_allocation_id: {
      type: 'uuid',
      references: 'room_allocations',
      onDelete: 'SET NULL',
    },
    amount: { type: 'numeric(12,2)', notNull: true },
    payment_method: { type: 'varchar(50)', notNull: true },
    transaction_reference: { type: 'varchar(100)', unique: true },
    payment_date: { type: 'date', notNull: true },
    payment_status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'pending',
    },
    recorded_by: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'RESTRICT',
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

  pgm.addConstraint('payments', 'payments_amount_check', {
    check: 'amount > 0',
  });
  pgm.addConstraint('payments', 'payments_status_check', {
    check:
      "payment_status IN ('pending', 'paid', 'failed', 'rejected', 'reversed')",
  });
  pgm.createIndex('payments', 'student_id');
  pgm.createIndex('payments', 'room_allocation_id');
  pgm.createIndex('payments', 'payment_status');
  pgm.createIndex('payments', 'payment_date');
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const down = (pgm) => {
  pgm.dropTable('payments');
};

module.exports = { up, down };
