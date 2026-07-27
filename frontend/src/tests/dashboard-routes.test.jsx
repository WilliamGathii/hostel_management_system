import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { AppRouter } from '../routes/AppRouter';
import { createAuthValue, renderWithAuth } from './test-utils';

const roleRoutes = [
  {
    role: 'student',
    route: '/student/dashboard',
    heading: 'Student Dashboard',
  },
  {
    role: 'admin',
    route: '/admin/dashboard',
    heading: 'Admin Dashboard',
  },
  {
    role: 'maintenance_staff',
    route: '/maintenance/dashboard',
    heading: 'Maintenance Dashboard',
  },
  {
    role: 'security_staff',
    route: '/security/dashboard',
    heading: 'Security Dashboard',
  },
];

const authenticatedUser = (role) =>
  createAuthValue({
    isAuthenticated: true,
    user: {
      full_name: 'Test User',
      email: 'user@example.com',
      role,
      account_status: 'active',
      profile: role === 'student' ? { student_number: 'STU-TEST' } : null,
    },
  });

describe('dashboard routing', () => {
  test.each(roleRoutes)(
    'loads the $role dashboard at its approved route',
    ({ role, route, heading }) => {
      renderWithAuth(<AppRouter />, {
        authValue: authenticatedUser(role),
        route,
      });

      expect(
        screen.getByRole('heading', { name: heading })
      ).toBeInTheDocument();
    }
  );

  test('redirects a user away from another role dashboard', () => {
    renderWithAuth(<AppRouter />, {
      authValue: authenticatedUser('student'),
      route: '/admin/dashboard',
    });

    expect(
      screen.getByRole('heading', { name: 'Access unavailable' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Admin Dashboard' })
    ).not.toBeInTheDocument();
  });

  test('keeps non-dashboard module routes as placeholders', () => {
    renderWithAuth(<AppRouter />, {
      authValue: authenticatedUser('student'),
      route: '/student/profile',
    });

    expect(
      screen.getByText(
        'This feature will be added in a later development step.'
      )
    ).toBeInTheDocument();
  });
});
