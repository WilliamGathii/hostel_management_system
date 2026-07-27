const maintenanceService = require('../services/maintenance.service');
const { sendSuccess } = require('../utils/api-response');

const optionsFromQuery = (query) => ({
  page: query.page || 1,
  limit: query.limit || 20,
  search: query.search || '',
  status: query.status || '',
  priority: query.priority || '',
  roomId: query.room_id || '',
  studentId: query.student_id || '',
  assignedStaffId: query.assigned_staff_id || '',
});

const createRequest = async (req, res, next) => {
  try {
    const maintenanceRequest = await maintenanceService.createRequest(
      req.user,
      req.validatedBody
    );
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Maintenance request submitted successfully',
      data: { maintenance_request: maintenanceRequest },
    });
  } catch (error) {
    return next(error);
  }
};

const listMyRequests = async (req, res, next) => {
  try {
    const result = await maintenanceService.listMyRequests(
      req.user,
      optionsFromQuery(req.validatedQuery)
    );
    return sendSuccess(res, {
      message: 'Maintenance requests retrieved successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const listRequests = async (req, res, next) => {
  try {
    const result = await maintenanceService.listRequests(
      req.user,
      optionsFromQuery(req.validatedQuery)
    );
    return sendSuccess(res, {
      message: 'Maintenance requests retrieved successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const getRequest = async (req, res, next) => {
  try {
    const result = await maintenanceService.getRequest(
      req.user,
      req.validatedParams.requestId
    );
    return sendSuccess(res, {
      message: 'Maintenance request retrieved successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const assignRequest = async (req, res, next) => {
  try {
    const maintenanceRequest = await maintenanceService.assignRequest(
      req.user,
      req.validatedParams.requestId,
      req.validatedBody.assigned_staff_id
    );
    return sendSuccess(res, {
      message: 'Maintenance request assigned successfully',
      data: { maintenance_request: maintenanceRequest },
    });
  } catch (error) {
    return next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const maintenanceRequest = await maintenanceService.updateStatus(
      req.user,
      req.validatedParams.requestId,
      req.validatedBody.status,
      req.validatedBody.note
    );
    return sendSuccess(res, {
      message: 'Maintenance request status updated successfully',
      data: { maintenance_request: maintenanceRequest },
    });
  } catch (error) {
    return next(error);
  }
};

const addUpdate = async (req, res, next) => {
  try {
    const update = await maintenanceService.addUpdate(
      req.user,
      req.validatedParams.requestId,
      req.validatedBody.note
    );
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Maintenance progress note added successfully',
      data: { update },
    });
  } catch (error) {
    return next(error);
  }
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
