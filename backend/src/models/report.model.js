const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

const ROOM_STATUSES = new Set([
  'available',
  'occupied',
  'full',
  'under_maintenance',
  'inactive',
]);
const ALLOCATION_STATUSES = new Set([
  'pending',
  'active',
  'completed',
  'cancelled',
]);

const getDatabase = () => {
  if (!pool) {
    throw new AppError('Database is not configured', 503);
  }
  return pool;
};

const addFilter = (values, conditions, value, condition) => {
  if (value === '' || value === null || value === undefined) {
    return;
  }
  values.push(value);
  conditions.push(condition(values.length));
};

const where = (conditions) =>
  conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

const pagination = (options, total) => ({
  page: options.page,
  limit: options.limit,
  total,
  totalPages: total === 0 ? 0 : Math.ceil(total / options.limit),
});

const getAdminDashboard = async (database = getDatabase()) => {
  const result = await database.query(
    `SELECT
       (SELECT COUNT(*)::integer FROM users WHERE role = 'student') AS students,
       (SELECT COUNT(*)::integer FROM users WHERE role = 'student' AND account_status = 'active') AS active_students,
       (SELECT COUNT(*)::integer FROM rooms) AS rooms,
       (SELECT COUNT(*)::integer FROM rooms WHERE status = 'available') AS available_rooms,
       (SELECT COUNT(*)::integer FROM rooms WHERE status IN ('occupied', 'full') OR current_occupancy > 0) AS occupied_rooms,
       (SELECT COUNT(*)::integer FROM room_allocations WHERE allocation_status = 'active') AS active_allocations,
       (SELECT COUNT(*)::integer FROM maintenance_requests WHERE status IN ('submitted', 'assigned', 'in_progress')) AS open_maintenance,
       (SELECT COUNT(*)::integer FROM maintenance_requests WHERE status = 'submitted') AS pending_maintenance,
       (SELECT COUNT(*)::integer FROM visitors WHERE approval_status = 'pending') AS pending_visitors,
       (SELECT COUNT(*)::integer FROM payments WHERE payment_status = 'pending') AS pending_payments,
       (SELECT COUNT(*)::integer FROM payments) AS simulated_payments_recorded,
       (
         SELECT COUNT(*)::integer
         FROM visitor_verifications
         WHERE verification_status = 'checked_in' AND exit_time IS NULL
       ) AS visitors_inside,
       (SELECT COALESCE(SUM(capacity), 0)::integer FROM rooms WHERE status <> 'inactive') AS total_capacity,
       (SELECT COALESCE(SUM(current_occupancy), 0)::integer FROM rooms WHERE status <> 'inactive') AS current_occupancy`
  );
  const stats = result.rows[0];
  stats.available_beds = Math.max(
    stats.total_capacity - stats.current_occupancy,
    0
  );
  stats.occupancy_rate =
    stats.total_capacity === 0
      ? 0
      : Number(
          ((stats.current_occupancy / stats.total_capacity) * 100).toFixed(1)
        );
  return stats;
};

const getStudentDashboard = async (userId, database = getDatabase()) => {
  const result = await database.query(
    `SELECT
       EXISTS (
         SELECT 1
         FROM room_allocations ra
         INNER JOIN student_profiles sp ON sp.id = ra.student_id
         WHERE sp.user_id = $1 AND ra.allocation_status = 'active'
       ) AS has_active_allocation,
       (
         SELECT COUNT(*)::integer
         FROM maintenance_requests mr
         INNER JOIN student_profiles sp ON sp.id = mr.student_id
         WHERE sp.user_id = $1
           AND mr.status IN ('submitted', 'assigned', 'in_progress')
       ) AS open_maintenance,
       (
         SELECT COUNT(*)::integer
         FROM visitors v
         INNER JOIN student_profiles sp ON sp.id = v.student_id
         WHERE sp.user_id = $1 AND v.approval_status = 'pending'
       ) AS pending_visitors,
       (
         SELECT COUNT(*)::integer
         FROM notifications
         WHERE user_id = $1 AND read_at IS NULL
       ) AS unread_notifications,
       (
         SELECT COUNT(*)::integer
         FROM payments p
         INNER JOIN student_profiles sp ON sp.id = p.student_id
         WHERE sp.user_id = $1
       ) AS payment_records`,
    [userId]
  );
  return result.rows[0];
};

