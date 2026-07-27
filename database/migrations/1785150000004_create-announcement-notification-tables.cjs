/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const up = (pgm) => {
  pgm.createTable('announcements', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    title: { type: 'varchar(180)', notNull: true },
    message: { type: 'text', notNull: true },
    created_by: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'RESTRICT',
    },
    target_role: { type: 'varchar(30)' },
    published_at: { type: 'timestamptz' },
    expires_at: { type: 'timestamptz' },
    status: { type: 'varchar(20)', notNull: true, default: 'draft' },
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

  pgm.addConstraint('announcements', 'announcements_target_role_check', {
    check:
      "target_role IS NULL OR target_role IN ('student', 'admin', 'maintenance_staff', 'security_staff')",
  });
  pgm.addConstraint('announcements', 'announcements_status_check', {
    check: "status IN ('draft', 'published', 'expired', 'archived')",
  });
  pgm.addConstraint('announcements', 'announcements_expiry_check', {
    check:
      'expires_at IS NULL OR published_at IS NULL OR expires_at > published_at',
  });
  pgm.createIndex('announcements', 'status');
  pgm.createIndex('announcements', 'target_role');

  pgm.createTable('announcement_recipients', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    announcement_id: {
      type: 'uuid',
      notNull: true,
      references: 'announcements',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    read_at: { type: 'timestamptz' },
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
    'announcement_recipients',
    'announcement_recipients_unique',
    { unique: ['announcement_id', 'user_id'] }
  );

  pgm.createTable('notifications', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    notification_type: { type: 'varchar(50)', notNull: true },
    title: { type: 'varchar(180)', notNull: true },
    message: { type: 'text', notNull: true },
    related_entity_type: { type: 'varchar(50)' },
    related_entity_id: { type: 'uuid' },
    read_at: { type: 'timestamptz' },
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
  pgm.createIndex('notifications', 'user_id');
  pgm.createIndex('notifications', ['user_id', 'read_at']);
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const down = (pgm) => {
  pgm.dropTable('notifications');
  pgm.dropTable('announcement_recipients');
  pgm.dropTable('announcements');
};

module.exports = { up, down };
