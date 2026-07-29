import { useMemo, useState } from 'react';
import { LuSave } from 'react-icons/lu';
import { useForm } from 'react-hook-form';

import '../../../../../shared/room-code.js';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/feedback/Alert';
import { FormField } from '../../../components/forms/FormField';
import { SelectField } from '../../../components/forms/SelectField';
import { TextAreaField } from '../../../components/forms/TextAreaField';

const { generateRoomCode } = globalThis.hostelRoomCodeUtils;

export function RoomForm({
  initialValues = {},
  mode = 'create',
  onCancel,
  onSubmit,
  roomTypes = [],
  submitLabel = 'Save Room',
}) {
  const [submitError, setSubmitError] = useState('');
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    watch,
  } = useForm({
    defaultValues: {
      room_type_id: initialValues.room_type_id || '',
      floor_number: initialValues.floor_number || '',
      room_number: initialValues.room_number || '',
      capacity: initialValues.capacity || 1,
      description: initialValues.description || '',
    },
  });
  const roomTypeId = watch('room_type_id');
  const floorNumber = watch('floor_number');
  const roomNumber = watch('room_number');
  const selectedType = roomTypes.find((roomType) => roomType.id === roomTypeId);
  const roomCodePreview = useMemo(() => {
    if (mode !== 'create' || !selectedType || !floorNumber || !roomNumber) {
      return '';
    }

    try {
      return generateRoomCode(selectedType.code, floorNumber, roomNumber);
    } catch {
      return '';
    }
  }, [floorNumber, mode, roomNumber, selectedType]);

  const submit = async (values) => {
    setSubmitError('');

    try {
      const roomData =
        mode === 'create'
          ? {
              room_type_id: values.room_type_id,
              floor_number: Number(values.floor_number),
              room_number: Number(values.room_number),
              description: values.description.trim() || null,
            }
          : {
              capacity: Number(values.capacity),
              description: values.description.trim() || null,
            };

      await onSubmit(roomData);
    } catch (error) {
      setSubmitError(error.message || 'Room details could not be saved.');
    }
  };

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(submit)}>
      {submitError ? <Alert variant="error">{submitError}</Alert> : null}

      {mode === 'create' ? (
        <>
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
              error={errors.room_number?.message}
              label="Room number"
              max="99"
              min="1"
              name="room_number"
              required
              type="number"
              {...register('room_number', {
                required: 'Room number is required',
                min: { value: 1, message: 'Room number must be at least 1' },
                max: {
                  value: 99,
                  message: 'Room number must not exceed 99',
                },
              })}
            />
            <div className="rounded-card bg-page p-4">
              <p className="text-xs font-semibold text-muted">
                Room code preview
              </p>
              <p className="mt-2 font-mono text-xl font-bold text-primary">
                {roomCodePreview || '-'}
              </p>
              <p className="mt-1 text-xs text-muted">
                Capacity is inherited from the selected room type.
              </p>
            </div>
          </div>
        </>
      ) : (
        <FormField
          error={errors.capacity?.message}
          label="Room capacity"
          min="1"
          name="capacity"
          required
          type="number"
          {...register('capacity', {
            required: 'Capacity is required',
            min: { value: 1, message: 'Capacity must be at least 1' },
          })}
        />
      )}

      <TextAreaField
        error={errors.description?.message}
        label="Description"
        name="description"
        {...register('description', {
          maxLength: {
            value: 1000,
            message: 'Description must not exceed 1000 characters',
          },
        })}
      />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
        ) : null}
        <Button isLoading={isSubmitting} type="submit">
          <LuSave aria-hidden="true" className="size-4" />
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
