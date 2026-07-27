const request = require('supertest');

jest.mock('../../src/services/student.service', () => ({
  getMyStudentProfile: jest.fn(),
  updateMyStudentProfile: jest.fn(),
  listStudents: jest.fn(),
  getStudentById: jest.fn(),
  createStudent: jest.fn(),
  updateStudent: jest.fn(),
  updateStudentAccountStatus: jest.fn(),
}));

jest.mock('../../src/models/user.model', () => ({
  findUserById: jest.fn(),
}));

const app = require('../../src/app');
const userModel = require('../../src/models/user.model');
const studentService = require('../../src/services/student.service');
const AppError = require('../../src/utils/app-error');
const { signAuthToken } = require('../../src/utils/jwt');

const studentId = '11111111-1111-4111-8111-111111111111';
const users = {
  student: {
    id: 'student-route-user',
    full_name: 'Student User',
    email: 'student@example.com',
    role: 'student',
    account_status: 'active',
  },
  admin: {
    id: 'admin-route-user',
    full_name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    account_status: 'active',
  },
  maintenance_staff: {
    id: 'maintenance-route-user',
    full_name: 'Maintenance User',
    email: 'maintenance@example.com',
    role: 'maintenance_staff',
    account_status: 'active',
  },
  security_staff: {
    id: 'security-route-user',
    full_name: 'Security User',
    email: 'security@example.com',
    role: 'security_staff',
    account_status: 'active',
  },
};
const safeStudent = {
  id: studentId,
  user_id: users.student.id,
  student_number: 'STU001',
  full_name: users.student.full_name,
  email: users.student.email,
  phone: '+254700000001',
  role: 'student',
  account_status: 'active',
  course: 'Software Engineering',
  year_of_study: 2,
  emergency_contact_name: 'Contact User',
  emergency_contact_phone: '+254700000002',
  account_created_at: '2026-01-01T00:00:00.000Z',
};

const authorization = (user) => `Bearer ${signAuthToken(user)}`;

