import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';

vi.mock('../features/students/services/student.service', () => ({
  createStudent: vi.fn(),
  getStudentById: vi.fn(),
  getStudents: vi.fn(),
  updateStudent: vi.fn(),
  updateStudentStatus: vi.fn(),
}));

import { AdminStudentCreatePage } from '../features/students/pages/AdminStudentCreatePage';
import { AdminStudentDetailPage } from '../features/students/pages/AdminStudentDetailPage';
import { AdminStudentListPage } from '../features/students/pages/AdminStudentListPage';
import {
  createStudent,
  getStudentById,
  getStudents,
  updateStudent,
  updateStudentStatus,
} from '../features/students/services/student.service';
import { renderWithAuth } from './test-utils';

const student = {
  id: '19b9714f-d3b7-4f73-97a1-1cc52471e167',
  full_name: 'Amina Student',
  student_number: 'STU001',
  email: 'amina@example.com',
  phone: '+254700000001',
  course: 'Software Engineering',
  year_of_study: 2,
  emergency_contact_name: 'Parent Name',
  emergency_contact_phone: '+254700000002',
  account_status: 'active',
  account_created_at: '2026-07-10T08:00:00.000Z',
  last_login_at: '2026-07-20T09:30:00.000Z',
  password_hash: 'must-never-appear',
};

const pagination = {
  page: 1,
  limit: 10,
  total: 1,
  totalPages: 1,
};

const renderList = () => renderWithAuth(<AdminStudentListPage />);

const renderDetail = () =>
  renderWithAuth(
    <Routes>
      <Route
        element={<AdminStudentDetailPage />}
        path="/admin/students/:studentId"
      />
    </Routes>,
    {
      route: `/admin/students/${student.id}`,
    }
  );

const renderCreate = () =>
  renderWithAuth(
    <Routes>
      <Route element={<AdminStudentCreatePage />} path="/admin/students/new" />
      <Route
        element={<div>Created Student destination</div>}
        path="/admin/students/:studentId"
      />
    </Routes>,
    {
      route: '/admin/students/new',
    }
  );

describe('Admin Student list page', () => {
  beforeEach(() => {
    getStudents.mockReset();
    getStudentById.mockReset();
    createStudent.mockReset();
    updateStudent.mockReset();
    updateStudentStatus.mockReset();
  });

  test('shows safe Student information in desktop and mobile layouts', async () => {
    getStudents.mockResolvedValue({ students: [student], pagination });

    renderList();

    expect(await screen.findAllByText('Amina Student')).toHaveLength(2);
    expect(screen.getAllByText('STU001')).toHaveLength(2);
    expect(screen.getAllByText('amina@example.com')).toHaveLength(2);
    expect(screen.getAllByText('View details')).toHaveLength(2);
    expect(screen.queryByText('must-never-appear')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /delete/i })
    ).not.toBeInTheDocument();
  });

  test('sends controlled search and status filter parameters', async () => {
    const user = userEvent.setup();
    getStudents.mockResolvedValue({ students: [student], pagination });

    renderList();
    await screen.findAllByText('Amina Student');
    await user.type(
      screen.getByRole('searchbox', { name: /search students/i }),
      'STU001'
    );
    await user.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() =>
      expect(getStudents).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'STU001' })
      )
    );

    await user.selectOptions(
      screen.getByRole('combobox', { name: /account status/i }),
      'suspended'
    );

    await waitFor(() =>
      expect(getStudents).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: 'STU001',
          status: 'suspended',
        })
      )
    );
  });

  test('loads the next page and disables unavailable actions', async () => {
    const user = userEvent.setup();
    getStudents.mockImplementation(({ page }) =>
      Promise.resolve({
        students: [student],
        pagination: {
          ...pagination,
          page,
          total: 11,
          totalPages: 2,
        },
      })
    );

    renderList();
    expect(
      await screen.findByRole('button', { name: /previous/i })
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() =>
      expect(getStudents).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 2 })
      )
    );
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  test('shows an empty state', async () => {
    getStudents.mockResolvedValue({
      students: [],
      pagination: { ...pagination, total: 0, totalPages: 0 },
    });

    renderList();

    expect(
      await screen.findByText('No student accounts are available.')
    ).toBeInTheDocument();
  });

  test('shows a safe error and retry action', async () => {
    getStudents.mockRejectedValue(new Error('private server details'));

    renderList();

    expect(
      await screen.findByText('Student list unavailable')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeEnabled();
    expect(
      screen.queryByText('private server details')
    ).not.toBeInTheDocument();
  });
});

