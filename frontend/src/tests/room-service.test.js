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
  createRoomsBulk,
  endAllocation,
  getAllocations,
  getMyAllocation,
  getRooms,
  getRoomTypes,
  updateRoomStatus,
  updateRoomType,
} from '../features/rooms/services/room.service';

describe('room service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('loads room filters', async () => {
    apiClient.get.mockResolvedValue({
      data: { rooms: [], pagination: { total: 0 } },
    });

    await getRooms({
      page: 1,
      limit: 20,
      search: 'A9',
      floor: 9,
      room_type_id: 'type-a',
      room_type_code: 'A',
      operational_status: 'active',
      occupancy_status: 'available',
    });

    expect(apiClient.get).toHaveBeenCalledWith('/rooms', {
      params: {
        page: 1,
        limit: 20,
        search: 'A9',
        floor: 9,
        room_type_id: 'type-a',
        room_type_code: 'A',
        operational_status: 'active',
        occupancy_status: 'available',
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
        room_type_id: 'type-a',
        floor_number: 1,
        room_number: 1,
      })
    ).toEqual({ id: 'room-1' });
    expect(await updateRoomStatus('room-1', 'inactive')).toEqual({
      id: 'room-1',
      status: 'inactive',
    });
  });

  test('loads room types and creates a complete room batch', async () => {
    apiClient.get.mockResolvedValue({
      data: { room_types: [{ id: 'type-a', code: 'A' }] },
    });
    apiClient.post.mockResolvedValue({
      data: {
        created_count: 6,
        first_room_code: 'A901',
        last_room_code: 'A906',
      },
    });

    expect(await getRoomTypes()).toEqual([{ id: 'type-a', code: 'A' }]);
    expect(
      await createRoomsBulk({
        room_type_id: 'type-a',
        floor_number: 9,
        starting_room_number: 1,
        quantity: 6,
      })
    ).toMatchObject({
      created_count: 6,
      last_room_code: 'A906',
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/rooms/bulk',
      expect.objectContaining({ quantity: 6 })
    );
  });

  test('updates room type details without changing its code', async () => {
    apiClient.patch.mockResolvedValue({
      data: {
        room_type: {
          id: 'type-a',
          code: 'A',
          monthly_rate: '12000.00',
        },
      },
    });

    await updateRoomType('type-a', { monthly_rate: 12000 });

    expect(apiClient.patch).toHaveBeenCalledWith('/room-types/type-a', {
      monthly_rate: 12000,
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