const getMaintenanceDashboard = async (userId, database = getDatabase()) => {
  const result = await database.query(
    `SELECT
       COUNT(*)::integer AS assigned_total,
       COUNT(*) FILTER (
         WHERE priority = 'urgent'
           AND status IN ('assigned', 'in_progress')
       )::integer AS urgent,
       COUNT(*) FILTER (WHERE status = 'in_progress')::integer AS in_progress,
       COUNT(*) FILTER (WHERE status = 'completed')::integer AS completed
     FROM maintenance_requests
     WHERE assigned_staff_id = $1`,
    [userId]
  );
  return result.rows[0];
};

const getSecurityDashboard = async (database = getDatabase()) => {
  const result = await database.query(
    `SELECT
       (
         SELECT COUNT(*)::integer
         FROM visitors v
         LEFT JOIN visitor_verifications vv ON vv.visitor_id = v.id
         WHERE v.approval_status = 'approved'
           AND v.visit_date = CURRENT_DATE
           AND vv.id IS NULL
       ) AS expected_today,
       (
         SELECT COUNT(*)::integer
         FROM visitor_verifications
         WHERE verification_status = 'checked_in'
           AND exit_time IS NULL
       ) AS currently_inside,
       (
         SELECT COUNT(*)::integer
         FROM visitor_verifications
         WHERE verification_status = 'checked_out'
           AND exit_time::date = CURRENT_DATE
       ) AS completed_today`
  );
  return result.rows[0];
};

const getDashboard = async (user, database = getDatabase()) => {
  if (user.role === 'admin') {
    return getAdminDashboard(database);
  }
  if (user.role === 'student') {
    return getStudentDashboard(user.id, database);
  }
  if (user.role === 'maintenance_staff') {
    return getMaintenanceDashboard(user.id, database);
  }
  return getSecurityDashboard(database);
};

const buildRoomFilters = (options) => {
  const values = [];
  const conditions = [];
  addFilter(values, conditions, options.roomId, (index) => `r.id = $${index}`);
  if (ROOM_STATUSES.has(options.status)) {
    addFilter(
      values,
      conditions,
      options.status,
      (index) => `r.status = $${index}`
    );
  }
  return { values, conditions };
};

const buildAllocationFilters = (options) => {
  const values = [];
  const conditions = [];
  addFilter(
    values,
    conditions,
    options.roomId,
    (index) => `ra.room_id = $${index}`
  );
  addFilter(
    values,
    conditions,
    options.studentId,
    (index) => `ra.student_id = $${index}`
  );
  addFilter(
    values,
    conditions,
    options.dateFrom,
    (index) => `ra.start_date >= $${index}`
  );
  addFilter(
    values,
    conditions,
    options.dateTo,
    (index) => `ra.start_date <= $${index}`
  );
  if (ALLOCATION_STATUSES.has(options.status)) {
    addFilter(
      values,
      conditions,
      options.status,
      (index) => `ra.allocation_status = $${index}`
    );
  }
  return { values, conditions };
};

const getRoomReport = async (options, database = getDatabase()) => {
  const roomFilters = buildRoomFilters(options);
  const roomWhere = where(roomFilters.conditions);
  const summaryResult = await database.query(
    `SELECT
       COUNT(*)::integer AS total_rooms,
       COALESCE(SUM(r.capacity), 0)::integer AS total_capacity,
       COALESCE(SUM(r.current_occupancy), 0)::integer AS current_occupancy,
       COALESCE(SUM(r.capacity - r.current_occupancy), 0)::integer AS available_beds
     FROM rooms r
     ${roomWhere}`,
    roomFilters.values
  );
  const statusResult = await database.query(
    `SELECT r.status, COUNT(*)::integer AS total
     FROM rooms r
     ${roomWhere}
     GROUP BY r.status
     ORDER BY r.status`,
    roomFilters.values
  );
  const roomsResult = await database.query(
    `SELECT r.id, r.room_number, r.room_type, r.floor, r.capacity,
            r.current_occupancy, r.status
     FROM rooms r
     ${roomWhere}
     ORDER BY r.room_number
     LIMIT 100`,
    roomFilters.values
  );

  const allocationFilters = buildAllocationFilters(options);
  const allocationWhere = where(allocationFilters.conditions);
  const offset = (options.page - 1) * options.limit;
  const countResult = await database.query(
    `SELECT COUNT(*)::integer AS total
     FROM room_allocations ra
     ${allocationWhere}`,
    allocationFilters.values
  );
  const allocationsResult = await database.query(
    `SELECT ra.id, ra.start_date, ra.expected_end_date, ra.actual_end_date,
            ra.allocation_status, r.room_number, sp.student_number,
            u.full_name AS student_name
     FROM room_allocations ra
     INNER JOIN rooms r ON r.id = ra.room_id
     INNER JOIN student_profiles sp ON sp.id = ra.student_id
     INNER JOIN users u ON u.id = sp.user_id
     ${allocationWhere}
     ORDER BY ra.start_date DESC, ra.created_at DESC
     LIMIT $${allocationFilters.values.length + 1}
     OFFSET $${allocationFilters.values.length + 2}`,
    [...allocationFilters.values, options.limit, offset]
  );

  const summary = summaryResult.rows[0];
  summary.occupancy_rate =
    summary.total_capacity === 0
      ? 0
      : Number(
          ((summary.current_occupancy / summary.total_capacity) * 100).toFixed(
            1
          )
        );
  const total = countResult.rows[0]?.total || 0;
  return {
    summary,
    status_breakdown: statusResult.rows,
    rooms: roomsResult.rows,
    allocations: allocationsResult.rows,
    pagination: pagination(options, total),
  };
};

