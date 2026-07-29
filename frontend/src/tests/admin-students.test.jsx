import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';

vi.mock('../features/students/services/student.service', () => ({
  createStudent: vi.fn(),
  deleteStudent: vi.fn(),
  getStudentById: vi.fn(),
  getStudents: vi.fn(),
  updateStudent: vi.fn(),
  updateStudentStatus: vi.fn(),
}));
vi.mock('../features/rooms/services/room.service', () => ({
  getAllocations: vi.fn(),
}));
vi.mock('../features/payments/services/payment.service', () => ({
  createPayment: vi.fn(),
  getPayments: vi.fn(),
}));
vi.mock('../features/maintenance/services/maintenance.service', () => ({
  getMaintenanceRequests: vi.fn(),
}));
vi.mock('../features/visitors/services/visitor.service', () => ({
  getVisitors: vi.fn(),
}));

import { AdminStudentCreatePage } from '../features/students/pages/AdminStudentCreatePage';
import { AdminStudentDetailPage } from '../features/students/pages/AdminStudentDetailPage';
import { AdminStudentListPage } from '../features/students/pages/AdminStudentListPage';
import {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudents,
  updateStudent,
  updateStudentStatus,
} from '../features/students/services/student.service';
import { getAllocations } from '../features/rooms/services/room.service';
import {
  createPayment,
  getPayments,
} from '../features/payments/services/payment.service';
import { getMaintenanceRequests } from '../features/maintenance/services/maintenance.service';
import { getVisitors } from '../features/visitors/services/visitor.service';
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

