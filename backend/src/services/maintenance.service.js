const maintenanceModel = require('../models/maintenance.model');
const notificationService = require('./notification.service');
const AppError = require('../utils/app-error');

const TERMINAL_STATUSES = new Set(['completed', 'rejected', 'cancelled']);
const ADMIN_TRANSITIONS = {
  submitted: new Set(['assigned', 'rejected', 'cancelled']),
  assigned: new Set(['in_progress', 'completed', 'rejected', 'cancelled']),
  in_progress: new Set(['completed', 'cancelled']),
};
const STAFF_TRANSITIONS = {
  assigned: new Set(['in_progress', 'completed']),
  in_progress: new Set(['completed']),
};

const normalizeText = (value) =>
  value === null || value === undefined ? null : value.trim() || null;

const requireRole = (user, ...roles) => {
  if (!user) {
    throw new AppError('Authentication is required', 401);
  }
  if (!roles.includes(user.role)) {
    throw new AppError('You do not have permission for this action', 403);
  }
};

const createRequest = async (user, requestData) => {
  requireRole(user, 'student');
  const student = await maintenanceModel.findStudentByUserId(user.id);

  if (!student) {
    throw new AppError('Student profile was not found', 404);
  }

  const allocation = await maintenanceModel.findActiveAllocation(
    student.id,
    requestData.room_id
  );

  if (!allocation) {
    throw new AppError(
      'Maintenance requests must use your allocated room',
      403
    );
  }

  return maintenanceModel.createRequest({
    student_id: student.id,
    room_id: requestData.room_id,
    title: requestData.title.trim(),
    description: requestData.description.trim(),
    priority: requestData.priority,
  });
};

const listMyRequests = async (user, options) => {
  requireRole(user, 'student');
  const query = { ...options, ownerUserId: user.id };
  const requests = await maintenanceModel.listRequests(query);
  const total = await maintenanceModel.countRequests(query);

  return {
    maintenance_requests: requests,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / options.limit),
    },
  };
};

const listRequests = async (user, options) => {
  requireRole(user, 'admin', 'maintenance_staff');
  const query =
    user.role === 'maintenance_staff'
      ? { ...options, assignedStaffId: user.id }
      : options;
  const requests = await maintenanceModel.listRequests(query);
  const total = await maintenanceModel.countRequests(query);

  return {
    maintenance_requests: requests,
    maintenance_staff:
      user.role === 'admin'
        ? await maintenanceModel.listMaintenanceStaff()
        : undefined,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / options.limit),
    },
  };
};

const canViewRequest = (user, request) => {
  if (user.role === 'admin') {
    return true;
  }
  if (user.role === 'student') {
    return request.student_user_id === user.id;
  }
  if (user.role === 'maintenance_staff') {
    return request.assigned_staff_id === user.id;
  }
  return false;
};

const getRequest = async (user, requestId) => {
  requireRole(user, 'student', 'admin', 'maintenance_staff');
  const request = await maintenanceModel.findRequestById(requestId);

  if (!request) {
    throw new AppError('Maintenance request was not found', 404);
  }
  if (!canViewRequest(user, request)) {
    throw new AppError('You do not have access to this request', 403);
  }

  return {
    maintenance_request: request,
    updates: await maintenanceModel.listUpdates(requestId),
  };
};

const assignRequest = async (user, requestId, staffId) => {
  requireRole(user, 'admin');

  return maintenanceModel.withTransaction(async (database) => {
    const request = await maintenanceModel.findRequestById(
      requestId,
      database,
      true
    );
    if (!request) {
      throw new AppError('Maintenance request was not found', 404);
    }
    if (TERMINAL_STATUSES.has(request.status)) {
      throw new AppError('A closed request cannot be assigned', 409);
    }

    const staff = await maintenanceModel.findMaintenanceStaff(
      staffId,
      database
    );
    if (!staff) {
      throw new AppError('Active Maintenance Staff account was not found', 404);
    }

    await maintenanceModel.assignRequest(requestId, staffId, user.id, database);
    await notificationService.createNotification(
      {
        user_id: staffId,
        notification_type: 'maintenance_assignment',
        title: 'Maintenance request assigned',
        message: `You have been assigned the request "${request.title}".`,
        related_entity_type: 'maintenance_request',
        related_entity_id: requestId,
      },
      database
    );
    return maintenanceModel.findRequestById(requestId, database);
  });
};

const updateStatus = async (user, requestId, status, note) => {
  requireRole(user, 'admin', 'maintenance_staff');

  return maintenanceModel.withTransaction(async (database) => {
    const request = await maintenanceModel.findRequestById(
      requestId,
      database,
      true
    );
    if (!request) {
      throw new AppError('Maintenance request was not found', 404);
    }
    if (
      user.role === 'maintenance_staff' &&
      request.assigned_staff_id !== user.id
    ) {
      throw new AppError('This request is not assigned to you', 403);
    }

    const transitions =
      user.role === 'admin' ? ADMIN_TRANSITIONS : STAFF_TRANSITIONS;
    if (!transitions[request.status]?.has(status)) {
      throw new AppError(
        `Status cannot change from ${request.status} to ${status}`,
        409
      );
    }

    await maintenanceModel.updateRequestStatus(
      requestId,
      status,
      user.id,
      normalizeText(note),
      database
    );
    await notificationService.createNotification(
      {
        user_id: request.student_user_id,
        notification_type: 'maintenance_status',
        title: 'Maintenance request updated',
        message: `Your request "${request.title}" is now ${status.replaceAll('_', ' ')}.`,
        related_entity_type: 'maintenance_request',
        related_entity_id: requestId,
      },
      database
    );
    return maintenanceModel.findRequestById(requestId, database);
  });
};

const addUpdate = async (user, requestId, note) => {
  requireRole(user, 'admin', 'maintenance_staff');

  return maintenanceModel.withTransaction(async (database) => {
    const request = await maintenanceModel.findRequestById(
      requestId,
      database,
      true
    );
    if (!request) {
      throw new AppError('Maintenance request was not found', 404);
    }
    if (
      user.role === 'maintenance_staff' &&
      request.assigned_staff_id !== user.id
    ) {
      throw new AppError('This request is not assigned to you', 403);
    }

    const updateId = await maintenanceModel.insertUpdate(
      {
        request_id: requestId,
        updated_by: user.id,
        status: request.status,
        note: note.trim(),
      },
      database
    );
    const updates = await maintenanceModel.listUpdates(requestId, database);
    return updates.find((update) => update.id === updateId);
  });
};

module.exports = {
  createRequest,
  listMyRequests,
  listRequests,
  getRequest,
  assignRequest,
  updateStatus,
  addUpdate,
};
