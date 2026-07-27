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
  createAllocation,
  createRoom,
  endAllocation,
  getAllocations,
  getMyAllocation,
  getRooms,
  updateRoomStatus,
} from '../features/rooms/services/room.service';

describe('room service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('loads room filters', async () => {
    apiClient.get.mockResolvedValue({
      data: { rooms: [], pagination: { total: 0 } },
    });

    await getRooms({ page: 1, limit: 20, search: 'A1', status: 'available' });

    expect(apiClient.get).toHaveBeenCalledWith('/rooms', {
      params: {
        page: 1,
        limit: 20,
        search: 'A1',
        status: 'available',
      },
    });
  });

  test('creates and updates rooms', async () => {
    apiClient.post.mockResolvedValue({ data: { room: { id: 'room-1' } } });
    apiClient.patch.mockResolvedValue({
      data: { room: { id: 'room-1', status: 'inactive' } },
    });

    expect(
      await createRoom({
        room_number: 'A101',
        room_type: 'Shared',
        capacity: 2,
      })
    ).toEqual({ id: 'room-1' });
    expect(await updateRoomStatus('room-1', 'inactive')).toEqual({
      id: 'room-1',
      status: 'inactive',
    });
  });

  test('loads own and Admin allocations', async () => {
    apiClient.get
      .mockResolvedValueOnce({ data: { allocation: { id: 'allocation-1' } } })
      .mockResolvedValueOnce({ data: { allocations: [] } });

    expect(await getMyAllocation()).toEqual({ id: 'allocation-1' });
    expect(await getAllocations({ page: 1, limit: 20 })).toEqual({
      allocations: [],
    });
  });

  test('creates and ends allocations', async () => {
    apiClient.post.mockResolvedValue({
      data: { allocation: { id: 'allocation-1' } },
    });
    apiClient.patch.mockResolvedValue({
      data: {
        allocation: { id: 'allocation-1', allocation_status: 'completed' },
      },
    });

    await createAllocation({ student_id: 'student-1', room_id: 'room-1' });
    await endAllocation('allocation-1', {
      actual_end_date: '2026-07-27',
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/allocations',
      expect.any(Object)
    );
    expect(apiClient.patch).toHaveBeenCalledWith(
      '/allocations/allocation-1/end',
      expect.any(Object)
    );
  });
});
