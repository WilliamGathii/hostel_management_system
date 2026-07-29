import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../features/payments/services/payment.service', () => ({
  createPayment: vi.fn(),
  getMyPayments: vi.fn(),
  getPayments: vi.fn(),
  updatePaymentStatus: vi.fn(),
}));
vi.mock('../features/reports/services/report.service', () => ({
  getDashboardStats: vi.fn(),
  getReport: vi.fn(),
}));

import {
  getMyPayments,
  getPayments,
} from '../features/payments/services/payment.service';
import {
  getDashboardStats,
  getReport,
} from '../features/reports/services/report.service';
import { AppRouter } from '../routes/AppRouter';
import { createAuthValue, renderWithAuth } from './test-utils';

const authenticatedUser = (role) =>
  createAuthValue({
    isAuthenticated: true,
    user: {
      id: `${role}-user`,
      full_name: 'Test User',
      email: 'user@example.com',
      role,
      account_status: 'active',
      profile: role === 'student' ? { student_number: 'STU-TEST' } : null,
    },
  });

describe('payment and report routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMyPayments.mockResolvedValue({
      payments: [],
      pagination: { page: 1, totalPages: 0 },
    });
    getPayments.mockResolvedValue({
      payments: [],
      pagination: { page: 1, totalPages: 0 },
    });
    getDashboardStats.mockResolvedValue({});
    getReport.mockResolvedValue({
      summary: {
        total_rooms: 0,
        total_capacity: 0,
        current_occupancy: 0,
        available_beds: 0,
        occupancy_rate: 0,
      },
      rooms: [],
      allocations: [],
    });
  });

  test('Student can open their simulated payment records', async () => {
    renderWithAuth(<AppRouter />, {
      authValue: authenticatedUser('student'),
      route: '/student/payments',
    });
    expect(
      screen.getByRole('heading', { name: 'Simulated Payments' })
    ).toBeInTheDocument();
    expect(
      await screen.findByText('No simulated payment records have been added.')
    ).toBeInTheDocument();
    expect(getMyPayments).toHaveBeenCalled();
  });

  test('Admin can open payment management and reports', async () => {
    const authValue = authenticatedUser('admin');
    const paymentView = renderWithAuth(<AppRouter />, {
      authValue,
      route: '/admin/payments',
    });
    expect(
      screen.getByRole('heading', { name: 'Simulated Payments' })
    ).toBeInTheDocument();
    await screen.findByText('No simulated payment records have been added.');
    expect(getPayments).toHaveBeenCalled();
    paymentView.unmount();

    renderWithAuth(<AppRouter />, {
      authValue,
      route: '/admin/reports',
    });
    expect(
      screen.getByRole('heading', { name: 'Reports and Statistics' })
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Room availability and occupancy')
    ).toBeInTheDocument();
    expect(getReport).toHaveBeenCalledWith(
      'rooms',
      expect.objectContaining({ page: 1, limit: 50 })
    );
  });

  test('Student cannot open Admin reports', () => {
    renderWithAuth(<AppRouter />, {
      authValue: authenticatedUser('student'),
      route: '/admin/reports',
    });
    expect(
      screen.getByRole('heading', { name: 'Access unavailable' })
    ).toBeInTheDocument();
  });
});