describe('Admin Student detail page', () => {
  beforeEach(() => {
    getStudents.mockReset();
    getStudentById.mockReset();
    createStudent.mockReset();
    updateStudent.mockReset();
    updateStudentStatus.mockReset();
  });

  test('loads safe details without future records or account controls', async () => {
    getStudentById.mockResolvedValue(student);

    renderDetail();

    expect(await screen.findByText('Amina Student')).toBeInTheDocument();
    expect(screen.getByText('STU001')).toBeInTheDocument();
    expect(screen.getByText('Software Engineering')).toBeInTheDocument();
    expect(screen.queryByText('must-never-appear')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/role/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /delete/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText('Account information')).toBeInTheDocument();
    expect(screen.getByText('Account status')).toBeInTheDocument();
  });

  test('requires confirmation and updates an approved status', async () => {
    const user = userEvent.setup();
    const updatedStudent = { ...student, account_status: 'suspended' };
    getStudentById.mockResolvedValue(student);
    updateStudentStatus.mockResolvedValue(updatedStudent);

    renderDetail();
    const statusSelect = await screen.findByRole('combobox', {
      name: /student account status/i,
    });
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(
      screen.queryByRole('option', { name: /deleted/i })
    ).not.toBeInTheDocument();

    await user.selectOptions(statusSelect, 'suspended');
    expect(updateStudentStatus).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /apply status/i }));

    expect(
      screen.getByText('Suspend this student account?')
    ).toBeInTheDocument();
    expect(updateStudentStatus).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /confirm change/i }));

    await waitFor(() =>
      expect(updateStudentStatus).toHaveBeenCalledWith(student.id, 'suspended')
    );
    expect(
      await screen.findByText('The student account is now suspended.')
    ).toBeInTheDocument();
  });

  test('allows an Admin to edit approved Student account fields', async () => {
    const user = userEvent.setup();
    getStudentById.mockResolvedValue(student);
    updateStudent.mockResolvedValue({
      ...student,
      full_name: 'Amina Updated',
    });

    renderDetail();
    await user.click(
      await screen.findByRole('button', { name: /edit account/i })
    );
    const nameInput = screen.getByRole('textbox', { name: /full name/i });
    await user.clear(nameInput);
    await user.type(nameInput, 'Amina Updated');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() =>
      expect(updateStudent).toHaveBeenCalledWith(
        student.id,
        expect.objectContaining({
          full_name: 'Amina Updated',
          email: student.email,
          student_number: student.student_number,
        })
      )
    );
    const updatePayload = updateStudent.mock.calls[0][1];
    expect(updatePayload).not.toHaveProperty('password');
    expect(updatePayload).not.toHaveProperty('role');
    expect(updatePayload).not.toHaveProperty('account_status');
    expect(
      await screen.findByText('Student account updated successfully.')
    ).toBeInTheDocument();
  });

  test('shows a safe missing-Student state', async () => {
    getStudentById.mockResolvedValue(null);

    renderDetail();

    expect(await screen.findByText('Student unavailable')).toBeInTheDocument();
    expect(
      screen.getByText('The student record could not be found or loaded.')
    ).toBeInTheDocument();
  });
});

describe('Admin Student creation page', () => {
  beforeEach(() => {
    createStudent.mockReset();
    getStudentById.mockReset();
    getStudents.mockReset();
    updateStudent.mockReset();
    updateStudentStatus.mockReset();
  });

  test('creates a Student with approved fields and a temporary password', async () => {
    const user = userEvent.setup();
    createStudent.mockResolvedValue(student);

    renderCreate();
    await user.type(screen.getByLabelText(/full name/i), 'Amina Student');
    await user.type(screen.getByLabelText(/email address/i), student.email);
    await user.type(
      screen.getByLabelText(/student number/i),
      student.student_number
    );
    await user.type(screen.getByLabelText(/^password/i), 'Student123');
    await user.type(screen.getByLabelText(/confirm password/i), 'Student123');
    await user.click(screen.getByRole('button', { name: /create student/i }));

    await waitFor(() =>
      expect(createStudent).toHaveBeenCalledWith(
        expect.objectContaining({
          full_name: 'Amina Student',
          email: student.email,
          student_number: student.student_number,
          password: 'Student123',
        })
      )
    );
    const createPayload = createStudent.mock.calls[0][0];
    expect(createPayload).not.toHaveProperty('role');
    expect(createPayload).not.toHaveProperty('account_status');
    expect(createPayload).not.toHaveProperty('confirm_password');
    expect(
      await screen.findByText('Created Student destination')
    ).toBeInTheDocument();
  });
});
