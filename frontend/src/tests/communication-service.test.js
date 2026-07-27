import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../services/api-client', () => ({
  default: {
    delete: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

import apiClient from '../services/api-client';
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateAnnouncement,
} from '../features/communications/services/communication.service';

describe('communication service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('loads announcements', async () => {
    apiClient.get.mockResolvedValue({ data: { announcements: [] } });
    expect(await getAnnouncements({ page: 1 })).toEqual({
      announcements: [],
    });
    expect(apiClient.get).toHaveBeenCalledWith('/announcements', {
      params: { page: 1 },
    });
  });

  test('creates, updates, and deletes announcements', async () => {
    apiClient.post.mockResolvedValue({
      data: { announcement: { id: 'announcement-1' } },
    });
    apiClient.patch.mockResolvedValue({
      data: { announcement: { id: 'announcement-1' } },
    });
    apiClient.delete.mockResolvedValue({
      data: { announcement_id: 'announcement-1' },
    });

    await createAnnouncement({ title: 'Notice' });
    await updateAnnouncement('announcement-1', { status: 'archived' });
    expect(await deleteAnnouncement('announcement-1')).toBe('announcement-1');
  });

  test('loads notifications with unread count', async () => {
    apiClient.get.mockResolvedValue({
      data: { notifications: [], unread_count: 0 },
    });
    expect(await getNotifications({ page: 1 })).toMatchObject({
      unread_count: 0,
    });
  });

  test('marks one and all notifications as read', async () => {
    apiClient.patch
      .mockResolvedValueOnce({
        data: { notification: { id: 'notification-1' } },
      })
      .mockResolvedValueOnce({ data: { updated_count: 2 } });

    expect(await markNotificationRead('notification-1')).toEqual({
      id: 'notification-1',
    });
    expect(await markAllNotificationsRead()).toBe(2);
  });
});