const getAllocationReport = async (options, database = getDatabase()) => {
  const filters = buildAllocationFilters(options);
  const reportWhere = where(filters.conditions);
  const offset = (options.page - 1) * options.limit;
  const countResult = await database.query(
    `SELECT COUNT(*)::integer AS total
     FROM room_allocations ra
     ${reportWhere}`,
    filters.values
  );
  const roomBreakdownResult = await database.query(
    `SELECT r.room_number, COUNT(*)::integer AS total
     FROM room_allocations ra
     INNER JOIN rooms r ON r.id = ra.room_id
     ${reportWhere}
     GROUP BY r.room_number
     ORDER BY r.room_number`,
    filters.values
  );
  const periodResult = await database.query(
    `SELECT DATE_TRUNC('month', ra.start_date)::date AS period,
            COUNT(*)::integer AS total
     FROM room_allocations ra
     ${reportWhere}
     GROUP BY DATE_TRUNC('month', ra.start_date)
     ORDER BY period`,
    filters.values
  );
  const summaryResult = await database.query(
    `SELECT
       COUNT(*)::integer AS total_allocations,
       COUNT(*) FILTER (WHERE ra.allocation_status = 'pending')::integer AS pending_allocations,
       COUNT(*) FILTER (WHERE ra.allocation_status = 'active')::integer AS active_allocations,
       COUNT(*) FILTER (WHERE ra.allocation_status = 'completed')::integer AS completed_allocations,
       COUNT(*) FILTER (WHERE ra.allocation_status = 'cancelled')::integer AS cancelled_allocations
     FROM room_allocations ra
     ${reportWhere}`,
    filters.values
  );
  const statusResult = await database.query(
    `SELECT ra.allocation_status AS status, COUNT(*)::integer AS total
     FROM room_allocations ra
     ${reportWhere}
     GROUP BY ra.allocation_status
     ORDER BY ra.allocation_status`,
    filters.values
  );
  const recordsResult = await database.query(
    `SELECT ra.id, ra.start_date, ra.expected_end_date, ra.actual_end_date,
            ra.allocation_status, r.room_number, sp.student_number,
            u.full_name AS student_name
     FROM room_allocations ra
     INNER JOIN rooms r ON r.id = ra.room_id
     INNER JOIN student_profiles sp ON sp.id = ra.student_id
     INNER JOIN users u ON u.id = sp.user_id
     ${reportWhere}
     ORDER BY ra.start_date DESC, ra.created_at DESC
     LIMIT $${filters.values.length + 1}
     OFFSET $${filters.values.length + 2}`,
    [...filters.values, options.limit, offset]
  );
  const total = countResult.rows[0]?.total || 0;
  return {
    summary: summaryResult.rows[0],
    status_breakdown: statusResult.rows,
    room_breakdown: roomBreakdownResult.rows,
    period_breakdown: periodResult.rows,
    records: recordsResult.rows,
    pagination: pagination(options, total),
  };
};

