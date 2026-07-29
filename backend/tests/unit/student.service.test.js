jest.mock('../../src/models/student.model', () => ({
  deleteStudentAccount: jest.fn(),
  findStudentByUserId: jest.fn(),
  findStudentById: jest.fn(),
  findStudentUsage: jest.fn(),
  lockStudentById: jest.fn(),
  listStudents: jest.fn(),
  countStudents: jest.fn(),
  updateStudentProfile: jest.fn(),
  updateStudentAccount: jest.fn(),
  updateStudentAccountStatus: jest.fn(),
  studentExistsById: jest.fn(),
  withTransaction: jest.fn(),
}));

jest.mock('../../src/models/user.model', () => ({
  emailExists: jest.fn(),
  studentNumberExists: jest.fn(),
  createStudentAccount: jest.fn(),
}));

jest.mock('../../src/utils/password', () => ({
  hashPassword: jest.fn(),
}));

const studentModel = require('../../src/models/student.model');
const userModel = require('../../src/models/user.model');
const studentService = require('../../src/services/student.service');
const { hashPassword } = require('../../src/utils/password');

const studentUser = {
  id: 'student-user-id',
  role: 'student',
};
const adminUser = {
  id: 'admin-user-id',
  role: 'admin',
};
const sampleStudent = {
  id: '11111111-1111-4111-8111-111111111111',
  user_id: studentUser.id,
  student_number: 'STU001',
  full_name: 'Student User',
  email: 'student@example.com',
  phone: '+254700000001',
  role: 'student',
  account_status: 'active',
  course: 'Software Engineering',
  year_of_study: 2,
  emergency_contact_name: 'Contact User',
  emergency_contact_phone: '+254700000002',
  account_created_at: new Date('2026-01-01'),
  password_hash: 'must-never-be-returned',
  room: 'must-not-be-returned',
};

