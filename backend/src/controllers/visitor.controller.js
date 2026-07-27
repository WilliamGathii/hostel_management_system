const visitorService = require('../services/visitor.service');
const { sendSuccess } = require('../utils/api-response');

const listOptions = (query) => ({
  page: query.page || 1,
  limit: query.limit || 20,
  search: query.search || '',
  approvalStatus: query.approval_status || '',
  verificationStatus: query.verification_status || '',
  visitDate: query.visit_date || '',
});

const createVisitor = async (req, res, next) => {
  try {
    const visitor = await visitorService.createVisitor(
      req.user,
      req.validatedBody
    );
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Visitor registered successfully',
      data: { visitor },
    });
  } catch (error) {
    return next(error);
  }
};

const listMyVisitors = async (req, res, next) => {
  try {
    const result = await visitorService.listMyVisitors(
      req.user,
      listOptions(req.validatedQuery)
    );
    return sendSuccess(res, {
      message: 'Visitor records retrieved successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const listVisitors = async (req, res, next) => {
  try {
    const result = await visitorService.listVisitors(
      req.user,
      listOptions(req.validatedQuery)
    );
    return sendSuccess(res, {
      message: 'Visitor records retrieved successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const getVisitor = async (req, res, next) => {
  try {
    const visitor = await visitorService.getVisitor(
      req.user,
      req.validatedParams.visitorId
    );
    return sendSuccess(res, {
      message: 'Visitor record retrieved successfully',
      data: { visitor },
    });
  } catch (error) {
    return next(error);
  }
};

const updateApproval = async (req, res, next) => {
  try {
    const visitor = await visitorService.updateApproval(
      req.user,
      req.validatedParams.visitorId,
      req.validatedBody.approval_status
    );
    return sendSuccess(res, {
      message: 'Visitor approval updated successfully',
      data: { visitor },
    });
  } catch (error) {
    return next(error);
  }
};

const verifyEntry = async (req, res, next) => {
  try {
    const visitor = await visitorService.verifyEntry(
      req.user,
      req.validatedParams.visitorId,
      req.validatedBody.notes
    );
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Visitor entry recorded successfully',
      data: { visitor },
    });
  } catch (error) {
    return next(error);
  }
};

const verifyExit = async (req, res, next) => {
  try {
    const visitor = await visitorService.verifyExit(
      req.user,
      req.validatedParams.visitorId,
      req.validatedBody.notes
    );
    return sendSuccess(res, {
      message: 'Visitor exit recorded successfully',
      data: { visitor },
    });
  } catch (error) {
    return next(error);
  }
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
