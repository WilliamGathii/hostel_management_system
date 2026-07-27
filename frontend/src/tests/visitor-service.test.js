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
  getMyVisitors,
  getVisitor,
  getVisitors,
  registerVisitor,
  updateVisitorApproval,
  verifyVisitorEntry,
  verifyVisitorExit,
} from '../features/visitors/services/visitor.service';

describe('visitor service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('registers a visitor', async () => {
    apiClient.post.mockResolvedValue({
      data: { visitor: { id: 'visitor-1' } },
    });
    expect(await registerVisitor({ visitor_name: 'Jane' })).toEqual({
      id: 'visitor-1',
    });
  });

  test('loads role-appropriate visitor lists', async () => {
    apiClient.get.mockResolvedValue({ data: { visitors: [] } });
    await getMyVisitors({ approval_status: 'pending' });
    await getVisitors({ approval_status: 'approved' });
    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });

  test('loads one visitor', async () => {
    apiClient.get.mockResolvedValue({ data: { visitor: { id: 'visitor-1' } } });
    expect(await getVisitor('visitor-1')).toEqual({ id: 'visitor-1' });
  });

  test('updates approval', async () => {
    apiClient.patch.mockResolvedValue({
      data: { visitor: { approval_status: 'approved' } },
    });
    await updateVisitorApproval('visitor-1', 'approved');
    expect(apiClient.patch).toHaveBeenCalledWith(
      '/visitors/visitor-1/approval',
      { approval_status: 'approved' }
    );
  });

  test('records entry and exit', async () => {
    apiClient.post.mockResolvedValue({ data: { visitor: {} } });
    apiClient.patch.mockResolvedValue({ data: { visitor: {} } });
    await verifyVisitorEntry('visitor-1', 'Checked');
    await verifyVisitorExit('visitor-1', 'Left');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/visitors/visitor-1/verify-entry',
      { notes: 'Checked' }
    );
    expect(apiClient.patch).toHaveBeenCalledWith(
      '/visitors/visitor-1/verify-exit',
      { notes: 'Left' }
    );
  });
});