describe('student service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userModel.emailExists.mockResolvedValue(false);
    userModel.studentNumberExists.mockResolvedValue(false);
    hashPassword.mockResolvedValue('hashed-password');
    studentModel.withTransaction.mockImplementation((operation) =>
      operation({ query: jest.fn() })
    );
    studentModel.findStudentUsage.mockResolvedValue({
      allocation_count: 0,
      maintenance_count: 0,
      visitor_count: 0,
      payment_count: 0,
    });
    studentModel.deleteStudentAccount.mockResolvedValue({
      id: studentUser.id,
    });
  });

  test('returns the authenticated Student profile safely', async () => {
    studentModel.findStudentByUserId.mockResolvedValue(sampleStudent);

    const result = await studentService.getMyStudentProfile(studentUser);

    expect(result.student_number).toBe('STU001');
    expect(result).not.toHaveProperty('password_hash');
    expect(result).not.toHaveProperty('room');
  });

  test('rejects non-Student access to the own-profile service', async () => {
    await expect(
      studentService.getMyStudentProfile(adminUser)
    ).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  test('returns 404 when the authenticated Student profile is missing', async () => {
    studentModel.findStudentByUserId.mockResolvedValue(null);

    await expect(
      studentService.getMyStudentProfile(studentUser)
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test('updates only approved normalized Student fields', async () => {
    studentModel.findStudentByUserId.mockResolvedValue(sampleStudent);
    studentModel.updateStudentProfile.mockResolvedValue({
      ...sampleStudent,
      phone: null,
      course: 'Computer Science',
    });

    const result = await studentService.updateMyStudentProfile(studentUser, {
      phone: '',
      course: '  Computer Science  ',
      role: 'admin',
      account_status: 'suspended',
      student_number: 'CHANGED',
    });

    expect(studentModel.updateStudentProfile).toHaveBeenCalledWith(
      studentUser.id,
      {
        phone: null,
        course: 'Computer Science',
      }
    );
    expect(result.course).toBe('Computer Science');
    expect(result).not.toHaveProperty('password_hash');
  });

  test('rejects an empty Student profile update', async () => {
    studentModel.findStudentByUserId.mockResolvedValue(sampleStudent);

    await expect(
      studentService.updateMyStudentProfile(studentUser, {})
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test('returns real pagination metadata for an Admin list', async () => {
    studentModel.listStudents.mockResolvedValue([sampleStudent]);
    studentModel.countStudents.mockResolvedValue(21);

    const result = await studentService.listStudents(adminUser, {
      page: 2,
      limit: 10,
      search: 'student',
      status: 'active',
    });

    expect(result.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 21,
      totalPages: 3,
    });
    expect(result.students[0]).not.toHaveProperty('password_hash');
  });

  test('rejects non-Admin access to the Student list', async () => {
    await expect(
      studentService.listStudents(studentUser, {
        page: 1,
        limit: 10,
      })
    ).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  test('returns one safe Student record for an Admin', async () => {
    studentModel.findStudentById.mockResolvedValue(sampleStudent);

    const result = await studentService.getStudentById(
      adminUser,
      sampleStudent.id
    );

    expect(result.id).toBe(sampleStudent.id);
    expect(result).not.toHaveProperty('password_hash');
    expect(result).not.toHaveProperty('room');
  });

  test('returns 404 for a missing Admin Student detail', async () => {
    studentModel.findStudentById.mockResolvedValue(null);

    await expect(
      studentService.getStudentById(adminUser, sampleStudent.id)
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test('allows an Admin to create an active Student account', async () => {
    userModel.createStudentAccount.mockResolvedValue({
      user: { id: studentUser.id },
      profile: { id: sampleStudent.id },
    });
    studentModel.findStudentById.mockResolvedValue(sampleStudent);

    const result = await studentService.createStudent(adminUser, {
      full_name: ' Student User ',
      email: ' STUDENT@EXAMPLE.COM ',
      phone: ' +254700000001 ',
      student_number: ' STU001 ',
      course: ' Software Engineering ',
      year_of_study: 2,
      emergency_contact_name: '',
      emergency_contact_phone: '',
      password: 'Student123',
      role: 'admin',
      account_status: 'suspended',
    });

    expect(hashPassword).toHaveBeenCalledWith('Student123');
    expect(userModel.createStudentAccount).toHaveBeenCalledWith({
      user: {
        fullName: 'Student User',
        email: 'student@example.com',
        phone: '+254700000001',
        passwordHash: 'hashed-password',
        role: 'student',
        accountStatus: 'active',
        mustChangePassword: true,
      },
      profile: {
        studentNumber: 'STU001',
        course: 'Software Engineering',
        yearOfStudy: 2,
        emergencyContactName: null,
        emergencyContactPhone: null,
      },
    });
    expect(result).not.toHaveProperty('password_hash');
  });

  test('rejects non-Admin Student creation', async () => {
    await expect(
      studentService.createStudent(studentUser, {
        email: 'student@example.com',
      })
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(userModel.createStudentAccount).not.toHaveBeenCalled();
  });

  test('rejects a duplicate email during Student creation', async () => {
    userModel.emailExists.mockResolvedValue(true);

    await expect(
      studentService.createStudent(adminUser, {
        full_name: 'Student User',
        email: 'student@example.com',
        student_number: 'STU001',
        password: 'Student123',
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'Email is already registered',
    });
  });

  test('allows an Admin to edit approved Student fields', async () => {
    studentModel.findStudentById.mockResolvedValue(sampleStudent);
    studentModel.updateStudentAccount.mockResolvedValue({
      ...sampleStudent,
      full_name: 'Updated Student',
      phone: null,
    });

    const result = await studentService.updateStudent(
      adminUser,
      sampleStudent.id,
      {
        full_name: ' Updated Student ',
        phone: '',
        role: 'admin',
        account_status: 'suspended',
        password: 'Unsupported123',
      }
    );

    expect(studentModel.updateStudentAccount).toHaveBeenCalledWith(
      sampleStudent.id,
      {
        full_name: 'Updated Student',
        phone: null,
      }
    );
    expect(result.full_name).toBe('Updated Student');
    expect(result).not.toHaveProperty('password_hash');
  });

  test('rejects non-Admin Student edits', async () => {
    await expect(
      studentService.updateStudent(studentUser, sampleStudent.id, {
        full_name: 'Updated Student',
      })
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(studentModel.updateStudentAccount).not.toHaveBeenCalled();
  });

  test.each(['active', 'suspended', 'inactive'])(
    'allows an Admin to set account status to %s',
    async (accountStatus) => {
      studentModel.findStudentById.mockResolvedValue({
        ...sampleStudent,
        account_status: accountStatus === 'active' ? 'suspended' : 'active',
      });
      studentModel.updateStudentAccountStatus.mockResolvedValue({
        ...sampleStudent,
        account_status: accountStatus,
      });

      const result = await studentService.updateStudentAccountStatus(
        adminUser,
        sampleStudent.id,
        accountStatus
      );

      expect(result.account_status).toBe(accountStatus);
    }
  );

  test('rejects an unsupported account status', async () => {
    await expect(
      studentService.updateStudentAccountStatus(
        adminUser,
        sampleStudent.id,
        'deleted'
      )
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test('rejects an unnecessary account-status request', async () => {
    studentModel.findStudentById.mockResolvedValue(sampleStudent);

    await expect(
      studentService.updateStudentAccountStatus(
        adminUser,
        sampleStudent.id,
        'active'
      )
    ).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(studentModel.updateStudentAccountStatus).not.toHaveBeenCalled();
  });

  test('returns 404 when the status target is missing', async () => {
    studentModel.findStudentById.mockResolvedValue(null);

    await expect(
      studentService.updateStudentAccountStatus(
        adminUser,
        sampleStudent.id,
        'suspended'
      )
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test('rejects non-Admin account-status updates', async () => {
    await expect(
      studentService.updateStudentAccountStatus(
        studentUser,
        sampleStudent.id,
        'suspended'
      )
    ).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  test('allows an Admin to delete a Student without linked records', async () => {
    studentModel.lockStudentById.mockResolvedValue(sampleStudent);

    const result = await studentService.deleteStudentAccount(
      adminUser,
      sampleStudent.id
    );

    expect(studentModel.findStudentUsage).toHaveBeenCalledWith(
      sampleStudent.id,
      expect.any(Object)
    );
    expect(studentModel.deleteStudentAccount).toHaveBeenCalledWith(
      sampleStudent.user_id,
      expect.any(Object)
    );
    expect(result).toEqual({
      id: sampleStudent.id,
      full_name: sampleStudent.full_name,
      student_number: sampleStudent.student_number,
    });
  });

  test('prevents deleting a Student with linked hostel records', async () => {
    studentModel.lockStudentById.mockResolvedValue(sampleStudent);
    studentModel.findStudentUsage.mockResolvedValue({
      allocation_count: 1,
      maintenance_count: 0,
      visitor_count: 0,
      payment_count: 0,
    });

    await expect(
      studentService.deleteStudentAccount(adminUser, sampleStudent.id)
    ).rejects.toMatchObject({
      statusCode: 409,
      message:
        'Student has linked hostel records and cannot be deleted. Set the account to inactive instead.',
    });
    expect(studentModel.deleteStudentAccount).not.toHaveBeenCalled();
  });

  test('returns 404 when the deletion target is missing', async () => {
    studentModel.lockStudentById.mockResolvedValue(null);

    await expect(
      studentService.deleteStudentAccount(adminUser, sampleStudent.id)
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test('rejects non-Admin Student deletion', async () => {
    await expect(
      studentService.deleteStudentAccount(studentUser, sampleStudent.id)
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(studentModel.withTransaction).not.toHaveBeenCalled();
  });
});
