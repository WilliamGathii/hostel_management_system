import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../features/students/services/student.service', () => ({
  getMyStudentProfile: vi.fn(),
  updateMyStudentProfile: vi.fn(),
}));

import { StudentProfilePage } from '../features/students/pages/StudentProfilePage';
import {
  getMyStudentProfile,
  updateMyStudentProfile,
} from '../features/students/services/student.service';
import { createAuthValue, renderWithAuth } from './test-utils';

const student = {
  id: '19b9714f-d3b7-4f73-97a1-1cc52471e167',
  user_id: '52adf52d-f70c-468e-80ad-0470c6944fa1',
  full_name: 'Amina Student',
  student_number: 'STU001',
  email: 'amina@example.com',
  phone: '+254700000001',
  course: 'Software Engineering',
  year_of_study: 2,
  emergency_contact_name: 'Parent Name',
  emergency_contact_phone: '+254700000002',
  account_status: 'active',
  role: 'student',
  password_hash: 'must-never-appear',
};

const renderProfile = (authOverrides = {}) =>
  renderWithAuth(<StudentProfilePage />, {
    authValue: createAuthValue({
      isAuthenticated: true,
      user: { role: 'student' },
      refreshUser: vi.fn().mockResolvedValue(),
      ...authOverrides,
    }),
  });

describe('Student Profile page', () => {
  beforeEach(() => {
    getMyStudentProfile.mockReset();
    updateMyStudentProfile.mockReset();
  });

  test('shows loading and then safe Student information', async () => {
    let resolveProfile;
    getMyStudentProfile.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveProfile = resolve;
        })
    );

    renderProfile();

    expect(screen.getByText('Loading your profile')).toBeInTheDocument();
    resolveProfile(student);

    expect(await screen.findByText('Amina Student')).toBeInTheDocument();
    expect(screen.getByText('STU001')).toBeInTheDocument();
    expect(screen.getByText('amina@example.com')).toBeInTheDocument();
    expect(screen.queryByText('must-never-appear')).not.toBeInTheDocument();
  });

  test('makes only approved profile fields editable', async () => {
    const user = userEvent.setup();
    getMyStudentProfile.mockResolvedValue(student);

    renderProfile();
    await user.click(
      await screen.findByRole('button', { name: /edit profile/i })
    );

    expect(screen.getByLabelText(/phone number/i)).toBeEnabled();
    expect(screen.getByLabelText(/^course/i)).toBeEnabled();
    expect(screen.getByLabelText(/year of study/i)).toBeEnabled();
    expect(screen.getByLabelText(/emergency contact name/i)).toBeEnabled();
    expect(screen.getByLabelText(/emergency contact phone/i)).toBeEnabled();
    expect(screen.queryByLabelText(/^role/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/account status/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/student number/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });

  test('saves only approved fields and shows a success notice', async () => {
    const user = userEvent.setup();
    const refreshUser = vi.fn().mockResolvedValue();
    const updatedStudent = {
      ...student,
      phone: '+254711111111',
    };
    getMyStudentProfile.mockResolvedValue(student);
    updateMyStudentProfile.mockResolvedValue(updatedStudent);

    renderProfile({ refreshUser });
    await user.click(
      await screen.findByRole('button', { name: /edit profile/i })
    );
    const phoneInput = screen.getByLabelText(/phone number/i);
    await user.clear(phoneInput);
    await user.type(phoneInput, '+254711111111');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() =>
      expect(updateMyStudentProfile).toHaveBeenCalledWith({
        phone: '+254711111111',
        course: 'Software Engineering',
        year_of_study: 2,
        emergency_contact_name: 'Parent Name',
        emergency_contact_phone: '+254700000002',
      })
    );
    expect(
      await screen.findByText('Your profile was updated successfully.')
    ).toBeInTheDocument();
    expect(refreshUser).toHaveBeenCalled();
  });

  test('cancel restores the last saved values', async () => {
    const user = userEvent.setup();
    getMyStudentProfile.mockResolvedValue(student);

    renderProfile();
    await user.click(
      await screen.findByRole('button', { name: /edit profile/i })
    );
    const phoneInput = screen.getByLabelText(/phone number/i);
    await user.clear(phoneInput);
    await user.type(phoneInput, '+254722222222');
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    await user.click(screen.getByRole('button', { name: /edit profile/i }));

    expect(screen.getByLabelText(/phone number/i)).toHaveValue('+254700000001');
  });

  test('shows backend validation errors without exposing sensitive data', async () => {
    const user = userEvent.setup();
    getMyStudentProfile.mockResolvedValue(student);
    updateMyStudentProfile.mockRejectedValue({
      message: 'Validation failed',
      errors: [{ field: 'phone', message: 'Enter a valid phone number' }],
    });

    renderProfile();
    await user.click(
      await screen.findByRole('button', { name: /edit profile/i })
    );
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(
      await screen.findByText('Enter a valid phone number')
    ).toBeInTheDocument();
    expect(screen.getByText('Validation failed')).toBeInTheDocument();
    expect(screen.queryByText('must-never-appear')).not.toBeInTheDocument();
  });
});
