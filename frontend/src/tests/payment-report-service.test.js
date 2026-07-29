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
  createPayment,
  getMyPayments,
  getPaymentById,
  getPayments,
  updatePaymentStatus,
} from '../features/payments/services/payment.service';
import {
  getDashboardStats,
  getReport,
} from '../features/reports/services/report.service';

describe('payment and report services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('loads Student and Admin payment records', async () => {
    apiClient.get
      .mockResolvedValueOnce({ data: { payments: [] } })
      .mockResolvedValueOnce({ data: { payments: [] } });
    await getMyPayments({ status: 'pending' });
    await getPayments({ page: 1, limit: 20 });
    expect(apiClient.get).toHaveBeenNthCalledWith(1, '/payments/me', {
      params: { status: 'pending' },
    });
    expect(apiClient.get).toHaveBeenNthCalledWith(2, '/payments', {
      params: { page: 1, limit: 20 },
    });
  });

  test('creates, views, and reviews a simulated payment record', async () => {
    const payment = { id: 'payment-1', payment_status: 'pending' };
    apiClient.post.mockResolvedValue({ data: { payment } });
    apiClient.get.mockResolvedValue({ data: { payment } });
    apiClient.patch.mockResolvedValue({
      data: { payment: { ...payment, payment_status: 'paid' } },
    });

    expect(await createPayment({ amount: 1500 })).toEqual(payment);
    expect(await getPaymentById(payment.id)).toEqual(payment);
    expect(
      await updatePaymentStatus(payment.id, { payment_status: 'paid' })
    ).toMatchObject({ payment_status: 'paid' });
  });

  test('loads role dashboard statistics and approved reports', async () => {
    apiClient.get
      .mockResolvedValueOnce({ data: { stats: { rooms: 2 } } })
      .mockResolvedValueOnce({
        data: { room_report: { summary: { total_rooms: 2 } } },
      });
    expect(await getDashboardStats()).toEqual({ rooms: 2 });
    expect(await getReport('rooms', { status: 'available' })).toEqual({
      summary: { total_rooms: 2 },
    });
    expect(apiClient.get).toHaveBeenLastCalledWith('/reports/rooms', {
      params: { status: 'available' },
    });
  });
});
