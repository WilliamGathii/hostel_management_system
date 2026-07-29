import { useEffect, useState } from 'react';
import { LuReceiptText } from 'react-icons/lu';
import { useForm } from 'react-hook-form';

import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/feedback/Alert';
import { FormField } from '../../../components/forms/FormField';
import { SelectField } from '../../../components/forms/SelectField';
import { TextAreaField } from '../../../components/forms/TextAreaField';
import {
  getAllocations,
  getMyAllocation,
} from '../../rooms/services/room.service';

export function PaymentForm({
  contextAllocation = null,
  contextStudent = null,
  isAdmin,
  onCancel,
  onSubmit,
}) {
  const [allocationOptions, setAllocationOptions] = useState([]);
  const [allocationError, setAllocationError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
  } = useForm({
    defaultValues: {
      room_allocation_id: '',
      amount: '',
      payment_method: '',
      transaction_reference: '',
      payment_date: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  useEffect(() => {
    let active = true;
    const loadAllocations = async () => {
      try {
        if (isAdmin && contextStudent) {
          const contextualAllocations = contextAllocation
            ? [contextAllocation]
            : [];
          setAllocationOptions(contextualAllocations);
          setValue('room_allocation_id', contextAllocation?.id || '');
        } else if (isAdmin) {
          const result = await getAllocations({
            page: 1,
            limit: 50,
            status: 'active',
          });
          if (active) {
            setAllocationOptions(
              Array.isArray(result.allocations) ? result.allocations : []
            );
          }
        } else {
          const allocation = await getMyAllocation();
          if (active && allocation?.id) {
            setValue('room_allocation_id', allocation.id);
            setAllocationOptions([allocation]);
          }
        }
      } catch (error) {
        if (active && isAdmin) {
          setAllocationError(
            error.message || 'Active allocations could not be loaded.'
          );
        }
      }
    };
    loadAllocations();
    return () => {
      active = false;
    };
  }, [contextAllocation, contextStudent, isAdmin, setValue]);

  const submit = async (values) => {
    setSubmitError('');
    try {
      await onSubmit({
        room_allocation_id: values.room_allocation_id || null,
        amount: Number(values.amount),
        payment_method: values.payment_method.trim(),
        transaction_reference: values.transaction_reference.trim() || null,
        payment_date: values.payment_date,
        notes: values.notes.trim() || null,
      });
    } catch (error) {
      setSubmitError(
        error.message || 'The simulated payment record could not be saved.'
      );
    }
  };

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(submit)}>
      {submitError ? <Alert variant="error">{submitError}</Alert> : null}
      {allocationError ? (
        <Alert variant="error">{allocationError}</Alert>
      ) : null}

      {isAdmin && contextStudent ? (
        <div className="rounded-card bg-page p-4">
          <p className="text-xs font-semibold text-muted">Selected student</p>
          <p className="mt-1 font-bold text-text">{contextStudent.full_name}</p>
          <p className="mt-1 text-sm text-muted">
            {contextStudent.student_number}
          </p>
          <p className="mt-3 text-xs text-information">
            This student is locked to the current record.
          </p>
          <input
            type="hidden"
            {...register('room_allocation_id', {
              required: 'An active room allocation is required',
            })}
          />
          {errors.room_allocation_id ? (
            <p className="mt-2 text-sm text-error" role="alert">
              {errors.room_allocation_id.message}
            </p>
          ) : null}
        </div>
      ) : isAdmin ? (
        <SelectField
          error={errors.room_allocation_id?.message}
          label="Student allocation"
          name="room_allocation_id"
          required
          {...register('room_allocation_id', {
            required: 'Select an active room allocation',
          })}
        >
          <option value="">Select an allocation</option>
          {allocationOptions.map((allocation) => (
            <option key={allocation.id} value={allocation.id}>
              {allocation.student_name} ({allocation.student_number}) - Room{' '}
              {allocation.room_number}
            </option>
          ))}
        </SelectField>
      ) : null}

      {isAdmin && contextStudent && !contextAllocation ? (
        <Alert variant="error">
          This student needs an active room allocation before a simulated
          payment can be recorded.
        </Alert>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          error={errors.amount?.message}
          label="Payment amount"
          min="0.01"
          name="amount"
          required
          step="0.01"
          type="number"
          {...register('amount', {
            required: 'Payment amount is required',
            min: { value: 0.01, message: 'Amount must be greater than zero' },
          })}
        />
        <FormField
          error={errors.payment_method?.message}
          hint="Describe the simulated method. Do not enter card or bank details."
          label="Payment method"
          name="payment_method"
          required
          {...register('payment_method', {
            required: 'Payment method is required',
            maxLength: {
              value: 50,
              message: 'Payment method must not exceed 50 characters',
            },
          })}
        />
        <FormField
          error={errors.transaction_reference?.message}
          label="Transaction reference"
          name="transaction_reference"
          {...register('transaction_reference', {
            maxLength: {
              value: 100,
              message: 'Reference must not exceed 100 characters',
            },
          })}
        />
        <FormField
          error={errors.payment_date?.message}
          label="Payment date"
          name="payment_date"
          required
          type="date"
          {...register('payment_date', {
            required: 'Payment date is required',
          })}
        />
      </div>
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
      <Alert variant="warning">
        This record is simulated. It does not transfer or confirm real money.
      </Alert>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button
          disabled={Boolean(isAdmin && contextStudent && !contextAllocation)}
          isLoading={isSubmitting}
          type="submit"
        >
          <LuReceiptText aria-hidden="true" className="size-4" />
          Record Simulated Payment
        </Button>
      </div>
    </form>
  );
}
