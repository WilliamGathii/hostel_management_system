const studentService = require('../services/student.service');
const { sendSuccess } = require('../utils/api-response');

const getMyProfile = async (req, res, next) => {
  try {
    const student = await studentService.getMyStudentProfile(req.user);

    return sendSuccess(res, {
      message: 'Student profile retrieved successfully',
      data: { student },
    });
  } catch (error) {
    return next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const student = await studentService.updateMyStudentProfile(
      req.user,
      req.validatedBody
    );

    return sendSuccess(res, {
      message: 'Student profile updated successfully',
      data: { student },
    });
  } catch (error) {
    return next(error);
  }
};

const listStudents = async (req, res, next) => {
  try {
    const options = {
      page: req.validatedQuery.page || 1,
      limit: req.validatedQuery.limit || 10,
      search: req.validatedQuery.search || '',
      status: req.validatedQuery.status || '',
    };
    const result = await studentService.listStudents(req.user, options);

    return sendSuccess(res, {
      message: 'Students retrieved successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const getStudent = async (req, res, next) => {
  try {
    const student = await studentService.getStudentById(
      req.user,
      req.validatedParams.studentId
    );

    return sendSuccess(res, {
      message: 'Student retrieved successfully',
      data: { student },
    });
  } catch (error) {
    return next(error);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const student = await studentService.createStudent(
      req.user,
      req.validatedBody
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Student account created successfully',
      data: { student },
    });
  } catch (error) {
    return next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const student = await studentService.updateStudent(
      req.user,
      req.validatedParams.studentId,
      req.validatedBody
    );

    return sendSuccess(res, {
      message: 'Student account updated successfully',
      data: { student },
    });
  } catch (error) {
    return next(error);
  }
};

const updateStudentStatus = async (req, res, next) => {
  try {
    const student = await studentService.updateStudentAccountStatus(
      req.user,
      req.validatedParams.studentId,
      req.validatedBody.account_status
    );

    return sendSuccess(res, {
      message: 'Student account status updated successfully',
      data: { student },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  updateStudentStatus,
};
