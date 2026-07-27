/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const up = (pgm) => {
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    full_name: {
      type: 'varchar(150)',
      notNull: true,
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    phone: {
      type: 'varchar(30)',
    },
    password_hash: {
      type: 'varchar(255)',
      notNull: true,
    },
    role: {
      type: 'varchar(30)',
      notNull: true,
    },
    account_status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'active',
    },
    last_login_at: {
      type: 'timestamptz',
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

  pgm.addConstraint('users', 'users_email_lowercase_check', {
    check: 'email = LOWER(email)',
  });
  pgm.addConstraint('users', 'users_role_check', {
    check:
      "role IN ('student', 'admin', 'maintenance_staff', 'security_staff')",
  });
  pgm.addConstraint('users', 'users_account_status_check', {
    check: "account_status IN ('active', 'suspended', 'inactive')",
  });
  pgm.createIndex('users', 'role');
  pgm.createIndex('users', 'account_status');

  pgm.createTable('student_profiles', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      unique: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    student_number: {
      type: 'varchar(50)',
      notNull: true,
      unique: true,
    },
    course: {
      type: 'varchar(150)',
    },
    year_of_study: {
      type: 'integer',
    },
    emergency_contact_name: {
      type: 'varchar(150)',
    },
    emergency_contact_phone: {
      type: 'varchar(30)',
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

  pgm.addConstraint(
    'student_profiles',
    'student_profiles_year_of_study_check',
    {
      check: 'year_of_study IS NULL OR year_of_study > 0',
    }
  );

  pgm.createTable('staff_profiles', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      unique: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    staff_number: {
      type: 'varchar(50)',
      notNull: true,
      unique: true,
    },
    department: {
      type: 'varchar(150)',
    },
    job_title: {
      type: 'varchar(150)',
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
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const down = (pgm) => {
  pgm.dropTable('staff_profiles');
  pgm.dropTable('student_profiles');
  pgm.dropTable('users');
};

module.exports = {
  up,
  down,
};
