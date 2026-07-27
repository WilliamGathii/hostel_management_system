jest.mock('../../src/models/visitor.model', () => ({
  withTransaction: jest.fn(),
  findStudentByUserId: jest.fn(),
  createVisitor: jest.fn(),
  findVisitorById: jest.fn(),
  listVisitors: jest.fn(),
  countVisitors: jest.fn(),
  updateApproval: jest.fn(),
  createEntryVerification: jest.fn(),
  recordExit: jest.fn(),
}));

const visitorModel = require('../../src/models/visitor.model');
const visitorService = require('../../src/services/visitor.service');

const users = {
  student: { id: 'student-user', role: 'student' },
  admin: { id: 'admin-user', role: 'admin' },
  security: { id: 'security-user', role: 'security_staff' },
};
const visitor = {
  id: 'visitor-id',
  student_user_id: users.student.id,
  approval_status: 'approved',
  visit_is_expired: false,
  verification_id: null,
  entry_time: null,
  exit_time: null,
};

describe('visitor service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    visitorModel.withTransaction.mockImplementation((operation) =>
      operation({ query: jest.fn() })
    );
  });

  test('Student can view only an owned visitor', async () => {
    visitorModel.findVisitorById.mockResolvedValue({
      ...visitor,
      student_user_id: 'another-student',
    });
    await expect(
      visitorService.getVisitor(users.student, visitor.id)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('Security cannot verify a rejected visitor', async () => {
    visitorModel.findVisitorById.mockResolvedValue({
      ...visitor,
      approval_status: 'rejected',
    });
    await expect(
      visitorService.verifyEntry(users.security, visitor.id, '')
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  test('Security cannot record entry twice', async () => {
    visitorModel.findVisitorById.mockResolvedValue({
      ...visitor,
      verification_id: 'verification-id',
      entry_time: '2026-07-27T10:00:00.000Z',
    });
    await expect(
      visitorService.verifyEntry(users.security, visitor.id, '')
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  test('Security cannot record exit before entry', async () => {
    visitorModel.findVisitorById.mockResolvedValue(visitor);
    await expect(
      visitorService.verifyExit(users.security, visitor.id, '')
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  test('Admin can approve a pending visitor', async () => {
    visitorModel.findVisitorById
      .mockResolvedValueOnce({ ...visitor, approval_status: 'pending' })
      .mockResolvedValueOnce(visitor);
    await expect(
      visitorService.updateApproval(users.admin, visitor.id, 'approved')
    ).resolves.toEqual(visitor);
    expect(visitorModel.updateApproval).toHaveBeenCalled();
  });
});
