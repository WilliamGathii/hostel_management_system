import { useState } from 'react';
import { LuSave } from 'react-icons/lu';
import { useForm } from 'react-hook-form';

import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/feedback/Alert';
import { FormField } from '../../../components/forms/FormField';
import { TextAreaField } from '../../../components/forms/TextAreaField';

export function RoomTypeForm({ roomType, onCancel, onSubmit }) {
  const [submitError, setSubmitError] = useState('');
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm({
    defaultValues: {
      name: roomType.name,
      monthly_rate: roomType.monthly_rate,
      default_capacity: roomType.default_capacity,
      description: roomType.description || '',
    },
  });

  const submit = async (values) => {
    setSubmitError('');

    try {
      await onSubmit({
        name: values.name.trim(),
        monthly_rate: Number(values.monthly_rate),
        default_capacity: Number(values.default_capacity),
        description: values.description.trim() || null,
      });
    } catch (error) {
      setSubmitError(error.message || 'Room type could not be updated.');
    }
  };

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(submit)}>
      {submitError ? <Alert variant="error">{submitError}</Alert> : null}
      <div className="rounded-card bg-page p-4">
        <p className="text-xs font-semibold text-muted">Room type code</p>
        <p className="mt-1 text-lg font-bold text-primary">{roomType.code}</p>
        <p className="mt-1 text-xs text-muted">
          The code is fixed because it is used in room codes.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          error={errors.name?.message}
          label="Name"
          name="name"
          required
          {...register('name', {
            required: 'Room type name is required',
            maxLength: {
              value: 100,
              message: 'Name must not exceed 100 characters',
            },
          })}
        />
        <FormField
          error={errors.monthly_rate?.message}
          label="Monthly rate (KSh)"
          min="0.01"
          name="monthly_rate"
          required
          step="0.01"
          type="number"
          {...register('monthly_rate', {
            required: 'Monthly rate is required',
            min: { value: 0.01, message: 'Rate must be greater than zero' },
          })}
        />
        <FormField
          error={errors.default_capacity?.message}
          label="Default capacity"
          min="1"
          name="default_capacity"
          required
          type="number"
          {...register('default_capacity', {
            required: 'Default capacity is required',
            min: { value: 1, message: 'Capacity must be greater than zero' },
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
      <Alert variant="information">
        Rate and capacity changes apply to future rooms or allocations only.
        Existing room capacities and allocation rate snapshots are unchanged.
      </Alert>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button isLoading={isSubmitting} type="submit">
          <LuSave aria-hidden="true" className="size-4" />
          Save Changes
        </Button>
      </div>
    </form>
  );
}
