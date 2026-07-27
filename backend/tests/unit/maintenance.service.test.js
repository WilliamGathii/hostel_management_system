jest.mock('../../src/models/maintenance.model', () => ({
  withTransaction: jest.fn(),
  findStudentByUserId: jest.fn(),
  findActiveAllocation: jest.fn(),
  findMaintenanceStaff: jest.fn(),
  listMaintenanceStaff: jest.fn(),
  createRequest: jest.fn(),
  findRequestById: jest.fn(),
  listRequests: jest.fn(),
  countRequests: jest.fn(),
  listUpdates: jest.fn(),
  assignRequest: jest.fn(),
  updateRequestStatus: jest.fn(),
  insertUpdate: jest.fn(),
}));

const maintenanceModel = require('../../src/models/maintenance.model');
const maintenanceService = require('../../src/services/maintenance.service');

const users = {
  student: { id: 'student-user', role: 'student' },
  admin: { id: 'admin-user', role: 'admin' },
  maintenance: { id: 'staff-user', role: 'maintenance_staff' },
};
const request = {
  id: 'request-id',
  student_user_id: users.student.id,
  assigned_staff_id: users.maintenance.id,
  status: 'assigned',
};

describe('maintenance service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    maintenanceModel.withTransaction.mockImplementation((operation) =>
      operation({ query: jest.fn() })
    );
  });

  test('Student request must use an allocated room', async () => {
    maintenanceModel.findStudentByUserId.mockResolvedValue({
      id: 'student-profile',
    });
    maintenanceModel.findActiveAllocation.mockResolvedValue(null);

    await expect(
      maintenanceService.createRequest(users.student, {
        room_id: 'room-id',
        title: 'Broken tap',
        description: 'Water is leaking from the tap.',
        priority: 'high',
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('Student can create a request for the allocated room', async () => {
    maintenanceModel.findStudentByUserId.mockResolvedValue({
      id: 'student-profile',
    });
    maintenanceModel.findActiveAllocation.mockResolvedValue({
      id: 'allocation-id',
    });
    maintenanceModel.createRequest.mockResolvedValue(request);

    await expect(
      maintenanceService.createRequest(users.student, {
        room_id: 'room-id',
        title: ' Broken tap ',
        description: ' Water is leaking from the tap. ',
        priority: 'high',
      })
    ).resolves.toEqual(request);
  });

  test('Maintenance Staff cannot update a request assigned to another user', async () => {
    maintenanceModel.findRequestById.mockResolvedValue({
      ...request,
      assigned_staff_id: 'another-staff',
    });

    await expect(
      maintenanceService.updateStatus(
        users.maintenance,
        request.id,
        'in_progress',
        ''
      )
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('Maintenance Staff can move an assigned request to in progress', async () => {
    maintenanceModel.findRequestById
      .mockResolvedValueOnce(request)
      .mockResolvedValueOnce({ ...request, status: 'in_progress' });

    await expect(
      maintenanceService.updateStatus(
        users.maintenance,
        request.id,
        'in_progress',
        'Work started'
      )
    ).resolves.toMatchObject({ status: 'in_progress' });
    expect(maintenanceModel.updateRequestStatus).toHaveBeenCalled();
  });

  test('invalid status transitions are rejected', async () => {
    maintenanceModel.findRequestById.mockResolvedValue(request);

    await expect(
      maintenanceService.updateStatus(
        users.maintenance,
        request.id,
        'rejected',
        ''
      )
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});
