import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { AdminDashboardPage } from '../features/dashboard/pages/AdminDashboardPage';
import { MaintenanceDashboardPage } from '../features/dashboard/pages/MaintenanceDashboardPage';
import { SecurityDashboardPage } from '../features/dashboard/pages/SecurityDashboardPage';
import { StudentDashboardPage } from '../features/dashboard/pages/StudentDashboardPage';
import { createAuthValue, renderWithAuth } from './test-utils';

const renderDashboard = (component, user) =>
  renderWithAuth(component, {
    authValue: createAuthValue({
      isAuthenticated: true,
      user,
    }),
  });

describe('role dashboards', () => {
  test('shows Student account information and approved quick actions', () => {
    renderDashboard(<StudentDashboardPage />, {
      full_name: 'Test Student',
      email: 'student@example.com',
      role: 'student',
      account_status: 'active',
      profile: {
        student_number: 'STU-TEST',
      },
    });

    expect(screen.getByText(/Welcome, Test Student/)).toBeInTheDocument();
    expect(screen.getByText('STU-TEST')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /View room allocation/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Submit maintenance request/ })
    ).toBeInTheDocument();
    expect(screen.queryByText('Manage rooms')).not.toBeInTheDocument();
    expect(
      screen.getByText('No room allocation is available.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Room 101')).not.toBeInTheDocument();
    expect(
      screen.getByText(/do not represent real money transfers/)
    ).toBeInTheDocument();
  });

  test('shows Admin management actions without invented totals', () => {
    renderDashboard(<AdminDashboardPage />, {
      full_name: 'Test Admin',
      email: 'admin@example.com',
      role: 'admin',
      account_status: 'active',
      profile: null,
    });

    expect(
      screen.getByRole('link', { name: /Manage rooms/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Room allocations/ })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /View profile/ })
    ).not.toBeInTheDocument();
    expect(screen.getAllByText('No data')).toHaveLength(4);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(
      screen.getByText('No rooms have been added.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No real money is transferred/)
    ).toBeInTheDocument();
  });

  test('shows Maintenance Staff work links and explanatory guides', () => {
    renderDashboard(<MaintenanceDashboardPage />, {
      full_name: 'Test Maintenance',
      email: 'maintenance@example.com',
      role: 'maintenance_staff',
      account_status: 'active',
      profile: null,
    });

    expect(
      screen.getByRole('link', { name: /Assigned requests/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Maintenance history/ })
    ).toBeInTheDocument();
    expect(screen.queryByText('Manage students')).not.toBeInTheDocument();
    expect(screen.queryByText('Approved visitors')).not.toBeInTheDocument();
    expect(
      screen.getByText('No assigned maintenance requests are available.')
    ).toBeInTheDocument();
    expect(screen.getByText('Priority guide')).toBeInTheDocument();
    expect(screen.getByText('Work status')).toBeInTheDocument();
  });

  test('shows Security Staff workflow and permission limits', () => {
    renderDashboard(<SecurityDashboardPage />, {
      full_name: 'Test Security',
      email: 'security@example.com',
      role: 'security_staff',
      account_status: 'active',
      profile: null,
    });

    expect(
      screen.getByRole('link', { name: /Approved visitors/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Visitor history/ })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Open an approved visitor record.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Record entry or exit time.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('No approved visitors are available.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/cannot approve or reject visitor requests/)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /approve|reject/i })
    ).not.toBeInTheDocument();
  });
});
