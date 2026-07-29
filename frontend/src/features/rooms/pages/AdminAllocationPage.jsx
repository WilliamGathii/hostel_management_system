import { useCallback, useEffect, useState } from 'react';
import { LuBedDouble, LuRefreshCw, LuUserPlus } from 'react-icons/lu';
import { useForm } from 'react-hook-form';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { PageContainer } from '../../../components/common/PageContainer';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusChip } from '../../../components/common/StatusChip';
import { Alert } from '../../../components/feedback/Alert';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { FormField } from '../../../components/forms/FormField';
import { SelectField } from '../../../components/forms/SelectField';
import { TextAreaField } from '../../../components/forms/TextAreaField';
import { getStudents } from '../../students/services/student.service';
import { formatDate, formatLabel } from '../../../utils/formatters';
import {
  createAllocation,
  endAllocation,
  getAllocations,
  getRooms,
  updateAllocation,
} from '../services/room.service';

const formatCurrency = (amount) =>
  `KSh ${Number(amount || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;

const roomOptionLabel = (room) =>
  `${room.room_code} - ${room.room_type_name} - Floor ${
    room.floor_number
  } - ${formatCurrency(room.monthly_rate)} - ${room.current_occupancy}/${
    room.capacity
  } occupied - ${formatLabel(room.occupancy_status)}`;

function AllocationEditDialog({ allocation, onCancel, onSaved, rooms }) {
  const [submitError, setSubmitError] = useState('');
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm({
    defaultValues: {
      room_id: allocation.room_id,
      expected_end_date: allocation.expected_end_date
        ? String(allocation.expected_end_date).slice(0, 10)
        : '',
      notes: allocation.notes || '',
    },
  });

  const submit = async (values) => {
    setSubmitError('');
    try {
      await updateAllocation(allocation.id, {
        room_id: values.room_id,
        expected_end_date: values.expected_end_date || null,
        notes: values.notes,
      });
      onSaved();
    } catch (error) {
      setSubmitError(error.message || 'Allocation could not be updated.');
    }
  };

  return (
    <div
      aria-labelledby="edit-allocation-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/35 p-4"
      role="dialog"
    >
      <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto shadow-xl">
        <h2 className="text-lg font-bold text-text" id="edit-allocation-title">
          Change room allocation
        </h2>
        <p className="mt-1 text-sm text-muted">
          {allocation.student_name} is currently in room{' '}
          {allocation.room_code || allocation.room_number}.
        </p>
        {submitError ? (
          <Alert className="mt-5" variant="error">
            {submitError}
          </Alert>
        ) : null}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit(submit)}>
          <SelectField
            error={errors.room_id?.message}
            label="Room"
            name="room_id"
            required
            {...register('room_id', { required: 'Select a room' })}
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {roomOptionLabel(room)}
              </option>
            ))}
          </SelectField>
          <FormField
            error={errors.expected_end_date?.message}
            label="Expected end date"
            name="expected_end_date"
            type="date"
            {...register('expected_end_date')}
          />
          <TextAreaField
            error={errors.notes?.message}
            label="Notes"
            name="notes"
            {...register('notes', {
              maxLength: {
                value: 1000,
                message: 'Notes must not exceed 1000 characters',
              },
            })}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button onClick={onCancel} variant="secondary">
              Cancel
            </Button>
            <Button isLoading={isSubmitting} type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export function AdminAllocationPage() {
  const [allocations, setAllocations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [endingAllocation, setEndingAllocation] = useState(null);
  const [notice, setNotice] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm({
    defaultValues: {
      student_id: '',
      room_id: '',
      start_date: new Date().toISOString().slice(0, 10),
      expected_end_date: '',
      notes: '',
    },
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const [allocationResult, roomResult, studentResult] = await Promise.all([
        getAllocations({ page: 1, limit: 50 }),
        getRooms({ page: 1, limit: 50 }),
        getStudents({ page: 1, limit: 50, status: 'active' }),
      ]);
      setAllocations(
        Array.isArray(allocationResult.allocations)
          ? allocationResult.allocations
          : []
      );
      setRooms(Array.isArray(roomResult.rooms) ? roomResult.rooms : []);
      setStudents(
        Array.isArray(studentResult.students) ? studentResult.students : []
      );
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const submitAllocation = async (values) => {
    setSubmitError('');
    setNotice('');

    try {
      await createAllocation({
        student_id: values.student_id,
        room_id: values.room_id,
        start_date: values.start_date,
        expected_end_date: values.expected_end_date || null,
        notes: values.notes,
      });
      reset({
        student_id: '',
        room_id: '',
        start_date: new Date().toISOString().slice(0, 10),
        expected_end_date: '',
        notes: '',
      });
      setNotice('Student allocated successfully.');
      await loadData();
    } catch (error) {
      setSubmitError(error.message || 'Student could not be allocated.');
    }
  };

  const confirmEnd = async () => {
    setIsEnding(true);
    try {
      await endAllocation(endingAllocation.id, {
        actual_end_date: new Date().toISOString().slice(0, 10),
        allocation_status: 'completed',
      });
      setEndingAllocation(null);
      setNotice('Room allocation ended successfully.');
      await loadData();
    } finally {
      setIsEnding(false);
    }
  };

  const activeAllocations = allocations.filter(
    (allocation) => allocation.allocation_status === 'active'
  );
  const selectableRooms = rooms.filter(
    (room) =>
      room.operational_status === 'active' &&
      room.occupancy_status !== 'full' &&
      room.current_occupancy < room.capacity
  );
  const allocatedStudentIds = new Set(
    activeAllocations.map((allocation) => allocation.student_id)
  );
  const selectableStudents = students.filter(
    (student) => !allocatedStudentIds.has(student.id)
  );

  return (
    <PageContainer>
      <PageHeader
        description="Assign active students to available rooms and manage current stays."
        title="Room Allocation"
      />

      {notice ? (
        <Alert className="mb-6" variant="success">
          {notice}
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <Card className="self-start">
          <h2 className="text-lg font-bold text-text">Allocate a student</h2>
          <p className="mt-1 text-sm text-muted">
            Only students without an active allocation are shown.
          </p>
          {submitError ? (
            <Alert className="mt-5" variant="error">
              {submitError}
            </Alert>
          ) : null}
          <form
            className="mt-6 space-y-5"
            onSubmit={handleSubmit(submitAllocation)}
          >
            <SelectField
              error={errors.student_id?.message}
              label="Student"
              name="student_id"
              required
              {...register('student_id', { required: 'Select a student' })}
            >
              <option value="">Select student</option>
              {selectableStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name} ({student.student_number})
                </option>
              ))}
            </SelectField>
            <SelectField
              error={errors.room_id?.message}
              label="Room"
              name="room_id"
              required
              {...register('room_id', { required: 'Select a room' })}
            >
              <option value="">Select room</option>
              {selectableRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {roomOptionLabel(room)}
                </option>
              ))}
            </SelectField>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
              <FormField
                error={errors.start_date?.message}
                label="Start date"
                name="start_date"
                required
                type="date"
                {...register('start_date', {
                  required: 'Start date is required',
                })}
              />
              <FormField
                error={errors.expected_end_date?.message}
                label="Expected end date"
                name="expected_end_date"
                type="date"
                {...register('expected_end_date')}
              />
            </div>
            <TextAreaField
              error={errors.notes?.message}
              label="Notes"
              name="notes"
              rows={3}
              {...register('notes', {
                maxLength: {
                  value: 1000,
                  message: 'Notes must not exceed 1000 characters',
                },
              })}
            />
            <Button
              className="w-full"
              disabled={
                selectableRooms.length === 0 || selectableStudents.length === 0
              }
              isLoading={isSubmitting}
              type="submit"
            >
              <LuUserPlus aria-hidden="true" className="size-4" />
              Allocate Student
            </Button>
          </form>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-text">
                Current allocations
              </h2>
              <p className="mt-1 text-sm text-muted">
                {activeAllocations.length} active allocation
                {activeAllocations.length === 1 ? '' : 's'}
              </p>
            </div>
            <Button onClick={loadData} variant="ghost">
              <LuRefreshCw aria-hidden="true" className="size-4" />
              Refresh
            </Button>
          </div>

          <div className="mt-6">
            {isLoading ? (
              <div className="space-y-3" role="status">
                <span className="sr-only">Loading room allocations</span>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : hasError ? (
              <ErrorState
                description="Room allocations could not be loaded."
                onRetry={loadData}
                title="Allocations unavailable"
              />
            ) : activeAllocations.length === 0 ? (
              <EmptyState
                description="Use the allocation form when a room is ready."
                Icon={LuBedDouble}
                title="No active room allocations are available."
              />
            ) : (
              <div className="space-y-3">
                {activeAllocations.map((allocation) => (
                  <article
                    className="rounded-card border border-border p-4 sm:flex sm:items-center sm:justify-between sm:gap-5"
                    key={allocation.id}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-text">
                          {allocation.student_name}
                        </p>
                        <StatusChip variant="success">
                          {formatLabel(allocation.allocation_status)}
                        </StatusChip>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {allocation.student_number} · Room{' '}
                        {allocation.room_code || allocation.room_number} ·{' '}
                        {allocation.room_type_name} ·{' '}
                        {formatCurrency(allocation.monthly_rate_at_allocation)}{' '}
                        · Started {formatDate(allocation.start_date)}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 sm:mt-0 sm:flex-row">
                      <Button
                        onClick={() => setEditingAllocation(allocation)}
                        variant="secondary"
                      >
                        Change
                      </Button>
                      <Button
                        onClick={() => setEndingAllocation(allocation)}
                        variant="danger"
                      >
                        End
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {editingAllocation ? (
        <AllocationEditDialog
          allocation={editingAllocation}
          onCancel={() => setEditingAllocation(null)}
          onSaved={async () => {
            setEditingAllocation(null);
            setNotice('Room allocation updated successfully.');
            await loadData();
          }}
          rooms={rooms.filter(
            (room) =>
              room.id === editingAllocation.room_id ||
              (room.operational_status === 'active' &&
                room.occupancy_status !== 'full' &&
                room.current_occupancy < room.capacity)
          )}
        />
      ) : null}

      {endingAllocation ? (
        <ConfirmDialog
          confirmLabel="End Allocation"
          description={`End ${endingAllocation.student_name}'s allocation to room ${endingAllocation.room_code || endingAllocation.room_number}? Occupancy will update from the active allocation records.`}
          isLoading={isEnding}
          onCancel={() => setEndingAllocation(null)}
          onConfirm={confirmEnd}
          title="End room allocation"
        />
      ) : null}
    </PageContainer>
  );
}
