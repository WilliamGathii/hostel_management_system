const reportModel = require('../models/report.model');
const AppError = require('../utils/app-error');

const requireUser = (user) => {
  if (!user) {
    throw new AppError('Authentication is required', 401);
  }
};

const requireAdmin = (user) => {
  requireUser(user);
  if (user.role !== 'admin') {
    throw new AppError('You do not have permission for this action', 403);
  }
};

const getDashboard = async (user) => {
  requireUser(user);
  return reportModel.getDashboard(user);
};

const getRoomReport = async (user, options) => {
  requireAdmin(user);
  return reportModel.getRoomReport(options);
};

const getAllocationReport = async (user, options) => {
  requireAdmin(user);
  return reportModel.getAllocationReport(options);
};

const getStudentReport = async (user, options) => {
  requireAdmin(user);
  return reportModel.getStudentReport(options);
};

const getMaintenanceReport = async (user, options) => {
  requireAdmin(user);
  return reportModel.getMaintenanceReport(options);
};

const getVisitorReport = async (user, options) => {
  requireAdmin(user);
  return reportModel.getVisitorReport(options);
};

const getPaymentReport = async (user, options) => {
  requireAdmin(user);
  return reportModel.getPaymentReport(options);
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
