jest.mock('../../src/models/announcement.model', () => ({
  withTransaction: jest.fn(),
  findAnnouncementById: jest.fn(),
  listAnnouncements: jest.fn(),
  countAnnouncements: jest.fn(),
  createAnnouncement: jest.fn(),
  updateAnnouncement: jest.fn(),
  createRecipientsAndNotifications: jest.fn(),
  deleteAnnouncement: jest.fn(),
}));

const announcementModel = require('../../src/models/announcement.model');
const announcementService = require('../../src/services/announcement.service');

const admin = { id: 'admin-user', role: 'admin' };
const student = { id: 'student-user', role: 'student' };
const announcement = {
  id: 'announcement-id',
  title: 'Notice',
  message: 'Hostel notice',
  target_role: null,
  status: 'published',
  published_at: new Date(),
};

describe('announcement service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    announcementModel.withTransaction.mockImplementation((operation) =>
      operation({ query: jest.fn() })
    );
  });

  test('non-Admin users cannot create announcements', async () => {
    await expect(
      announcementService.createAnnouncement(student, {
        title: 'Notice',
        message: 'Hostel notice',
        target_role: 'all',
        status: 'published',
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('publishing creates recipients and in-app notifications', async () => {
    announcementModel.createAnnouncement.mockResolvedValue(announcement.id);
    announcementModel.findAnnouncementById.mockResolvedValue(announcement);

    await expect(
      announcementService.createAnnouncement(admin, {
        title: 'Notice',
        message: 'Hostel notice',
        target_role: 'all',
        status: 'published',
      })
    ).resolves.toEqual(announcement);
    expect(
      announcementModel.createRecipientsAndNotifications
    ).toHaveBeenCalledWith(announcement, expect.any(Object));
  });

  test('published announcement audience cannot be changed', async () => {
    announcementModel.findAnnouncementById.mockResolvedValue({
      ...announcement,
      target_role: 'student',
    });

    await expect(
      announcementService.updateAnnouncement(admin, announcement.id, {
        target_role: 'security_staff',
      })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  test('users list only announcements selected by the model', async () => {
    announcementModel.listAnnouncements.mockResolvedValue([announcement]);
    announcementModel.countAnnouncements.mockResolvedValue(1);
    await expect(
      announcementService.listAnnouncements(student, {
        page: 1,
        limit: 20,
        search: '',
        status: '',
      })
    ).resolves.toMatchObject({
      announcements: [announcement],
      pagination: { total: 1 },
    });
  });
});
