const studentModel = require('../models/student.model');
const userModel = require('../models/user.model');
const AppError = require('../utils/app-error');
const { hashPassword } = require('../utils/password');

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
const ADMIN_EDITABLE_STUDENT_FIELDS = [
  'full_name',
  'email',
  'phone',
  'student_number',
  ...EDITABLE_PROFILE_FIELDS.filter((field) => field !== 'phone'),
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

const normalizeAdminStudentData = (studentData) => {
  const normalizedData = {};

  ADMIN_EDITABLE_STUDENT_FIELDS.forEach((field) => {
    if (!Object.hasOwn(studentData, field)) {
      return;
    }

    if (field === 'year_of_study') {
      normalizedData[field] = studentData[field] || null;
      return;
    }

    if (field === 'email') {
      normalizedData[field] = studentData[field].trim().toLowerCase();
      return;
    }

    if (field === 'full_name' || field === 'student_number') {
      normalizedData[field] = studentData[field].trim();
      return;
    }

    normalizedData[field] = normalizeOptionalText(studentData[field]);
  });

  return normalizedData;
};

const getDuplicateMessage = (error) => {
  if (error.constraint === 'users_email_key') {
    return 'Email is already registered';
  }

  if (error.constraint === 'student_profiles_student_number_key') {
    return 'Student number is already registered';
  }

  return 'Student account details already exist';
};

const runWithDuplicateHandling = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    if (error.code === '23505') {
      throw new AppError(getDuplicateMessage(error), 409);
    }

    throw error;
  }
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

const createStudent = async (user, studentData) => {
  requireRole(user, ADMIN_ROLE);

  const normalizedData = normalizeAdminStudentData(studentData);

  if (await userModel.emailExists(normalizedData.email)) {
    throw new AppError('Email is already registered', 409);
  }

  if (await userModel.studentNumberExists(normalizedData.student_number)) {
    throw new AppError('Student number is already registered', 409);
  }

  const passwordHash = await hashPassword(studentData.password);
  const account = await runWithDuplicateHandling(() =>
    userModel.createStudentAccount({
      user: {
        fullName: normalizedData.full_name,
        email: normalizedData.email,
        phone: normalizedData.phone,
        passwordHash,
        role: STUDENT_ROLE,
        accountStatus: 'active',
        mustChangePassword: true,
      },
      profile: {
        studentNumber: normalizedData.student_number,
        course: normalizedData.course,
        yearOfStudy: normalizedData.year_of_study,
        emergencyContactName: normalizedData.emergency_contact_name,
        emergencyContactPhone: normalizedData.emergency_contact_phone,
      },
    })
  );
  const student = await studentModel.findStudentById(account.profile.id);

  if (!student) {
    throw new AppError('Student account could not be loaded', 500);
  }

  return toSafeStudent(student);
};

const updateStudent = async (user, studentId, studentData) => {
  requireRole(user, ADMIN_ROLE);

  const existingStudent = await studentModel.findStudentById(studentId);

  if (!existingStudent) {
    throw new AppError('Student was not found', 404);
  }

  const normalizedData = normalizeAdminStudentData(studentData);

  if (
    normalizedData.email &&
    normalizedData.email !== existingStudent.email &&
    (await userModel.emailExists(normalizedData.email))
  ) {
    throw new AppError('Email is already registered', 409);
  }

  if (
    normalizedData.student_number &&
    normalizedData.student_number !== existingStudent.student_number &&
    (await userModel.studentNumberExists(normalizedData.student_number))
  ) {
    throw new AppError('Student number is already registered', 409);
  }

  const updatedStudent = await runWithDuplicateHandling(() =>
    studentModel.updateStudentAccount(studentId, normalizedData)
  );

  if (!updatedStudent) {
    throw new AppError('Student was not found', 404);
  }

  return toSafeStudent(updatedStudent);
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

const deleteStudentAccount = async (user, studentId) => {
  requireRole(user, ADMIN_ROLE);

  try {
    return await studentModel.withTransaction(async (database) => {
      const student = await studentModel.lockStudentById(studentId, database);

      if (!student) {
        throw new AppError('Student was not found', 404);
      }

      const usage = await studentModel.findStudentUsage(studentId, database);
      const hasLinkedRecords = [
        usage.allocation_count,
        usage.maintenance_count,
        usage.visitor_count,
        usage.payment_count,
      ].some((count) => Number(count) > 0);

      if (hasLinkedRecords) {
        throw new AppError(
          'Student has linked hostel records and cannot be deleted. Set the account to inactive instead.',
          409
        );
      }

      const deletedAccount = await studentModel.deleteStudentAccount(
        student.user_id,
        database
      );

      if (!deletedAccount) {
        throw new AppError('Student was not found', 404);
      }

      return {
        id: student.id,
        full_name: student.full_name,
        student_number: student.student_number,
      };
    });
  } catch (error) {
    if (error.code === '23503') {
      throw new AppError(
        'Student has related records and cannot be deleted. Set the account to inactive instead.',
        409
      );
    }

    throw error;
  }
};

module.exports = {
  ALLOWED_ACCOUNT_STATUSES,
  EDITABLE_PROFILE_FIELDS,
  getMyStudentProfile,
  updateMyStudentProfile,
  listStudents,
  getStudentById,
  createStudent,
  deleteStudentAccount,
  updateStudent,
  updateStudentAccountStatus,
};
