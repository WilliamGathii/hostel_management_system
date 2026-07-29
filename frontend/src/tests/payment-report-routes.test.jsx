import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  updatePaymentStatus,
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
      screen.getByRole('heading', { name: 'Payment Records' })
    ).toBeInTheDocument();
    expect(
      await screen.findByText('No simulated payment records have been added.')
    ).toBeInTheDocument();
    expect(screen.getByText(/No money is transferred/)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /M-Pesa|Stripe|PayPal|card/i })
    ).not.toBeInTheDocument();
    expect(getMyPayments).toHaveBeenCalled();
  });

  test('Admin can open payment management and reports', async () => {
    const authValue = authenticatedUser('admin');
    const paymentView = renderWithAuth(<AppRouter />, {
      authValue,
      route: '/admin/payments',
    });
    expect(
      screen.getByRole('heading', { name: 'Payment Records' })
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

  test('Admin can filter payments by date and confirm a status change', async () => {
    const user = userEvent.setup();
    getPayments.mockResolvedValue({
      payments: [
        {
          id: 'payment-1',
          student_id: '11111111-1111-4111-8111-111111111111',
          student_name: 'Test Student',
          student_number: 'STU-TEST',
          student_email: 'student@example.com',
          amount: '1500.00',
          payment_method: 'Cash',
          transaction_reference: 'SIM-001',
          payment_date: '2026-07-29',
          payment_status: 'pending',
          created_at: '2026-07-29T08:00:00.000Z',
        },
      ],
      pagination: { page: 1, totalPages: 1 },
    });
    updatePaymentStatus.mockResolvedValue({
      id: 'payment-1',
      payment_status: 'paid',
    });
    renderWithAuth(<AppRouter />, {
      authValue: authenticatedUser('admin'),
      route: '/admin/payments',
    });

    expect((await screen.findAllByText('SIM-001')).length).toBeGreaterThan(0);
    await user.type(
      screen.getByRole('searchbox', { name: 'Search payments' }),
      'student@example.com'
    );
    await user.type(screen.getByLabelText('From'), '2026-07-01');
    await user.type(screen.getByLabelText('To'), '2026-07-31');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(getPayments).toHaveBeenLastCalledWith(
      expect.objectContaining({
        search: 'student@example.com',
        date_from: '2026-07-01',
        date_to: '2026-07-31',
      })
    );
    expect(
      screen.getAllByRole('link', { name: /view student/i })[0]
    ).toHaveAttribute(
      'href',
      '/admin/students/11111111-1111-4111-8111-111111111111?tab=payments'
    );
    expect(screen.queryByText(/balance due/i)).not.toBeInTheDocument();

    await user.click(
      screen.getAllByRole('button', { name: /View details/i })[0]
    );
    await user.selectOptions(screen.getByLabelText('New status'), 'paid');
    await user.click(screen.getByRole('button', { name: 'Update Status' }));
    expect(
      screen.getByRole('dialog', { name: 'Confirm payment status' })
    ).toBeInTheDocument();
    await user.click(
      screen.getAllByRole('button', { name: 'Update Status' }).at(-1)
    );
    expect(updatePaymentStatus).toHaveBeenCalledWith('payment-1', {
      payment_status: 'paid',
    });
  });

  test('Reports include allocation reporting and an empty chart state', async () => {
    const user = userEvent.setup();
    renderWithAuth(<AppRouter />, {
      authValue: authenticatedUser('admin'),
      route: '/admin/reports',
    });
    expect(
      await screen.findByText('No chart data is available.')
    ).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Allocations' }));
    expect(getReport).toHaveBeenLastCalledWith(
      'allocations',
      expect.objectContaining({ page: 1, limit: 50 })
    );
  });

  test('Report charts render only when returned records contain totals', async () => {
    getReport.mockResolvedValue({
      summary: {
        total_rooms: 2,
        total_capacity: 4,
        current_occupancy: 2,
        available_beds: 2,
        occupancy_rate: 50,
      },
      status_breakdown: [
        { status: 'available', total: 1 },
        { status: 'occupied', total: 1 },
      ],
      rooms: [],
    });
    renderWithAuth(<AppRouter />, {
      authValue: authenticatedUser('admin'),
      route: '/admin/reports',
    });
    expect(
      await screen.findByRole('img', { name: 'Rooms status chart' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText('No chart data is available.')
    ).not.toBeInTheDocument();
  });

  test('Payment pages show a safe retry state when records cannot load', async () => {
    getMyPayments.mockRejectedValue(new Error('Unavailable'));
    renderWithAuth(<AppRouter />, {
      authValue: authenticatedUser('student'),
      route: '/student/payments',
    });
    expect(
      await screen.findByText('Payment records unavailable')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