const getStudentReport = async (options, database = getDatabase()) => {
  const values = [];
  const conditions = ["u.role = 'student'"];
  addFilter(
    values,
    conditions,
    options.status,
    (index) => `u.account_status = $${index}`
  );
  addFilter(
    values,
    conditions,
    options.roomId,
    (index) => `ra.room_id = $${index}`
  );
  addFilter(
    values,
    conditions,
    options.dateFrom,
    (index) => `u.created_at::date >= $${index}`
  );
  addFilter(
    values,
    conditions,
    options.dateTo,
    (index) => `u.created_at::date <= $${index}`
  );
  if (options.search) {
    addFilter(
      values,
      conditions,
      `%${options.search}%`,
      (index) =>
        `(u.full_name ILIKE $${index} OR sp.student_number ILIKE $${index} OR sp.course ILIKE $${index})`
    );
  }
  const reportWhere = where(conditions);
  const offset = (options.page - 1) * options.limit;
  const countResult = await database.query(
    `SELECT COUNT(*)::integer AS total
     FROM student_profiles sp
     INNER JOIN users u ON u.id = sp.user_id
     LEFT JOIN room_allocations ra
       ON ra.student_id = sp.id AND ra.allocation_status = 'active'
     ${reportWhere}`,
    values
  );
  const recordsResult = await database.query(
    `SELECT sp.id, sp.student_number, sp.course, sp.year_of_study,
            u.full_name, u.email, u.account_status,
            r.room_number, ra.allocation_status
     FROM student_profiles sp
     INNER JOIN users u ON u.id = sp.user_id
     LEFT JOIN room_allocations ra
       ON ra.student_id = sp.id AND ra.allocation_status = 'active'
     LEFT JOIN rooms r ON r.id = ra.room_id
     ${reportWhere}
     ORDER BY u.full_name
     LIMIT $${values.length + 1}
     OFFSET $${values.length + 2}`,
    [...values, options.limit, offset]
  );
  const summaryResult = await database.query(
    `SELECT
       COUNT(*)::integer AS total_students,
       COUNT(*) FILTER (WHERE u.account_status = 'active')::integer AS active_students,
       COUNT(*) FILTER (WHERE u.account_status = 'suspended')::integer AS suspended_students,
       COUNT(*) FILTER (WHERE u.account_status = 'inactive')::integer AS inactive_students,
       COUNT(*) FILTER (
         WHERE ($1::date IS NULL OR u.created_at::date >= $1::date)
           AND ($2::date IS NULL OR u.created_at::date <= $2::date)
       )::integer AS registrations_in_period,
       COUNT(ra.id)::integer AS allocated_students
     FROM student_profiles sp
     INNER JOIN users u ON u.id = sp.user_id
     LEFT JOIN room_allocations ra
       ON ra.student_id = sp.id AND ra.allocation_status = 'active'
     WHERE u.role = 'student'`,
    [options.dateFrom || null, options.dateTo || null]
  );
  const periodResult = await database.query(
    `SELECT DATE_TRUNC('month', u.created_at)::date AS period,
            COUNT(DISTINCT sp.id)::integer AS total
     FROM student_profiles sp
     INNER JOIN users u ON u.id = sp.user_id
     LEFT JOIN room_allocations ra
       ON ra.student_id = sp.id AND ra.allocation_status = 'active'
     ${reportWhere}
     GROUP BY DATE_TRUNC('month', u.created_at)
     ORDER BY period`,
    values
  );
  const total = countResult.rows[0]?.total || 0;
  return {
    summary: summaryResult.rows[0],
    period_breakdown: periodResult.rows,
    records: recordsResult.rows,
    pagination: pagination(options, total),
  };
};

const buildOperationalFilters = (options, config) => {
  const values = [];
  const conditions = [];
  [
    ['status', config.statusColumn],
    ['roomId', config.roomColumn],
    ['studentId', config.studentColumn],
    ['assignedStaffId', config.staffColumn],
    ['dateFrom', config.dateColumn && `${config.dateColumn} >=`],
    ['dateTo', config.dateColumn && `${config.dateColumn} <=`],
  ].forEach(([key, column]) => {
    if (column) {
      addFilter(
        values,
        conditions,
        options[key],
        (index) => `${column} $${index}`
      );
    }
  });
  return { values, conditions };
};

