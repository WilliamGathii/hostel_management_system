import { useMemo, useState } from 'react';
import { LuBuilding2 } from 'react-icons/lu';
import { useForm } from 'react-hook-form';

import '../../../../../shared/room-code.js';
import { Button } from '../../../components/common/Button';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { Alert } from '../../../components/feedback/Alert';
import { FormField } from '../../../components/forms/FormField';
import { SelectField } from '../../../components/forms/SelectField';

const { generateRoomCodes } = globalThis.hostelRoomCodeUtils;

export function BulkRoomForm({
  existingRooms,
  onCancel,
  onCreated,
  onSubmit,
  roomTypes,
}) {
  const [pendingValues, setPendingValues] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      room_type_id: '',
      floor_number: '',
      starting_room_number: 1,
      quantity: '',
    },
  });
  const roomTypeId = watch('room_type_id');
  const floorNumber = watch('floor_number');
  const startingRoomNumber = watch('starting_room_number');
  const quantity = watch('quantity');
  const selectedRoomType = roomTypes.find(
    (roomType) => roomType.id === roomTypeId
  );

  const preview = useMemo(() => {
    if (!selectedRoomType || !floorNumber || !startingRoomNumber || !quantity) {
      return { codes: [], conflicts: [], error: '' };
    }

    try {
      const codes = generateRoomCodes(
        selectedRoomType.code,
        floorNumber,
        startingRoomNumber,
        quantity
      ).map((room) => room.roomCode);
      const existingCodes = new Set(
        existingRooms.map((room) => room.room_code)
      );

      return {
        codes,
        conflicts: codes.filter((code) => existingCodes.has(code)),
        error: '',
      };
    } catch (error) {
      return { codes: [], conflicts: [], error: error.message };
    }
  }, [
    existingRooms,
    floorNumber,
    quantity,
    selectedRoomType,
    startingRoomNumber,
  ]);

  const requestConfirmation = (values) => {
    setSubmitError('');
    setPendingValues({
      room_type_id: values.room_type_id,
      floor_number: Number(values.floor_number),
      starting_room_number: Number(values.starting_room_number),
      quantity: Number(values.quantity),
    });
  };

  const createRooms = async () => {
    setIsSaving(true);
    setSubmitError('');

    try {
      const result = await onSubmit(pendingValues);
      reset();
      setPendingValues(null);
      onCreated(result);
    } catch (error) {
      const conflictMessage = error.errors?.find(
        (item) => item.field === 'room_codes'
      )?.message;
      setSubmitError(
        conflictMessage ||
          error.message ||
          'The room batch could not be created.'
      );
      setPendingValues(null);
    } finally {
      setIsSaving(false);
    }
  };

  const hasValidationProblem =
    Boolean(preview.error) ||
    preview.conflicts.length > 0 ||
    preview.codes.length === 0;

  return (
    <>
      <form
        className="space-y-6"
        noValidate
        onSubmit={handleSubmit(requestConfirmation)}
      >
        {submitError ? <Alert variant="error">{submitError}</Alert> : null}
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            error={errors.room_type_id?.message}
            label="Room type"
            name="room_type_id"
            required
            {...register('room_type_id', {
              required: 'Select a room type',
            })}
          >
            <option value="">Select room type</option>
            {roomTypes
              .filter((roomType) => roomType.status === 'active')
              .map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name} ({roomType.code})
                </option>
              ))}
          </SelectField>
          <FormField
            error={errors.floor_number?.message}
            label="Floor number"
            min="1"
            name="floor_number"
            required
            type="number"
            {...register('floor_number', {
              required: 'Floor number is required',
              min: {
                value: 1,
                message: 'Floor number must be greater than zero',
              },
            })}
          />
          <FormField
            error={errors.starting_room_number?.message}
            label="Starting room number"
            max="99"
            min="1"
            name="starting_room_number"
            required
            type="number"
            {...register('starting_room_number', {
              required: 'Starting room number is required',
              min: { value: 1, message: 'Room number must be at least 1' },
              max: { value: 99, message: 'Room number must not exceed 99' },
            })}
          />
          <FormField
            error={errors.quantity?.message}
            label="Number of rooms"
            max="99"
            min="1"
            name="quantity"
            required
            type="number"
            {...register('quantity', {
              required: 'Number of rooms is required',
              min: { value: 1, message: 'Create at least one room' },
              max: { value: 99, message: 'Create no more than 99 rooms' },
            })}
          />
        </div>

        <div className="rounded-card bg-page p-4">
          <div className="flex items-center gap-2">
            <LuBuilding2 aria-hidden="true" className="size-5 text-primary" />
            <h3 className="font-bold text-text">Generated room codes</h3>
          </div>
          {preview.error ? (
            <p className="mt-3 text-sm text-error" role="alert">
              {preview.error}
            </p>
          ) : preview.codes.length > 0 ? (
            <>
              <p className="mt-3 text-sm text-muted">
                {preview.codes.length} {selectedRoomType?.name || 'room type'}
                {preview.codes.length === 1 ? '' : 's'} will be created on Floor{' '}
                {floorNumber}.
              </p>
              <div
                aria-label="Room code preview"
                className="mt-4 flex flex-wrap gap-2"
              >
                {preview.codes.map((code) => (
                  <span
                    className={`rounded-card px-3 py-2 font-mono text-sm font-semibold ${
                      preview.conflicts.includes(code)
                        ? 'bg-error-soft text-error'
                        : 'bg-card text-primary'
                    }`}
                    key={code}
                  >
                    {code}
                  </span>
                ))}
              </div>
              {preview.conflicts.length > 0 ? (
                <p className="mt-3 text-sm text-error" role="alert">
                  Conflicting room codes: {preview.conflicts.join(', ')}
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Complete the form to preview every room code.
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button disabled={hasValidationProblem} type="submit">
            Generate Rooms
          </Button>
        </div>
      </form>

      {pendingValues ? (
        <ConfirmDialog
          confirmLabel="Create Rooms"
          description={`Create ${pendingValues.quantity} rooms from ${preview.codes[0]} to ${preview.codes.at(-1)}? The complete batch will be cancelled if any room conflicts.`}
          isLoading={isSaving}
          onCancel={() => setPendingValues(null)}
          onConfirm={createRooms}
          title="Confirm room generation"
          variant="primary"
        />
      ) : null}
    </>
  );
}
