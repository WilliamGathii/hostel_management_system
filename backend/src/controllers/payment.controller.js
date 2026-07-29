const paymentService = require('../services/payment.service');
const { sendSuccess } = require('../utils/api-response');

const paymentOptions = (query) => ({
  page: query.page || 1,
  limit: query.limit || 20,
  search: query.search || '',
  status: query.status || '',
  studentId: query.student_id || '',
  roomId: query.room_id || '',
  dateFrom: query.date_from || '',
  dateTo: query.date_to || '',
});

const listMyPayments = async (req, res, next) => {
  try {
    const result = await paymentService.listMyPayments(
      req.user,
      paymentOptions(req.validatedQuery)
    );
    return sendSuccess(res, {
      message: 'Payment records retrieved successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const listPayments = async (req, res, next) => {
  try {
    const result = await paymentService.listPayments(
      req.user,
      paymentOptions(req.validatedQuery)
    );
    return sendSuccess(res, {
      message: 'Payment records retrieved successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const getPayment = async (req, res, next) => {
  try {
    const result = await paymentService.getPayment(
      req.user,
      req.validatedParams.paymentId
    );
    return sendSuccess(res, {
      message: 'Payment record retrieved successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const result = await paymentService.createPayment(
      req.user,
      req.validatedBody
    );
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Simulated payment recorded successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const updatePaymentStatus = async (req, res, next) => {
  try {
    const result = await paymentService.updatePaymentStatus(
      req.user,
      req.validatedParams.paymentId,
      req.validatedBody
    );
    return sendSuccess(res, {
      message: 'Payment status updated successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listMyPayments,
  listPayments,
  getPayment,
  createPayment,
  updatePaymentStatus,
};