const getMaintenanceReport = async (options, database = getDatabase()) => {
  const filters = buildOperationalFilters(options, {
    statusColumn: 'mr.status =',
    roomColumn: 'mr.room_id =',
    studentColumn: 'mr.student_id =',
    staffColumn: 'mr.assigned_staff_id =',
    dateColumn: 'mr.submitted_at::date',
  });
  const reportWhere = where(filters.conditions);
  const offset = (options.page - 1) * options.limit;
  const countResult = await database.query(
    `SELECT COUNT(*)::integer AS total FROM maintenance_requests mr ${reportWhere}`,
    filters.values
  );
  const summaryResult = await database.query(
    `SELECT mr.status, COUNT(*)::integer AS total
     FROM maintenance_requests mr
     ${reportWhere}
     GROUP BY mr.status
     ORDER BY mr.status`,
    filters.values
  );
  const priorityResult = await database.query(
    `SELECT mr.priority, COUNT(*)::integer AS total
     FROM maintenance_requests mr
     ${reportWhere}
     GROUP BY mr.priority
     ORDER BY mr.priority`,
    filters.values
  );
  const totalsResult = await database.query(
    `SELECT
       COUNT(*)::integer AS total_requests,
       COUNT(*) FILTER (WHERE mr.assigned_staff_id IS NOT NULL)::integer AS assigned_requests,
       COUNT(*) FILTER (WHERE mr.assigned_staff_id IS NULL)::integer AS unassigned_requests,
       COUNT(*) FILTER (WHERE mr.status = 'completed')::integer AS completed_requests,
       ROUND(
         AVG(EXTRACT(EPOCH FROM (mr.completed_at - mr.submitted_at)) / 3600)
           FILTER (WHERE mr.status = 'completed' AND mr.completed_at IS NOT NULL),
         1
       ) AS average_completion_hours
     FROM maintenance_requests mr
     ${reportWhere}`,
    filters.values
  );
  const recordsResult = await database.query(
    `SELECT mr.id, mr.title, mr.priority, mr.status, mr.submitted_at,
            mr.completed_at, r.room_number, sp.student_number,
            student_user.full_name AS student_name,
            staff_user.full_name AS assigned_staff_name
     FROM maintenance_requests mr
     INNER JOIN rooms r ON r.id = mr.room_id
     INNER JOIN student_profiles sp ON sp.id = mr.student_id
     INNER JOIN users student_user ON student_user.id = sp.user_id
     LEFT JOIN users staff_user ON staff_user.id = mr.assigned_staff_id
     ${reportWhere}
     ORDER BY mr.submitted_at DESC
     LIMIT $${filters.values.length + 1}
     OFFSET $${filters.values.length + 2}`,
    [...filters.values, options.limit, offset]
  );
  const total = countResult.rows[0]?.total || 0;
  return {
    summary: totalsResult.rows[0],
    status_breakdown: summaryResult.rows,
    priority_breakdown: priorityResult.rows,
    records: recordsResult.rows,
    pagination: pagination(options, total),
  };
};

const getVisitorReport = async (options, database = getDatabase()) => {
  const filters = buildOperationalFilters(options, {
    statusColumn: 'v.approval_status =',
    studentColumn: 'v.student_id =',
    dateColumn: 'v.visit_date',
  });
  const reportWhere = where(filters.conditions);
  const offset = (options.page - 1) * options.limit;
  const countResult = await database.query(
    `SELECT COUNT(*)::integer AS total FROM visitors v ${reportWhere}`,
    filters.values
  );
  const summaryResult = await database.query(
    `SELECT v.approval_status AS status, COUNT(*)::integer AS total
     FROM visitors v
     ${reportWhere}
     GROUP BY v.approval_status
     ORDER BY v.approval_status`,
    filters.values
  );
  const totalsResult = await database.query(
    `SELECT
       COUNT(DISTINCT v.id)::integer AS total_visitors,
       COUNT(DISTINCT vv.id) FILTER (WHERE vv.entry_time IS NOT NULL)::integer AS entries_recorded,
       COUNT(DISTINCT vv.id) FILTER (WHERE vv.exit_time IS NOT NULL)::integer AS exits_recorded,
       COUNT(DISTINCT vv.id) FILTER (
         WHERE vv.entry_time IS NOT NULL AND vv.exit_time IS NULL
       )::integer AS currently_inside
     FROM visitors v
     LEFT JOIN visitor_verifications vv ON vv.visitor_id = v.id
     ${reportWhere}`,
    filters.values
  );
  const recordsResult = await database.query(
    `SELECT v.id, v.visitor_name, v.visit_date, v.expected_entry_time,
            v.expected_exit_time, v.approval_status, sp.student_number,
            u.full_name AS student_name, vv.entry_time, vv.exit_time,
            vv.verification_status
     FROM visitors v
     INNER JOIN student_profiles sp ON sp.id = v.student_id
     INNER JOIN users u ON u.id = sp.user_id
     LEFT JOIN visitor_verifications vv ON vv.visitor_id = v.id
     ${reportWhere}
     ORDER BY v.visit_date DESC, v.created_at DESC
     LIMIT $${filters.values.length + 1}
     OFFSET $${filters.values.length + 2}`,
    [...filters.values, options.limit, offset]
  );
  const total = countResult.rows[0]?.total || 0;
  return {
    summary: totalsResult.rows[0],
    status_breakdown: summaryResult.rows,
    records: recordsResult.rows,
    pagination: pagination(options, total),
  };
};

