const request = require('supertest');

jest.mock('../../src/services/announcement.service', () => ({
  listAnnouncements: jest.fn(),
  createAnnouncement: jest.fn(),
  updateAnnouncement: jest.fn(),
  deleteAnnouncement: jest.fn(),
}));
jest.mock('../../src/services/notification.service', () => ({
  listNotifications: jest.fn(),
  markRead: jest.fn(),
  markAllRead: jest.fn(),
  createNotification: jest.fn(),
}));
jest.mock('../../src/models/user.model', () => ({
  findUserById: jest.fn(),
}));

const app = require('../../src/app');
const userModel = require('../../src/models/user.model');
const announcementService = require('../../src/services/announcement.service');
const notificationService = require('../../src/services/notification.service');
const { signAuthToken } = require('../../src/utils/jwt');

const announcementId = '11111111-1111-4111-8111-111111111111';
const notificationId = '22222222-2222-4222-8222-222222222222';
const users = {
  student: {
    id: 'announcement-student-user',
    role: 'student',
    account_status: 'active',
  },
  admin: {
    id: 'announcement-admin-user',
    role: 'admin',
    account_status: 'active',
  },
  maintenance_staff: {
    id: 'announcement-maintenance-user',
    role: 'maintenance_staff',
    account_status: 'active',
  },
  security_staff: {
    id: 'announcement-security-user',
    role: 'security_staff',
    account_status: 'active',
  },
};
const announcement = {
  id: announcementId,
  title: 'Water interruption',
  message: 'Water service will pause for maintenance.',
  target_role: null,
  status: 'published',
};
const notification = {
  id: notificationId,
  title: 'Water interruption',
  read_at: null,
};
const authorization = (user) => `Bearer ${signAuthToken(user)}`;

describe('announcement and notification routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userModel.findUserById.mockImplementation(async (userId) =>
      Object.values(users).find((user) => user.id === userId)
    );
    announcementService.listAnnouncements.mockResolvedValue({
      announcements: [announcement],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    announcementService.createAnnouncement.mockResolvedValue(announcement);
    announcementService.updateAnnouncement.mockResolvedValue(announcement);
    announcementService.deleteAnnouncement.mockResolvedValue(announcementId);
    notificationService.listNotifications.mockResolvedValue({
      notifications: [notification],
      unread_count: 1,
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    notificationService.markRead.mockResolvedValue({
      ...notification,
      read_at: '2026-07-27T12:00:00.000Z',
    });
    notificationService.markAllRead.mockResolvedValue(1);
  });

  test.each(Object.keys(users))(
    '%s can list relevant announcements',
    async (role) => {
      const response = await request(app)
        .get('/api/v1/announcements')
        .set('Authorization', authorization(users[role]));
      expect(response.status).toBe(200);
    }
  );

  test('Admin can create an announcement', async () => {
    const response = await request(app)
      .post('/api/v1/announcements')
      .set('Authorization', authorization(users.admin))
      .send({
        title: 'Water interruption',
        message: 'Water service will pause for maintenance.',
        target_role: 'all',
        status: 'published',
      });
    expect(response.status).toBe(201);
  });

  test('Student cannot create an announcement', async () => {
    const response = await request(app)
      .post('/api/v1/announcements')
      .set('Authorization', authorization(users.student))
      .send({
        title: 'Water interruption',
        message: 'Water service will pause for maintenance.',
        target_role: 'all',
        status: 'published',
      });
    expect(response.status).toBe(403);
  });

  test('Admin can update and delete an announcement', async () => {
    const updateResponse = await request(app)
      .patch(`/api/v1/announcements/${announcementId}`)
      .set('Authorization', authorization(users.admin))
      .send({ status: 'archived' });
    expect(updateResponse.status).toBe(200);

    const deleteResponse = await request(app)
      .delete(`/api/v1/announcements/${announcementId}`)
      .set('Authorization', authorization(users.admin));
    expect(deleteResponse.status).toBe(200);
  });

  test('authenticated user can list own notifications', async () => {
    const response = await request(app)
      .get('/api/v1/notifications?unread_only=true')
      .set('Authorization', authorization(users.student));
    expect(response.status).toBe(200);
    expect(response.body.data.unread_count).toBe(1);
  });

  test('authenticated user can mark one notification as read', async () => {
    const response = await request(app)
      .patch(`/api/v1/notifications/${notificationId}/read`)
      .set('Authorization', authorization(users.student));
    expect(response.status).toBe(200);
  });

  test('authenticated user can mark all notifications as read', async () => {
    const response = await request(app)
      .patch('/api/v1/notifications/read-all')
      .set('Authorization', authorization(users.student));
    expect(response.status).toBe(200);
    expect(response.body.data.updated_count).toBe(1);
  });

  test('announcement and notification routes require authentication', async () => {
    expect((await request(app).get('/api/v1/announcements')).status).toBe(401);
    expect((await request(app).get('/api/v1/notifications')).status).toBe(401);
  });
});
