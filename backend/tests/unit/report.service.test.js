jest.mock('../../src/models/report.model', () => ({
  getDashboard: jest.fn(),
  getRoomReport: jest.fn(),
  getAllocationReport: jest.fn(),
  getStudentReport: jest.fn(),
  getMaintenanceReport: jest.fn(),
  getVisitorReport: jest.fn(),
  getPaymentReport: jest.fn(),
}));

const reportModel = require('../../src/models/report.model');
const reportService = require('../../src/services/report.service');

const users = {
  student: { id: 'student-user', role: 'student' },
  admin: { id: 'admin-user', role: 'admin' },
  security: { id: 'security-user', role: 'security_staff' },
};
const options = { page: 1, limit: 50 };

describe('report service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    reportModel.getDashboard.mockResolvedValue({ unread_notifications: 0 });
    reportModel.getRoomReport.mockResolvedValue({ records: [] });
    reportModel.getAllocationReport.mockResolvedValue({ records: [] });
  });

  test.each(Object.values(users))(
    '$role can view role-specific dashboard statistics',
    async (user) => {
      await expect(reportService.getDashboard(user)).resolves.toBeDefined();
      expect(reportModel.getDashboard).toHaveBeenCalledWith(user);
    }
  );

  test('Admin can view operational reports', async () => {
    await expect(
      reportService.getRoomReport(users.admin, options)
    ).resolves.toEqual({ records: [] });
  });

  test('Student cannot view operational reports', async () => {
    await expect(
      reportService.getRoomReport(users.student, options)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('Admin can view the separate allocation report', async () => {
    await expect(
      reportService.getAllocationReport(users.admin, options)
    ).resolves.toEqual({ records: [] });
  });

  test.each([users.student, users.security])(
    '$role cannot view payment reports',
    async (user) => {
      await expect(
        reportService.getPaymentReport(user, options)
      ).rejects.toMatchObject({ statusCode: 403 });
    }
  );
});
