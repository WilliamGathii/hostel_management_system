import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';

import { AppLayout } from '../layouts/AppLayout';
import { createAuthValue, renderWithAuth } from './test-utils';

const renderLayout = (role, logout = vi.fn().mockResolvedValue(undefined)) =>
  renderWithAuth(
    <Routes>
      <Route
        element={
          <AppLayout>
            <div>Layout content</div>
          </AppLayout>
        }
        path="*"
      />
      <Route element={<div>Login destination</div>} path="/login" />
    </Routes>,
    {
      authValue: createAuthValue({
        user: {
          full_name: 'Test User',
          role,
        },
        isAuthenticated: true,
        logout,
      }),
      route:
        role === 'admin'
          ? '/admin/dashboard'
          : role === 'maintenance_staff'
            ? '/maintenance/dashboard'
            : role === 'security_staff'
              ? '/security/dashboard'
              : '/student/dashboard',
    }
  );

describe('application layout navigation', () => {
  test('Student navigation does not show Admin links', () => {
    renderLayout('student');

    expect(screen.getAllByText('Profile').length).toBeGreaterThan(0);
    expect(screen.queryByText('Student management')).not.toBeInTheDocument();
    expect(screen.queryByText('Reports')).not.toBeInTheDocument();
  });

  test('Admin navigation shows approved Admin links', () => {
    renderLayout('admin');

    expect(screen.getAllByText('Students').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rooms').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Reports').length).toBeGreaterThan(0);
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
  });

  test('Maintenance Staff sees maintenance navigation only', () => {
    renderLayout('maintenance_staff');

    expect(screen.getAllByText('Assigned Requests').length).toBeGreaterThan(0);
    expect(screen.queryByText('Students')).not.toBeInTheDocument();
    expect(screen.queryByText('Approved Visitors')).not.toBeInTheDocument();
  });

  test('Security Staff sees security navigation only', () => {
    renderLayout('security_staff');

    expect(screen.getAllByText('Approved Visitors').length).toBeGreaterThan(0);
    expect(screen.queryByText('Assigned Requests')).not.toBeInTheDocument();
    expect(screen.queryByText('Rooms')).not.toBeInTheDocument();
  });

  test('logout runs and redirects to login', async () => {
    const user = userEvent.setup();
    const logout = vi.fn().mockResolvedValue(undefined);
    renderLayout('student', logout);

    await user.click(screen.getByRole('button', { name: /sign out/i }));

    expect(logout).toHaveBeenCalled();
    expect(await screen.findByText('Login destination')).toBeInTheDocument();
  });
});