const getPaymentReport = async (options, database = getDatabase()) => {
  const filters = buildOperationalFilters(options, {
    statusColumn: 'p.payment_status =',
    roomColumn: 'ra.room_id =',
    studentColumn: 'p.student_id =',
    dateColumn: 'p.payment_date',
  });
  const reportWhere = where(filters.conditions);
  const offset = (options.page - 1) * options.limit;
  const countResult = await database.query(
    `SELECT COUNT(*)::integer AS total FROM payments p
     LEFT JOIN room_allocations ra ON ra.id = p.room_allocation_id
     ${reportWhere}`,
    filters.values
  );
  const summaryResult = await database.query(
    `SELECT p.payment_status AS status, COUNT(*)::integer AS total,
            COALESCE(SUM(p.amount), 0)::numeric(12,2) AS amount
     FROM payments p
     LEFT JOIN room_allocations ra ON ra.id = p.room_allocation_id
     ${reportWhere}
     GROUP BY p.payment_status
     ORDER BY p.payment_status`,
    filters.values
  );
  const methodResult = await database.query(
    `SELECT p.payment_method, COUNT(*)::integer AS total,
            COALESCE(SUM(p.amount), 0)::numeric(12,2) AS amount
     FROM payments p
     LEFT JOIN room_allocations ra ON ra.id = p.room_allocation_id
     ${reportWhere}
     GROUP BY p.payment_method
     ORDER BY p.payment_method`,
    filters.values
  );
  const totalsResult = await database.query(
    `SELECT
       COUNT(*)::integer AS total_records,
       COALESCE(SUM(p.amount), 0)::numeric(12,2) AS total_amount,
       COALESCE(SUM(p.amount) FILTER (WHERE p.payment_status = 'paid'), 0)::numeric(12,2) AS paid_amount,
       COALESCE(SUM(p.amount) FILTER (WHERE p.payment_status = 'pending'), 0)::numeric(12,2) AS pending_amount
     FROM payments p
     LEFT JOIN room_allocations ra ON ra.id = p.room_allocation_id
     ${reportWhere}`,
    filters.values
  );
  const periodResult = await database.query(
    `SELECT DATE_TRUNC('month', p.payment_date)::date AS period,
            COUNT(*)::integer AS total,
            COALESCE(SUM(p.amount), 0)::numeric(12,2) AS amount
     FROM payments p
     LEFT JOIN room_allocations ra ON ra.id = p.room_allocation_id
     ${reportWhere}
     GROUP BY DATE_TRUNC('month', p.payment_date)
     ORDER BY period`,
    filters.values
  );
  const recordsResult = await database.query(
    `SELECT p.id, p.amount, p.payment_method, p.transaction_reference,
            p.payment_date, p.payment_status, sp.student_number,
            u.full_name AS student_name, r.room_number
     FROM payments p
     INNER JOIN student_profiles sp ON sp.id = p.student_id
     INNER JOIN users u ON u.id = sp.user_id
     LEFT JOIN room_allocations ra ON ra.id = p.room_allocation_id
     LEFT JOIN rooms r ON r.id = ra.room_id
     ${reportWhere}
     ORDER BY p.payment_date DESC, p.created_at DESC
     LIMIT $${filters.values.length + 1}
     OFFSET $${filters.values.length + 2}`,
    [...filters.values, options.limit, offset]
  );
  const total = countResult.rows[0]?.total || 0;
  return {
    is_simulated: true,
    summary: totalsResult.rows[0],
    status_breakdown: summaryResult.rows,
    method_breakdown: methodResult.rows,
    period_breakdown: periodResult.rows,
    records: recordsResult.rows,
    pagination: pagination(options, total),
  };
};

module.exports = {
  getDashboard,
  getRoomReport,
  getAllocationReport,
  getStudentReport,
  getMaintenanceReport,
  getVisitorReport,
  getPaymentReport,
};
