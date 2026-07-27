import { useState } from 'react';
import { LuSave } from 'react-icons/lu';
import { useForm } from 'react-hook-form';

import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/feedback/Alert';
import { FormField } from '../../../components/forms/FormField';
import { TextAreaField } from '../../../components/forms/TextAreaField';

export function RoomForm({
  initialValues = {},
  onCancel,
  onSubmit,
  showRoomNumber = true,
  submitLabel = 'Save Room',
}) {
  const [submitError, setSubmitError] = useState('');
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm({
    defaultValues: {
      room_number: initialValues.room_number || '',
      room_type: initialValues.room_type || '',
      capacity: initialValues.capacity || 1,
      floor: initialValues.floor || '',
      description: initialValues.description || '',
    },
  });

  const submit = async (values) => {
    setSubmitError('');

    try {
      const roomData = {
        room_type: values.room_type.trim(),
        capacity: Number(values.capacity),
        floor: values.floor.trim(),
        description: values.description.trim(),
      };

      if (showRoomNumber) {
        roomData.room_number = values.room_number.trim();
      }

      await onSubmit(roomData);
    } catch (error) {
      setSubmitError(error.message || 'Room details could not be saved.');
    }
  };

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(submit)}>
      {submitError ? <Alert variant="error">{submitError}</Alert> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        {showRoomNumber ? (
          <FormField
            error={errors.room_number?.message}
            label="Room number"
            name="room_number"
            required
            {...register('room_number', {
              required: 'Room number is required',
              maxLength: {
                value: 50,
                message: 'Room number must not exceed 50 characters',
              },
            })}
          />
        ) : null}
        <FormField
          error={errors.room_type?.message}
          label="Room type"
          name="room_type"
          placeholder="Single, double or shared"
          required
          {...register('room_type', {
            required: 'Room type is required',
            maxLength: {
              value: 80,
              message: 'Room type must not exceed 80 characters',
            },
          })}
        />
        <FormField
          error={errors.capacity?.message}
          label="Capacity"
          max="100"
          min="1"
          name="capacity"
          required
          type="number"
          {...register('capacity', {
            required: 'Capacity is required',
            min: { value: 1, message: 'Capacity must be at least 1' },
            max: { value: 100, message: 'Capacity must not exceed 100' },
          })}
        />
        <FormField
          error={errors.floor?.message}
          label="Floor"
          name="floor"
          {...register('floor', {
            maxLength: {
              value: 50,
              message: 'Floor must not exceed 50 characters',
            },
          })}
        />
      </div>
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
