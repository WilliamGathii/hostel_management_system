import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../features/rooms/services/room.service', () => ({
  createAllocation: vi.fn(),
  createRoom: vi.fn(),
  createRoomsBulk: vi.fn(),
  endAllocation: vi.fn(),
  getAllocations: vi.fn(),
  getMyAllocation: vi.fn(),
  getRooms: vi.fn(),
  getRoomTypes: vi.fn(),
  updateAllocation: vi.fn(),
  updateRoomType: vi.fn(),
  updateRoomTypeStatus: vi.fn(),
}));
vi.mock('../features/students/services/student.service', () => ({
  getStudents: vi.fn(),
}));

import { BulkRoomForm } from '../features/rooms/components/BulkRoomForm';
import { AdminAllocationPage } from '../features/rooms/pages/AdminAllocationPage';
import { AdminRoomListPage } from '../features/rooms/pages/AdminRoomListPage';
import { StudentRoomPage } from '../features/rooms/pages/StudentRoomPage';
import {
  createRoomsBulk,
  getAllocations,
  getMyAllocation,
  getRooms,
  getRoomTypes,
} from '../features/rooms/services/room.service';
import { getStudents } from '../features/students/services/student.service';
import { renderWithAuth } from './test-utils';

const roomTypes = [
  {
    id: 'type-a',
    code: 'A',
    name: 'Twin Room',
    monthly_rate: '10000.00',
    default_capacity: 2,
    status: 'active',
    rooms_count: 1,
  },
  {
    id: 'type-b',
    code: 'B',
    name: 'Studio',
    monthly_rate: '14000.00',
    default_capacity: 1,
    status: 'active',
    rooms_count: 0,
  },
  {
    id: 'type-c',
    code: 'C',
    name: 'Superior Studio',
    monthly_rate: '16500.00',
    default_capacity: 1,
    status: 'active',
    rooms_count: 0,
  },
  {
    id: 'type-d',
    code: 'D',
    name: 'One Bedroom',
    monthly_rate: '20000.00',
    default_capacity: 1,
    status: 'active',
    rooms_count: 0,
  },
  {
    id: 'type-e',
    code: 'E',
    name: 'Two Bedroom',
    monthly_rate: '30000.00',
    default_capacity: 2,
    status: 'active',
    rooms_count: 0,
  },
];
const room = {
  id: 'room-a901',
  room_type_id: 'type-a',
  floor_number: 9,
  room_number: 1,
  room_code: 'A901',
  room_type_code: 'A',
  room_type_name: 'Twin Room',
  monthly_rate: '10000.00',
  capacity: 2,
  current_occupancy: 1,
  occupancy_status: 'partially_occupied',
  operational_status: 'active',
};

