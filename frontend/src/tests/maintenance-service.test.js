import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../services/api-client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

import apiClient from '../services/api-client';
import {
  addMaintenanceUpdate,
  assignMaintenanceRequest,
  getMaintenanceRequest,
  getMaintenanceRequests,
  getMyMaintenanceRequests,
  submitMaintenanceRequest,
  updateMaintenanceStatus,
} from '../features/maintenance/services/maintenance.service';

describe('maintenance service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('submits a Student maintenance request', async () => {
    apiClient.post.mockResolvedValue({
      data: { maintenance_request: { id: 'request-1' } },
    });
    await submitMaintenanceRequest({ title: 'Broken tap' });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/maintenance-requests',
      expect.any(Object)
    );
  });

  test('loads own and staff-visible requests', async () => {
    apiClient.get.mockResolvedValue({ data: { maintenance_requests: [] } });
    await getMyMaintenanceRequests({ status: 'submitted' });
    await getMaintenanceRequests({ priority: 'urgent' });
    expect(apiClient.get).toHaveBeenNthCalledWith(
      1,
      '/maintenance-requests/me',
      { params: { status: 'submitted' } }
    );
    expect(apiClient.get).toHaveBeenNthCalledWith(2, '/maintenance-requests', {
      params: { priority: 'urgent' },
    });
  });

  test('loads request details', async () => {
    apiClient.get.mockResolvedValue({
      data: { maintenance_request: { id: 'request-1' }, updates: [] },
    });
    expect(await getMaintenanceRequest('request-1')).toMatchObject({
      updates: [],
    });
  });

  test('assigns staff and updates status', async () => {
    apiClient.patch.mockResolvedValue({
      data: { maintenance_request: { id: 'request-1' } },
    });
    await assignMaintenanceRequest('request-1', 'staff-1');
    await updateMaintenanceStatus('request-1', 'in_progress', 'Started');
    expect(apiClient.patch).toHaveBeenCalledTimes(2);
  });

  test('adds a progress update', async () => {
    apiClient.post.mockResolvedValue({ data: { update: { id: 'update-1' } } });
    expect(await addMaintenanceUpdate('request-1', 'Part ordered')).toEqual({
      id: 'update-1',
    });
  });
});