describe('student routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userModel.findUserById.mockImplementation(async (userId) =>
      Object.values(users).find((user) => user.id === userId)
    );
    studentService.getMyStudentProfile.mockResolvedValue(safeStudent);
    studentService.updateMyStudentProfile.mockResolvedValue(safeStudent);
    studentService.listStudents.mockResolvedValue({
      students: [safeStudent],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
    studentService.getStudentById.mockResolvedValue(safeStudent);
    studentService.createStudent.mockResolvedValue(safeStudent);
    studentService.updateStudent.mockResolvedValue(safeStudent);
    studentService.updateStudentAccountStatus.mockImplementation(
      async (_user, _studentId, accountStatus) => ({
        ...safeStudent,
        account_status: accountStatus,
      })
    );
  });

  test('GET /api/v1/students/me returns the authenticated Student profile', async () => {
    const response = await request(app)
      .get('/api/v1/students/me')
      .set('Authorization', authorization(users.student));

    expect(response.status).toBe(200);
    expect(response.body.data.student.student_number).toBe('STU001');
    expect(response.body.data.student).not.toHaveProperty('password_hash');
  });

  test('GET /api/v1/students/me rejects an unauthenticated request', async () => {
    const response = await request(app).get('/api/v1/students/me');

    expect(response.status).toBe(401);
  });

  test.each(['admin', 'maintenance_staff', 'security_staff'])(
    'GET /api/v1/students/me rejects the %s role',
    async (role) => {
      const response = await request(app)
        .get('/api/v1/students/me')
        .set('Authorization', authorization(users[role]));

      expect(response.status).toBe(403);
    }
  );

  test('a Student cannot use the Admin Student detail endpoint', async () => {
    const response = await request(app)
      .get(`/api/v1/students/${studentId}`)
      .set('Authorization', authorization(users.student));

    expect(response.status).toBe(403);
  });

  test('PATCH /api/v1/students/me updates only approved fields', async () => {
    const response = await request(app)
      .patch('/api/v1/students/me')
      .set('Authorization', authorization(users.student))
      .send({
        phone: '+254700000003',
        course: 'Computer Science',
        year_of_study: 3,
        emergency_contact_name: 'New Contact',
        emergency_contact_phone: '+254700000004',
      });

    expect(response.status).toBe(200);
    expect(studentService.updateMyStudentProfile).toHaveBeenCalledWith(
      expect.objectContaining({ id: users.student.id, role: 'student' }),
      {
        phone: '+254700000003',
        course: 'Computer Science',
        year_of_study: 3,
        emergency_contact_name: 'New Contact',
        emergency_contact_phone: '+254700000004',
      }
    );
  });

  test.each([
    'role',
    'account_status',
    'student_number',
    'id',
    'user_id',
    'email',
    'password_hash',
  ])('PATCH /api/v1/students/me rejects protected field %s', async (field) => {
    const response = await request(app)
      .patch('/api/v1/students/me')
      .set('Authorization', authorization(users.student))
      .send({ [field]: 'unsupported' });

    expect(response.status).toBe(422);
    expect(studentService.updateMyStudentProfile).not.toHaveBeenCalled();
  });

  test('PATCH /api/v1/students/me rejects an empty update', async () => {
    const response = await request(app)
      .patch('/api/v1/students/me')
      .set('Authorization', authorization(users.student))
      .send({});

    expect(response.status).toBe(422);
  });

  test('PATCH /api/v1/students/me rejects invalid profile data', async () => {
    const response = await request(app)
      .patch('/api/v1/students/me')
      .set('Authorization', authorization(users.student))
      .send({ phone: 'invalid' });

    expect(response.status).toBe(422);
    expect(response.body.message).toBe('Validation failed');
  });

  test('GET /api/v1/students returns a paginated Admin list', async () => {
    const response = await request(app)
      .get('/api/v1/students?page=2&limit=5&search=stu&status=active')
      .set('Authorization', authorization(users.admin));

    expect(response.status).toBe(200);
    expect(studentService.listStudents).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'admin' }),
      {
        page: 2,
        limit: 5,
        search: 'stu',
        status: 'active',
      }
    );
    expect(response.body.data.students[0]).not.toHaveProperty('password_hash');
  });

  test.each(['student', 'maintenance_staff', 'security_staff'])(
    'GET /api/v1/students rejects the %s role',
    async (role) => {
      const response = await request(app)
        .get('/api/v1/students')
        .set('Authorization', authorization(users[role]));

      expect(response.status).toBe(403);
    }
  );

  test.each([
    '?page=0',
    '?page=text',
    '?limit=51',
    '?limit=0',
    '?status=deleted',
  ])('GET /api/v1/students rejects invalid query %s', async (queryString) => {
    const response = await request(app)
      .get(`/api/v1/students${queryString}`)
      .set('Authorization', authorization(users.admin));

    expect(response.status).toBe(422);
    expect(studentService.listStudents).not.toHaveBeenCalled();
  });

  test('POST /api/v1/students creates a Student for an Admin', async () => {
    const response = await request(app)
      .post('/api/v1/students')
      .set('Authorization', authorization(users.admin))
      .send({
        full_name: 'New Student',
        email: 'new.student@example.com',
        phone: '+254700000010',
        student_number: 'STU010',
        password: 'Student123',
      });

    expect(response.status).toBe(201);
    expect(studentService.createStudent).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'admin' }),
      expect.objectContaining({
        full_name: 'New Student',
        email: 'new.student@example.com',
        student_number: 'STU010',
        password: 'Student123',
      })
    );
    expect(response.body.data.student).not.toHaveProperty('password_hash');
  });

  test('POST /api/v1/students rejects protected account fields', async () => {
    const response = await request(app)
      .post('/api/v1/students')
      .set('Authorization', authorization(users.admin))
      .send({
        full_name: 'New Student',
        email: 'new.student@example.com',
        student_number: 'STU010',
        password: 'Student123',
        role: 'admin',
      });

    expect(response.status).toBe(422);
    expect(studentService.createStudent).not.toHaveBeenCalled();
  });

  test.each(['student', 'maintenance_staff', 'security_staff'])(
    'POST /api/v1/students rejects the %s role',
    async (role) => {
      const response = await request(app)
        .post('/api/v1/students')
        .set('Authorization', authorization(users[role]))
        .send({
          full_name: 'New Student',
          email: 'new.student@example.com',
          student_number: 'STU010',
          password: 'Student123',
        });

      expect(response.status).toBe(403);
    }
  );

  test('GET /api/v1/students/:studentId returns one Student for an Admin', async () => {
    const response = await request(app)
      .get(`/api/v1/students/${studentId}`)
      .set('Authorization', authorization(users.admin));

    expect(response.status).toBe(200);
    expect(response.body.data.student.id).toBe(studentId);
    expect(response.body.data.student).not.toHaveProperty('password_hash');
    expect(response.body.data.student).not.toHaveProperty('room');
    expect(response.body.data.student).not.toHaveProperty('maintenance');
    expect(response.body.data.student).not.toHaveProperty('visitors');
    expect(response.body.data.student).not.toHaveProperty('payments');
  });

  test('GET /api/v1/students/:studentId returns 404 for a missing Student', async () => {
    studentService.getStudentById.mockRejectedValue(
      new AppError('Student was not found', 404)
    );

    const response = await request(app)
      .get(`/api/v1/students/${studentId}`)
      .set('Authorization', authorization(users.admin));

    expect(response.status).toBe(404);
  });

  test('PATCH /api/v1/students/:studentId edits approved fields', async () => {
    const response = await request(app)
      .patch(`/api/v1/students/${studentId}`)
      .set('Authorization', authorization(users.admin))
      .send({
        full_name: 'Updated Student',
        email: 'updated.student@example.com',
        student_number: 'STU002',
        course: 'Computer Science',
      });

    expect(response.status).toBe(200);
    expect(studentService.updateStudent).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'admin' }),
      studentId,
      {
        full_name: 'Updated Student',
        email: 'updated.student@example.com',
        student_number: 'STU002',
        course: 'Computer Science',
      }
    );
  });

  test.each(['role', 'account_status', 'password', 'password_hash', 'id'])(
    'PATCH /api/v1/students/:studentId rejects protected field %s',
    async (field) => {
      const response = await request(app)
        .patch(`/api/v1/students/${studentId}`)
        .set('Authorization', authorization(users.admin))
        .send({ [field]: 'unsupported' });

      expect(response.status).toBe(422);
      expect(studentService.updateStudent).not.toHaveBeenCalled();
    }
  );

  test('a Student cannot edit another Student account', async () => {
    const response = await request(app)
      .patch(`/api/v1/students/${studentId}`)
      .set('Authorization', authorization(users.student))
      .send({ full_name: 'Unsupported Change' });

    expect(response.status).toBe(403);
  });

  test.each(['active', 'suspended', 'inactive'])(
    'PATCH /api/v1/students/:studentId/status accepts %s',
    async (accountStatus) => {
      const response = await request(app)
        .patch(`/api/v1/students/${studentId}/status`)
        .set('Authorization', authorization(users.admin))
        .send({ account_status: accountStatus });

      expect(response.status).toBe(200);
      expect(response.body.data.student.account_status).toBe(accountStatus);
    }
  );

  test('PATCH /api/v1/students/:studentId/status rejects an invalid status', async () => {
    const response = await request(app)
      .patch(`/api/v1/students/${studentId}/status`)
      .set('Authorization', authorization(users.admin))
      .send({ account_status: 'deleted' });

    expect(response.status).toBe(422);
  });

  test('PATCH /api/v1/students/:studentId/status rejects role changes', async () => {
    const response = await request(app)
      .patch(`/api/v1/students/${studentId}/status`)
      .set('Authorization', authorization(users.admin))
      .send({ account_status: 'suspended', role: 'admin' });

    expect(response.status).toBe(422);
    expect(studentService.updateStudentAccountStatus).not.toHaveBeenCalled();
  });

  test.each(['student', 'maintenance_staff', 'security_staff'])(
    'PATCH /api/v1/students/:studentId/status rejects the %s role',
    async (role) => {
      const response = await request(app)
        .patch(`/api/v1/students/${studentId}/status`)
        .set('Authorization', authorization(users[role]))
        .send({ account_status: 'suspended' });

      expect(response.status).toBe(403);
    }
  );

  test('PATCH /api/v1/students/:studentId/status returns 404 for a missing Student', async () => {
    studentService.updateStudentAccountStatus.mockRejectedValue(
      new AppError('Student was not found', 404)
    );

    const response = await request(app)
      .patch(`/api/v1/students/${studentId}/status`)
      .set('Authorization', authorization(users.admin))
      .send({ account_status: 'suspended' });

    expect(response.status).toBe(404);
  });
});
