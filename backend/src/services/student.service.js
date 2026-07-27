const studentModel = require('../models/student.model');
const AppError = require('../utils/app-error');

const STUDENT_ROLE = 'student';
const ADMIN_ROLE = 'admin';
const ALLOWED_ACCOUNT_STATUSES = new Set(['active', 'suspended', 'inactive']);
const EDITABLE_PROFILE_FIELDS = [
  'phone',
  'course',
  'year_of_study',
  'emergency_contact_name',
  'emergency_contact_phone',
];
const SAFE_STUDENT_FIELDS = [
  'id',
  'user_id',
  'student_number',
  'course',
  'year_of_study',
  'emergency_contact_name',
  'emergency_contact_phone',
  'profile_created_at',
  'profile_updated_at',
  'full_name',
  'email',
  'phone',
  'role',
  'account_status',
  'last_login_at',
  'account_created_at',
  'account_updated_at',
];

const requireRole = (user, role) => {
  if (!user) {
    throw new AppError('Authentication is required', 401);
  }

  if (user.role !== role) {
    throw new AppError('You do not have permission for this action', 403);
  }
};

const normalizeOptionalText = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue || null;
};

const normalizeProfileUpdate = (profileData) => {
  const normalizedData = {};

  EDITABLE_PROFILE_FIELDS.forEach((field) => {
    if (!Object.hasOwn(profileData, field)) {
      return;
    }

    normalizedData[field] =
      field === 'year_of_study'
        ? profileData[field] || null
        : normalizeOptionalText(profileData[field]);
  });

  return normalizedData;
};

const toSafeStudent = (student) =>
  SAFE_STUDENT_FIELDS.reduce((safeStudent, field) => {
    if (Object.hasOwn(student, field)) {
      safeStudent[field] = student[field];
    }

    return safeStudent;
  }, {});

const getMyStudentProfile = async (user) => {
  requireRole(user, STUDENT_ROLE);

  const student = await studentModel.findStudentByUserId(user.id);

  if (!student) {
    throw new AppError('Student profile was not found', 404);
  }

  return toSafeStudent(student);
};

const updateMyStudentProfile = async (user, profileData) => {
  requireRole(user, STUDENT_ROLE);

  const existingStudent = await studentModel.findStudentByUserId(user.id);

  if (!existingStudent) {
    throw new AppError('Student profile was not found', 404);
  }

  const normalizedData = normalizeProfileUpdate(profileData);

  if (Object.keys(normalizedData).length === 0) {
    throw new AppError('Provide at least one profile field to update', 400);
  }

  const updatedStudent = await studentModel.updateStudentProfile(
    user.id,
    normalizedData
  );

  if (!updatedStudent) {
    throw new AppError('Student profile was not found', 404);
  }

  return toSafeStudent(updatedStudent);
};

const listStudents = async (user, options) => {
  requireRole(user, ADMIN_ROLE);

  const students = await studentModel.listStudents(options);
  const total = await studentModel.countStudents(options);
  const totalPages = total === 0 ? 0 : Math.ceil(total / options.limit);

  return {
    students: students.map(toSafeStudent),
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages,
    },
  };
};

const getStudentById = async (user, studentId) => {
  requireRole(user, ADMIN_ROLE);

  const student = await studentModel.findStudentById(studentId);

  if (!student) {
    throw new AppError('Student was not found', 404);
  }

  return toSafeStudent(student);
};

const updateStudentAccountStatus = async (user, studentId, accountStatus) => {
  requireRole(user, ADMIN_ROLE);

  if (!ALLOWED_ACCOUNT_STATUSES.has(accountStatus)) {
    throw new AppError('Account status is not supported', 400);
  }

  const existingStudent = await studentModel.findStudentById(studentId);

  if (!existingStudent) {
    throw new AppError('Student was not found', 404);
  }

  if (existingStudent.account_status === accountStatus) {
    throw new AppError('Student account already has this status', 409);
  }

  const updatedStudent = await studentModel.updateStudentAccountStatus(
    studentId,
    accountStatus
  );

  if (!updatedStudent) {
    throw new AppError('Student was not found', 404);
  }

  return toSafeStudent(updatedStudent);
};

module.exports = {
  ALLOWED_ACCOUNT_STATUSES,
  EDITABLE_PROFILE_FIELDS,
  getMyStudentProfile,
  updateMyStudentProfile,
  listStudents,
  getStudentById,
  updateStudentAccountStatus,
};