describe('room management pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRoomTypes.mockResolvedValue(roomTypes);
    getRooms.mockResolvedValue({
      rooms: [room],
      pagination: { page: 1, totalPages: 1 },
    });
    getAllocations.mockResolvedValue({
      allocations: [],
      pagination: { page: 1, totalPages: 0 },
    });
    getStudents.mockResolvedValue({
      students: [
        {
          id: 'student-1',
          full_name: 'Amina Student',
          student_number: 'STU001',
        },
      ],
    });
  });

  test('shows Room Types and Floors & Rooms tabs', async () => {
    renderWithAuth(<AdminRoomListPage />, {
      route: '/admin/rooms?tab=types',
    });

    expect(screen.getByRole('tab', { name: 'Room Types' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(
      screen.getByRole('tab', { name: 'Floors & Rooms' })
    ).toBeInTheDocument();
    expect((await screen.findAllByText('Twin Room')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('KSh 10,000').length).toBeGreaterThan(0);
    expect(screen.getAllByText('KSh 16,500').length).toBeGreaterThan(0);
    expect(screen.getAllByText('KSh 30,000').length).toBeGreaterThan(0);
  });

  test('groups real room cards by floor and type', async () => {
    renderWithAuth(<AdminRoomListPage />, {
      route: '/admin/rooms?tab=rooms',
    });

    expect(await screen.findByText('Floor 9')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Twin Room' })
    ).toBeInTheDocument();
    const roomCard = screen.getByText('A901').closest('article');
    expect(roomCard).not.toBeNull();
    expect(within(roomCard).getByText('1 of 2 occupied')).toBeInTheDocument();
  });

  test('refreshes the floor view after a confirmed room batch', async () => {
    const user = userEvent.setup();
    createRoomsBulk.mockResolvedValue({
      created_count: 2,
      floor_number: 10,
      first_room_code: 'A1001',
      last_room_code: 'A1002',
      room_codes: ['A1001', 'A1002'],
    });
    renderWithAuth(<AdminRoomListPage />, {
      route: '/admin/rooms?tab=rooms',
    });

    await screen.findByText('A901');
    await user.click(
      screen.getAllByRole('button', { name: 'Generate Rooms' }).at(-1)
    );
    await user.selectOptions(
      screen.getAllByLabelText(/Room type/i)[0],
      'type-a'
    );
    await user.type(screen.getByLabelText(/Floor number/i), '10');
    await user.type(screen.getByLabelText(/Number of rooms/i), '2');
    await user.click(
      screen.getAllByRole('button', { name: 'Generate Rooms' }).at(-1)
    );
    await user.click(screen.getByRole('button', { name: 'Create Rooms' }));

    expect(
      await screen.findByText('2 rooms created from A1001 to A1002.')
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(getRooms.mock.calls.length).toBeGreaterThanOrEqual(2)
    );
  });

  test('allocation options show type, rate, capacity, and occupancy', async () => {
    renderWithAuth(<AdminAllocationPage />);

    const roomSelect = await screen.findByRole('combobox', {
      name: /^Room/,
    });
    expect(
      within(roomSelect).getByRole('option', {
        name: /A901 - Twin Room - Floor 9 - KSh 10,000 - 1\/2 occupied/i,
      })
    ).toBeInTheDocument();
  });

  test('Student My Room displays saved allocation information only', async () => {
    getMyAllocation.mockResolvedValue({
      id: 'allocation-1',
      room_code: 'A901',
      room_type_name: 'Twin Room',
      floor_number: 9,
      capacity: 2,
      allocation_status: 'active',
      monthly_rate_at_allocation: '10000.00',
      start_date: '2026-07-29',
      expected_end_date: '2026-12-20',
    });

    renderWithAuth(<StudentRoomPage />);

    expect(await screen.findByText('Room A901')).toBeInTheDocument();
    expect(screen.getByText('Twin Room')).toBeInTheDocument();
    expect(screen.getByText('KSh 10,000')).toBeInTheDocument();
    expect(screen.queryByText(/balance|invoice/i)).not.toBeInTheDocument();
  });
});

describe('bulk room generation form', () => {
  test('previews A906, confirms, and returns the created batch', async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    createRoomsBulk.mockResolvedValue({
      created_count: 6,
      floor_number: 9,
      first_room_code: 'A901',
      last_room_code: 'A906',
      room_codes: ['A901', 'A902', 'A903', 'A904', 'A905', 'A906'],
    });
    renderWithAuth(
      <BulkRoomForm
        existingRooms={[]}
        onCancel={vi.fn()}
        onCreated={onCreated}
        onSubmit={createRoomsBulk}
        roomTypes={roomTypes}
      />
    );

    await user.selectOptions(screen.getByLabelText(/Room type/i), 'type-a');
    await user.type(screen.getByLabelText(/Floor number/i), '9');
    await user.type(screen.getByLabelText(/Number of rooms/i), '6');
    expect(screen.getByText('A906')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Generate Rooms' }));
    expect(
      screen.getByRole('dialog', { name: 'Confirm room generation' })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Create Rooms' }));

    await waitFor(() => expect(onCreated).toHaveBeenCalled());
    expect(createRoomsBulk).toHaveBeenCalledWith({
      room_type_id: 'type-a',
      floor_number: 9,
      starting_room_number: 1,
      quantity: 6,
    });
  });

  test('previews A1006 and blocks a duplicate code', async () => {
    const user = userEvent.setup();
    renderWithAuth(
      <BulkRoomForm
        existingRooms={[{ room_code: 'A1006' }]}
        onCancel={vi.fn()}
        onCreated={vi.fn()}
        onSubmit={vi.fn()}
        roomTypes={roomTypes}
      />
    );

    await user.selectOptions(screen.getByLabelText(/Room type/i), 'type-a');
    await user.type(screen.getByLabelText(/Floor number/i), '10');
    await user.clear(screen.getByLabelText(/Starting room number/i));
    await user.type(screen.getByLabelText(/Starting room number/i), '6');
    await user.type(screen.getByLabelText(/Number of rooms/i), '1');

    expect(screen.getByText('A1006')).toBeInTheDocument();
    expect(
      screen.getByText(/Conflicting room codes: A1006/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Generate Rooms' })
    ).toBeDisabled();
  });
});
