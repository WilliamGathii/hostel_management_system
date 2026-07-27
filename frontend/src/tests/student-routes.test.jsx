import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../features/students/services/student.service', () => ({
  getMyStudentProfile: vi.fn(),
  getStudentById: vi.fn(),
  getStudents: vi.fn(),
  updateMyStudentProfile: vi.fn(),
  updateStudentStatus: vi.fn(),
}));

import {
  getMyStudentProfile,
  getStudentById,
  getStudents,
} from '../features/students/services/student.service';
import { AppRouter } from '../routes/AppRouter';
import { createAuthValue, renderWithAuth } from './test-utils';

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

const student = {
  id: '19b9714f-d3b7-4f73-97a1-1cc52471e167',
  full_name: 'Amina Student',
  student_number: 'STU001',
  email: 'amina@example.com',
  account_status: 'active',
};

describe('Student feature routing', () => {
  beforeEach(() => {
    getMyStudentProfile.mockReset();
    getStudentById.mockReset();
    getStudents.mockReset();
    getMyStudentProfile.mockResolvedValue(student);
    getStudentById.mockResolvedValue(student);
    getStudents.mockResolvedValue({
      students: [student],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  });

  test('allows a Student to open their profile', async () => {
    renderWithAuth(<AppRouter />, {
      authValue: authenticatedUser('student'),
      route: '/student/profile',
    });

    expect(
      await screen.findByRole('heading', { name: 'My Profile' })
    ).toBeInTheDocument();
  });

  test('blocks an Admin from the Student profile route', () => {
    renderWithAuth(<AppRouter />, {
      authValue: authenticatedUser('admin'),
      route: '/student/profile',
    });

    expect(
      screen.getByRole('heading', { name: 'Access unavailable' })
    ).toBeInTheDocument();
  });

  test('allows an Admin to open Student list and detail pages', async () => {
    const authValue = authenticatedUser('admin');
    const listView = renderWithAuth(<AppRouter />, {
      authValue,
      route: '/admin/students',
    });

    expect(
      await screen.findByRole('heading', { name: 'Student Management' })
    ).toBeInTheDocument();
    listView.unmount();

    renderWithAuth(<AppRouter />, {
      authValue,
      route: `/admin/students/${student.id}`,
    });

    expect(
      await screen.findByRole('heading', { name: 'Student Details' })
    ).toBeInTheDocument();
  });

  test.each(['student', 'maintenance_staff', 'security_staff'])(
    'blocks %s from Admin Student Management',
    (role) => {
      renderWithAuth(<AppRouter />, {
        authValue: authenticatedUser(role),
        route: '/admin/students',
      });

      expect(
        screen.getByRole('heading', { name: 'Access unavailable' })
      ).toBeInTheDocument();
    }
  );

  test('keeps other module routes as placeholders', () => {
    renderWithAuth(<AppRouter />, {
      authValue: authenticatedUser('admin'),
      route: '/admin/rooms',
    });

    expect(
      screen.getByText(
        'This feature will be added in a later development step.'
      )
    ).toBeInTheDocument();
  });
});
