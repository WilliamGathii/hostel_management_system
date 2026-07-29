const DEFAULT_ROOM_TYPES = [
  {
    code: 'A',
    name: 'Twin Room',
    monthlyRate: 10000,
    defaultCapacity: 2,
    description: 'A shared room for two students.',
  },
  {
    code: 'B',
    name: 'Studio',
    monthlyRate: 14000,
    defaultCapacity: 1,
    description: 'A private studio room for one student.',
  },
  {
    code: 'C',
    name: 'Superior Studio',
    monthlyRate: 16500,
    defaultCapacity: 1,
    description: 'A larger private studio room for one student.',
  },
  {
    code: 'D',
    name: 'One Bedroom',
    monthlyRate: 20000,
    defaultCapacity: 1,
    description: 'A one-bedroom room for one student.',
  },
  {
    code: 'E',
    name: 'Two Bedroom',
    monthlyRate: 30000,
    defaultCapacity: 2,
    description: 'A two-bedroom room for two students.',
  },
];

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const up = (pgm) => {
  pgm.createTable('room_types', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    code: { type: 'varchar(1)', notNull: true, unique: true },
    name: { type: 'varchar(100)', notNull: true, unique: true },
    monthly_rate: { type: 'numeric(12,2)', notNull: true },
    default_capacity: { type: 'integer', notNull: true },
    description: { type: 'text' },
    status: { type: 'varchar(20)', notNull: true, default: 'active' },
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
  pgm.addConstraint('room_types', 'room_types_code_check', {
    check: "code ~ '^[A-Z]$'",
  });
  pgm.addConstraint('room_types', 'room_types_rate_check', {
    check: 'monthly_rate > 0',
  });
  pgm.addConstraint('room_types', 'room_types_capacity_check', {
    check: 'default_capacity > 0',
  });
  pgm.addConstraint('room_types', 'room_types_status_check', {
    check: "status IN ('active', 'inactive')",
  });
  pgm.createIndex('room_types', 'status');

  DEFAULT_ROOM_TYPES.forEach((roomType) => {
    const quotedName = roomType.name.replaceAll("'", "''");
    const quotedDescription = roomType.description.replaceAll("'", "''");

    pgm.sql(
      `INSERT INTO room_types (
         code, name, monthly_rate, default_capacity, description, status
       )
       VALUES (
         '${roomType.code}',
         '${quotedName}',
         ${roomType.monthlyRate},
         ${roomType.defaultCapacity},
         '${quotedDescription}',
         'active'
       )
       ON CONFLICT (code) DO NOTHING`
    );
  });

  pgm.renameColumn('rooms', 'room_number', 'legacy_room_number');
  pgm.renameColumn('rooms', 'room_type', 'legacy_room_type');
  pgm.renameColumn('rooms', 'status', 'legacy_status');
  pgm.renameColumn('rooms', 'floor', 'legacy_floor');
  pgm.alterColumn('rooms', 'legacy_room_number', { notNull: false });
  pgm.alterColumn('rooms', 'legacy_room_type', { notNull: false });

  pgm.addColumns('rooms', {
    room_type_id: {
      type: 'uuid',
      references: 'room_types',
      onDelete: 'RESTRICT',
    },
    floor_number: { type: 'integer' },
    room_number: { type: 'integer' },
    room_code: { type: 'varchar(20)' },
    operational_status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'active',
    },
  });

  pgm.sql(`
    WITH prepared AS (
      SELECT
        r.id,
        CASE
          WHEN UPPER(LEFT(COALESCE(r.legacy_room_number, ''), 1))
            IN ('A', 'B', 'C', 'D', 'E')
            THEN UPPER(LEFT(r.legacy_room_number, 1))
          WHEN LOWER(COALESCE(r.legacy_room_type, '')) LIKE '%superior%'
            THEN 'C'
          WHEN LOWER(COALESCE(r.legacy_room_type, '')) LIKE '%two bedroom%'
            THEN 'E'
          WHEN LOWER(COALESCE(r.legacy_room_type, '')) LIKE '%one bedroom%'
            THEN 'D'
          WHEN LOWER(COALESCE(r.legacy_room_type, '')) LIKE '%studio%'
            OR LOWER(COALESCE(r.legacy_room_type, '')) LIKE '%single%'
            THEN 'B'
          ELSE 'A'
        END AS type_code,
        CASE
          WHEN UPPER(COALESCE(r.legacy_room_number, '')) ~ '^[A-E][0-9]{3,}$'
            THEN SUBSTRING(
              UPPER(r.legacy_room_number)
              FROM 2 FOR LENGTH(r.legacy_room_number) - 3
            )::integer
          WHEN REGEXP_REPLACE(COALESCE(r.legacy_floor, ''), '[^0-9]', '', 'g')
            ~ '^[1-9][0-9]*$'
            THEN REGEXP_REPLACE(r.legacy_floor, '[^0-9]', '', 'g')::integer
          ELSE 1
        END AS floor_number,
        CASE
          WHEN UPPER(COALESCE(r.legacy_room_number, '')) ~ '^[A-E][0-9]{3,}$'
            AND RIGHT(r.legacy_room_number, 2)::integer BETWEEN 1 AND 99
            THEN RIGHT(r.legacy_room_number, 2)::integer
          ELSE 50 + ROW_NUMBER() OVER (ORDER BY r.created_at, r.id)
        END AS room_number,
        CASE
          WHEN r.legacy_status IN ('under_maintenance', 'inactive')
            THEN r.legacy_status
          ELSE 'active'
        END AS operational_status
      FROM rooms r
    )
    UPDATE rooms r
    SET
      room_type_id = rt.id,
      floor_number = p.floor_number,
      room_number = p.room_number,
      room_code = p.type_code
        || p.floor_number::text
        || LPAD(p.room_number::text, 2, '0'),
      operational_status = p.operational_status
    FROM prepared p
    INNER JOIN room_types rt ON rt.code = p.type_code
    WHERE r.id = p.id
  `);

  pgm.alterColumn('rooms', 'room_type_id', { notNull: true });
  pgm.alterColumn('rooms', 'floor_number', { notNull: true });
  pgm.alterColumn('rooms', 'room_number', { notNull: true });
  pgm.alterColumn('rooms', 'room_code', { notNull: true });
  pgm.addConstraint('rooms', 'rooms_floor_number_check', {
    check: 'floor_number > 0',
  });
  pgm.addConstraint('rooms', 'rooms_structured_number_check', {
    check: 'room_number BETWEEN 1 AND 99',
  });
  pgm.addConstraint('rooms', 'rooms_operational_status_check', {
    check: "operational_status IN ('active', 'under_maintenance', 'inactive')",
  });
  pgm.addConstraint('rooms', 'rooms_type_floor_number_unique', {
    unique: ['room_type_id', 'floor_number', 'room_number'],
  });
  pgm.addConstraint('rooms', 'rooms_room_code_unique', {
    unique: ['room_code'],
  });
  pgm.createIndex('rooms', 'room_type_id');
  pgm.createIndex('rooms', 'floor_number');
  pgm.createIndex('rooms', 'operational_status');

  pgm.addColumn('room_allocations', {
    monthly_rate_at_allocation: { type: 'numeric(12,2)' },
  });
  pgm.sql(`
    UPDATE room_allocations ra
    SET monthly_rate_at_allocation = rt.monthly_rate
    FROM rooms r
    INNER JOIN room_types rt ON rt.id = r.room_type_id
    WHERE r.id = ra.room_id
  `);
  pgm.alterColumn('room_allocations', 'monthly_rate_at_allocation', {
    notNull: true,
  });
  pgm.addConstraint('room_allocations', 'room_allocations_monthly_rate_check', {
    check: 'monthly_rate_at_allocation > 0',
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
const down = (pgm) => {
  pgm.dropConstraint('room_allocations', 'room_allocations_monthly_rate_check');
  pgm.dropColumn('room_allocations', 'monthly_rate_at_allocation');

  pgm.sql(`
    UPDATE rooms
    SET
      legacy_room_number = COALESCE(legacy_room_number, room_code),
      legacy_room_type = COALESCE(
        legacy_room_type,
        (SELECT name FROM room_types WHERE id = rooms.room_type_id)
      ),
      legacy_status = CASE
        WHEN operational_status IN ('under_maintenance', 'inactive')
          THEN operational_status
        WHEN current_occupancy = 0 THEN 'available'
        WHEN current_occupancy >= capacity THEN 'full'
        ELSE 'occupied'
      END,
      legacy_floor = COALESCE(legacy_floor, floor_number::text)
  `);

  pgm.dropConstraint('rooms', 'rooms_type_floor_number_unique');
  pgm.dropConstraint('rooms', 'rooms_room_code_unique');
  pgm.dropConstraint('rooms', 'rooms_floor_number_check');
  pgm.dropConstraint('rooms', 'rooms_structured_number_check');
  pgm.dropConstraint('rooms', 'rooms_operational_status_check');
  pgm.dropColumns('rooms', [
    'room_type_id',
    'floor_number',
    'room_number',
    'room_code',
    'operational_status',
  ]);
  pgm.alterColumn('rooms', 'legacy_room_number', { notNull: true });
  pgm.alterColumn('rooms', 'legacy_room_type', { notNull: true });
  pgm.renameColumn('rooms', 'legacy_room_number', 'room_number');
  pgm.renameColumn('rooms', 'legacy_room_type', 'room_type');
  pgm.renameColumn('rooms', 'legacy_status', 'status');
  pgm.renameColumn('rooms', 'legacy_floor', 'floor');
  pgm.dropTable('room_types');
};

module.exports = { DEFAULT_ROOM_TYPES, down, up };
