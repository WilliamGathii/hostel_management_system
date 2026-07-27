import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../services/api-client', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

import {
  getMyStudentProfile,
  getStudentById,
  getStudents,
  createStudent,
  updateStudent,
  updateMyStudentProfile,
  updateStudentStatus,
} from '../features/students/services/student.service';
import apiClient from '../services/api-client';

describe('frontend student service', () => {
  beforeEach(() => {
    apiClient.get.mockReset();
    apiClient.patch.mockReset();
    apiClient.post.mockReset();
  });

  test('loads and updates the signed-in student profile', async () => {
    const student = { id: 'student-profile-id', full_name: 'Amina Student' };
    apiClient.get.mockResolvedValue({ data: { student } });
    apiClient.patch.mockResolvedValue({ data: { student } });

    await expect(getMyStudentProfile()).resolves.toEqual(student);
    await expect(
      updateMyStudentProfile({ phone: '+254700000001' })
    ).resolves.toEqual(student);

    expect(apiClient.get).toHaveBeenCalledWith('/students/me');
    expect(apiClient.patch).toHaveBeenCalledWith('/students/me', {
      phone: '+254700000001',
    });
  });

  test('sends approved list query parameters', async () => {
    apiClient.get.mockResolvedValue({
      data: { students: [], pagination: { page: 2 } },
    });

    await getStudents({
      page: 2,
      limit: 10,
      search: 'STU001',
      status: 'active',
    });

    expect(apiClient.get).toHaveBeenCalledWith('/students', {
      params: {
        page: 2,
        limit: 10,
        search: 'STU001',
        status: 'active',
      },
    });
  });

  test('loads a student and sends only the approved status field', async () => {
    const student = {
      id: '19b9714f-d3b7-4f73-97a1-1cc52471e167',
      account_status: 'suspended',
    };
    apiClient.get.mockResolvedValue({ data: { student } });
    apiClient.patch.mockResolvedValue({ data: { student } });

    await expect(getStudentById(student.id)).resolves.toEqual(student);
    await expect(updateStudentStatus(student.id, 'suspended')).resolves.toEqual(
      student
    );

    expect(apiClient.get).toHaveBeenCalledWith(`/students/${student.id}`);
    expect(apiClient.patch).toHaveBeenCalledWith(
      `/students/${student.id}/status`,
      {
        account_status: 'suspended',
      }
    );
  });

  test('creates and edits a Student through Admin endpoints', async () => {
    const student = {
      id: '19b9714f-d3b7-4f73-97a1-1cc52471e167',
      full_name: 'Amina Student',
    };
    const createData = {
      full_name: 'Amina Student',
      email: 'amina@example.com',
      student_number: 'STU001',
      password: 'Student123',
    };
    const updateData = {
      full_name: 'Amina Updated',
      email: 'amina@example.com',
      student_number: 'STU001',
    };
    apiClient.post.mockResolvedValue({ data: { student } });
    apiClient.patch.mockResolvedValue({ data: { student } });

    await expect(createStudent(createData)).resolves.toEqual(student);
    await expect(updateStudent(student.id, updateData)).resolves.toEqual(
      student
    );

    expect(apiClient.post).toHaveBeenCalledWith('/students', createData);
    expect(apiClient.patch).toHaveBeenCalledWith(
      `/students/${student.id}`,
      updateData
    );
  });
});