const renderDetail = (tab = '') =>
  renderWithAuth(
    <Routes>
      <Route
        element={<AdminStudentDetailPage />}
        path="/admin/students/:studentId"
      />
      <Route
        element={<div>Student list destination</div>}
        path="/admin/students"
      />
    </Routes>,
    {
      route: `/admin/students/${student.id}${tab ? `?tab=${tab}` : ''}`,
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
    deleteStudent.mockReset();
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
    deleteStudent.mockReset();
    updateStudent.mockReset();
    updateStudentStatus.mockReset();
    getAllocations.mockReset();
    getPayments.mockReset();
    getMaintenanceRequests.mockReset();
    getVisitors.mockReset();
    createPayment.mockReset();
    getAllocations.mockResolvedValue({
      allocations: [],
      pagination: { page: 1, total: 0, totalPages: 0 },
    });
    getPayments.mockResolvedValue({
      payments: [],
      summary: {
        total_records: 0,
        total_paid_amount: '0.00',
        latest_payment_date: null,
        latest_payment_status: null,
      },
      pagination: { page: 1, total: 0, totalPages: 0 },
    });
    getMaintenanceRequests.mockResolvedValue({
      maintenance_requests: [],
      pagination: { page: 1, total: 0, totalPages: 0 },
    });
    getVisitors.mockResolvedValue({
      visitors: [],
      pagination: { page: 1, total: 0, totalPages: 0 },
    });
  });

  test('opens the safe Overview tab by default', async () => {
    getStudentById.mockResolvedValue(student);

    renderDetail();

    expect(await screen.findByText('Amina Student')).toBeInTheDocument();
    expect(screen.getByText(/STU001/)).toBeInTheDocument();
    expect(screen.getAllByText('Software Engineering').length).toBeGreaterThan(
      0
    );
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.queryByText('must-never-appear')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/role/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Delete Student' })
    ).toBeInTheDocument();
    expect(screen.getByText('Account information')).toBeInTheDocument();
    expect(screen.getAllByText('Account status').length).toBeGreaterThan(0);
  });

  test('requires confirmation before deleting a Student account', async () => {
    const user = userEvent.setup();
    getStudentById.mockResolvedValue(student);
    deleteStudent.mockResolvedValue({
      id: student.id,
      full_name: student.full_name,
      student_number: student.student_number,
    });

    renderDetail();
    await user.click(
      await screen.findByRole('button', { name: 'Delete Student' })
    );

    expect(
      screen.getByRole('heading', { name: 'Delete this student account?' })
    ).toBeInTheDocument();
    expect(deleteStudent).not.toHaveBeenCalled();

    const deleteButtons = screen.getAllByRole('button', {
      name: 'Delete Student',
    });
    await user.click(deleteButtons.at(-1));

    await waitFor(() => expect(deleteStudent).toHaveBeenCalledWith(student.id));
    expect(
      await screen.findByText('Student list destination')
    ).toBeInTheDocument();
  });

  test('shows a safe message when linked records prevent deletion', async () => {
    const user = userEvent.setup();
    getStudentById.mockResolvedValue(student);
    deleteStudent.mockRejectedValue({
      message:
        'Student has linked hostel records and cannot be deleted. Set the account to inactive instead.',
      statusCode: 409,
    });

    renderDetail();
    await user.click(
      await screen.findByRole('button', { name: 'Delete Student' })
    );
    const deleteButtons = screen.getAllByRole('button', {
      name: 'Delete Student',
    });
    await user.click(deleteButtons.at(-1));

    expect(
      await screen.findByText(
        'Student has linked hostel records and cannot be deleted. Set the account to inactive instead.'
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Student list destination')
    ).not.toBeInTheDocument();
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
      await screen.findByRole('button', { name: /edit student/i })
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
      await screen.findByText('Student information updated successfully.')
    ).toBeInTheDocument();
  });

  test('uses URL tabs and requests records for the selected Student', async () => {
    const user = userEvent.setup();
    getStudentById.mockResolvedValue(student);

    renderDetail();
    await screen.findByText('Amina Student');
    await user.click(screen.getByRole('tab', { name: 'Payments' }));

    expect(screen.getByRole('tab', { name: 'Payments' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(getAllocations).toHaveBeenCalledWith(
      expect.objectContaining({ student_id: student.id })
    );
    expect(getPayments).toHaveBeenCalledWith(
      expect.objectContaining({ student_id: student.id })
    );
    expect(getMaintenanceRequests).toHaveBeenCalledWith(
      expect.objectContaining({ student_id: student.id })
    );
    expect(getVisitors).toHaveBeenCalledWith(
      expect.objectContaining({ student_id: student.id })
    );
    expect(
      screen.getByText('No payment records have been added for this student.')
    ).toBeInTheDocument();
    expect(screen.queryByText(/balance due/i)).not.toBeInTheDocument();
  });

  test('locks contextual payment creation to the current Student', async () => {
    const user = userEvent.setup();
    const activeAllocation = {
      id: 'allocation-1',
      student_id: student.id,
      room_number: 'A101',
      allocation_status: 'active',
    };
    getStudentById.mockResolvedValue(student);
    getAllocations.mockResolvedValue({
      allocations: [activeAllocation],
      pagination: { page: 1, total: 1, totalPages: 1 },
    });

    renderDetail('payments');
    await screen.findByText('Payment history');
    await user.click(
      screen.getByRole('button', { name: 'Add Payment Record' })
    );

    expect(
      screen.getByText('This student is locked to the current record.')
    ).toBeInTheDocument();
    expect(screen.getAllByText('Amina Student').length).toBeGreaterThan(0);
    expect(screen.getAllByText('STU001').length).toBeGreaterThan(0);
    expect(
      screen.queryByRole('combobox', { name: 'Student allocation' })
    ).not.toBeInTheDocument();
    expect(
      document.querySelector('input[name="room_allocation_id"]')
    ).toHaveValue(activeAllocation.id);
  });

  test('renders real Student payment records in table and mobile card layouts', async () => {
    getStudentById.mockResolvedValue(student);
    getPayments.mockResolvedValue({
      payments: [
        {
          id: 'payment-1',
          amount: '1500.00',
          payment_method: 'Cash',
          transaction_reference: 'SIM-001',
          payment_date: '2026-07-29',
          payment_status: 'paid',
        },
      ],
      summary: {
        total_records: 1,
        total_paid_amount: '1500.00',
        latest_payment_date: '2026-07-29',
        latest_payment_status: 'paid',
      },
      pagination: { page: 1, total: 1, totalPages: 1 },
    });

    renderDetail('payments');

    expect((await screen.findAllByText('SIM-001')).length).toBeGreaterThan(1);
    expect(screen.getByText('Total recorded as paid')).toBeInTheDocument();
    expect(screen.queryByText(/balance due/i)).not.toBeInTheDocument();
  });

  test('renders only filtered maintenance and visitor records', async () => {
    const user = userEvent.setup();
    getStudentById.mockResolvedValue(student);
    getMaintenanceRequests.mockResolvedValue({
      maintenance_requests: [
        {
          id: 'request-1',
          title: 'Leaking tap',
          room_number: 'A101',
          priority: 'high',
          status: 'submitted',
          submitted_at: '2026-07-29',
          assigned_staff_name: null,
        },
      ],
      pagination: { page: 1, total: 1, totalPages: 1 },
    });
    getVisitors.mockResolvedValue({
      visitors: [
        {
          id: 'visitor-1',
          visitor_name: 'Jane Visitor',
          visit_date: '2026-07-30',
          purpose: 'Family visit',
          approval_status: 'approved',
          entry_time: null,
          exit_time: null,
        },
      ],
      pagination: { page: 1, total: 1, totalPages: 1 },
    });

    renderDetail();
    await screen.findByText('Amina Student');
    await user.click(screen.getByRole('tab', { name: 'Maintenance' }));
    expect(screen.getAllByText('Leaking tap').length).toBeGreaterThan(0);
    await user.click(screen.getByRole('tab', { name: 'Visitors' }));
    expect(screen.getAllByText('Jane Visitor').length).toBeGreaterThan(0);
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
    deleteStudent.mockReset();
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
