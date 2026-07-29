const reportService = require('../services/report.service');
const { sendSuccess } = require('../utils/api-response');

const options = (query) => ({
  page: query.page || 1,
  limit: query.limit || 50,
  search: query.search || '',
  status: query.status || '',
  roomId: query.room_id || '',
  studentId: query.student_id || '',
  assignedStaffId: query.assigned_staff_id || '',
  dateFrom: query.date_from || '',
  dateTo: query.date_to || '',
});

const getDashboard = async (req, res, next) => {
  try {
    const stats = await reportService.getDashboard(req.user);
    return sendSuccess(res, {
      message: 'Dashboard statistics retrieved successfully',
      data: { stats },
    });
  } catch (error) {
    return next(error);
  }
};

const reportHandler =
  (serviceMethod, responseField, message) => async (req, res, next) => {
    try {
      const report = await serviceMethod(req.user, options(req.validatedQuery));
      return sendSuccess(res, {
        message,
        data: { [responseField]: report },
      });
    } catch (error) {
      return next(error);
    }
  };

const getRoomReport = reportHandler(
  reportService.getRoomReport,
  'room_report',
  'Room report retrieved successfully'
);
const getAllocationReport = reportHandler(
  reportService.getAllocationReport,
  'allocation_report',
  'Room allocation report retrieved successfully'
);
const getStudentReport = reportHandler(
  reportService.getStudentReport,
  'student_report',
  'Student report retrieved successfully'
);
const getMaintenanceReport = reportHandler(
  reportService.getMaintenanceReport,
  'maintenance_report',
  'Maintenance report retrieved successfully'
);
const getVisitorReport = reportHandler(
  reportService.getVisitorReport,
  'visitor_report',
  'Visitor report retrieved successfully'
);
const getPaymentReport = reportHandler(
  reportService.getPaymentReport,
  'payment_report',
  'Payment report retrieved successfully'
);

module.exports = {
  getDashboard,
  getRoomReport,
  getAllocationReport,
  getStudentReport,
  getMaintenanceReport,
  getVisitorReport,
  getPaymentReport,
};
