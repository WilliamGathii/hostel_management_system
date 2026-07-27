const visitorModel = require('../models/visitor.model');
const notificationService = require('./notification.service');
const AppError = require('../utils/app-error');

const requireRole = (user, ...roles) => {
  if (!user) {
    throw new AppError('Authentication is required', 401);
  }
  if (!roles.includes(user.role)) {
    throw new AppError('You do not have permission for this action', 403);
  }
};

const normalizeText = (value) =>
  value === null || value === undefined ? null : value.trim() || null;

const createVisitor = async (user, visitorData) => {
  requireRole(user, 'student');
  const student = await visitorModel.findStudentByUserId(user.id);
  if (!student) {
    throw new AppError('Student profile was not found', 404);
  }

  return visitorModel.createVisitor({
    student_id: student.id,
    visitor_name: visitorData.visitor_name.trim(),
    visitor_phone: visitorData.visitor_phone.trim(),
    identification_type: normalizeText(visitorData.identification_type),
    identification_number: normalizeText(visitorData.identification_number),
    visit_date: visitorData.visit_date,
    expected_entry_time: visitorData.expected_entry_time || null,
    expected_exit_time: visitorData.expected_exit_time || null,
    purpose: visitorData.purpose.trim(),
  });
};

const buildListResult = async (options) => {
  const visitors = await visitorModel.listVisitors(options);
  const total = await visitorModel.countVisitors(options);
  return {
    visitors,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / options.limit),
    },
  };
};

const listMyVisitors = async (user, options) => {
  requireRole(user, 'student');
  return buildListResult({ ...options, ownerUserId: user.id });
};

const listVisitors = async (user, options) => {
  requireRole(user, 'admin', 'security_staff');
  return buildListResult({
    ...options,
    securityView: user.role === 'security_staff',
  });
};

const canView = (user, visitor) => {
  if (user.role === 'admin') {
    return true;
  }
  if (user.role === 'student') {
    return visitor.student_user_id === user.id;
  }
  return (
    user.role === 'security_staff' && visitor.approval_status === 'approved'
  );
};

const getVisitor = async (user, visitorId) => {
  requireRole(user, 'student', 'admin', 'security_staff');
  const visitor = await visitorModel.findVisitorById(visitorId);
  if (!visitor) {
    throw new AppError('Visitor record was not found', 404);
  }
  if (!canView(user, visitor)) {
    throw new AppError('You do not have access to this visitor record', 403);
  }
  return visitor;
};

const updateApproval = async (user, visitorId, approvalStatus) => {
  requireRole(user, 'admin');

  return visitorModel.withTransaction(async (database) => {
    const visitor = await visitorModel.findVisitorById(
      visitorId,
      database,
      true
    );
    if (!visitor) {
      throw new AppError('Visitor record was not found', 404);
    }
    if (visitor.approval_status !== 'pending') {
      throw new AppError('Only a pending visitor can be reviewed', 409);
    }
    if (visitor.visit_is_expired && approvalStatus === 'approved') {
      throw new AppError('An expired visit cannot be approved', 409);
    }

    await visitorModel.updateApproval(
      visitorId,
      approvalStatus,
      user.id,
      database
    );
    await notificationService.createNotification(
      {
        user_id: visitor.student_user_id,
        notification_type: 'visitor_approval',
        title: 'Visitor request reviewed',
        message: `${visitor.visitor_name}'s visit was ${approvalStatus}.`,
        related_entity_type: 'visitor',
        related_entity_id: visitorId,
      },
      database
    );
    return visitorModel.findVisitorById(visitorId, database);
  });
};

const verifyEntry = async (user, visitorId, notes) => {
  requireRole(user, 'security_staff');

  return visitorModel.withTransaction(async (database) => {
    const visitor = await visitorModel.findVisitorById(
      visitorId,
      database,
      true
    );
    if (!visitor) {
      throw new AppError('Visitor record was not found', 404);
    }
    if (visitor.approval_status !== 'approved' || visitor.visit_is_expired) {
      throw new AppError('Only an approved current visitor can enter', 409);
    }
    if (visitor.verification_id || visitor.entry_time) {
      throw new AppError('Visitor entry has already been recorded', 409);
    }

    await visitorModel.createEntryVerification(
      visitorId,
      user.id,
      normalizeText(notes),
      database
    );
    return visitorModel.findVisitorById(visitorId, database);
  });
};

const verifyExit = async (user, visitorId, notes) => {
  requireRole(user, 'security_staff');

  return visitorModel.withTransaction(async (database) => {
    const visitor = await visitorModel.findVisitorById(
      visitorId,
      database,
      true
    );
    if (!visitor) {
      throw new AppError('Visitor record was not found', 404);
    }
    if (!visitor.entry_time) {
      throw new AppError('Visitor entry must be recorded before exit', 409);
    }
    if (visitor.exit_time) {
      throw new AppError('Visitor exit has already been recorded', 409);
    }

    await visitorModel.recordExit(visitorId, normalizeText(notes), database);
    return visitorModel.findVisitorById(visitorId, database);
  });
};

module.exports = {
  createVisitor,
  listMyVisitors,
  listVisitors,
  getVisitor,
  updateApproval,
  verifyEntry,
  verifyExit,
};
