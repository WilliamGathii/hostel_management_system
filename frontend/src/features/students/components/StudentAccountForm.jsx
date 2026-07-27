import { useState } from 'react';
import { LuSave, LuX } from 'react-icons/lu';
import { useForm } from 'react-hook-form';

import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/feedback/Alert';
import { FormField } from '../../../components/forms/FormField';
import { PasswordField } from '../../../components/forms/PasswordField';

const PHONE_PATTERN = /^[0-9+()\-\s]+$/;
const FORM_FIELDS = new Set([
  'full_name',
  'email',
  'phone',
  'student_number',
  'course',
  'year_of_study',
  'emergency_contact_name',
  'emergency_contact_phone',
  'password',
]);

const toFormValues = (student = {}) => ({
  full_name: student.full_name || '',
  email: student.email || '',
  phone: student.phone || '',
  student_number: student.student_number || '',
  course: student.course || '',
  year_of_study: student.year_of_study || '',
  emergency_contact_name: student.emergency_contact_name || '',
  emergency_contact_phone: student.emergency_contact_phone || '',
  password: '',
  confirm_password: '',
});

const optionalTextRules = (label) => ({
  minLength: {
    value: 2,
    message: `${label} must have at least 2 characters`,
  },
  maxLength: {
    value: 150,
    message: `${label} must not exceed 150 characters`,
  },
});

const optionalPhoneRules = (label) => ({
  validate: (value) => {
    if (!value) {
      return true;
    }

    if (value.length < 7 || value.length > 30) {
      return `${label} must be between 7 and 30 characters`;
    }

    return PHONE_PATTERN.test(value) || `Enter a valid ${label.toLowerCase()}`;
  },
});

export function StudentAccountForm({
  includePassword = false,
  initialValues,
  onCancel,
  onSubmit,
  submitLabel,
}) {
  const [submitError, setSubmitError] = useState('');
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: toFormValues(initialValues),
  });

  const submitForm = async (values) => {
    setSubmitError('');

    const studentData = {
      full_name: values.full_name,
      email: values.email,
      phone: values.phone,
      student_number: values.student_number,
      course: values.course,
      year_of_study: values.year_of_study ? Number(values.year_of_study) : null,
      emergency_contact_name: values.emergency_contact_name,
      emergency_contact_phone: values.emergency_contact_phone,
    };

    if (includePassword) {
      studentData.password = values.password;
    }

    try {
      await onSubmit(studentData);
    } catch (error) {
      error.errors?.forEach((validationError) => {
        if (FORM_FIELDS.has(validationError.field)) {
          setError(validationError.field, {
            type: 'server',
            message: validationError.message,
          });
        }
      });
      setSubmitError(error.message || 'We could not save the Student account.');
    }
  };

  return (
    <form className="space-y-6" noValidate onSubmit={handleSubmit(submitForm)}>
      {submitError ? <Alert variant="error">{submitError}</Alert> : null}

      <fieldset>
        <legend className="text-sm font-bold text-text">Account identity</legend>
        <p className="mt-1 text-sm text-muted">
          Sign-in and student identification details.
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <FormField
            autoComplete="name"
            error={errors.full_name?.message}
            label="Full name"
            name="full_name"
            required
            {...register('full_name', {
              required: 'Full name is required',
              ...optionalTextRules('Full name'),
            })}
          />
          <FormField
            autoComplete="email"
            error={errors.email?.message}
            label="Email address"
            name="email"
            required
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
          />
          <FormField
            autoComplete="tel"
            error={errors.phone?.message}
            label="Phone number"
            name="phone"
            placeholder="+254..."
            type="tel"
            {...register('phone', optionalPhoneRules('Phone number'))}
          />
          <FormField
            error={errors.student_number?.message}
            label="Student number"
            name="student_number"
            required
            {...register('student_number', {
              required: 'Student number is required',
              maxLength: {
                value: 50,
                message: 'Student number must not exceed 50 characters',
              },
              pattern: {
                value: /^[A-Za-z0-9/-]+$/,
                message: 'Student number contains unsupported characters',
              },
            })}
          />
        </div>
      </fieldset>

      <fieldset className="border-t border-border pt-6">
        <legend className="text-sm font-bold text-text">Hostel profile</legend>
        <p className="mt-1 text-sm text-muted">
          Academic and emergency contact information.
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <FormField
            error={errors.course?.message}
            label="Course"
            name="course"
            {...register('course', optionalTextRules('Course'))}
          />
          <FormField
            error={errors.year_of_study?.message}
            label="Year of study"
            min="1"
            name="year_of_study"
            type="number"
            {...register('year_of_study', {
              min: {
                value: 1,
                message: 'Year of study must be a positive number',
              },
            })}
          />
          <FormField
            error={errors.emergency_contact_name?.message}
            label="Emergency contact name"
            name="emergency_contact_name"
            {...register(
              'emergency_contact_name',
              optionalTextRules('Emergency contact name')
            )}
          />
          <FormField
            error={errors.emergency_contact_phone?.message}
            label="Emergency contact phone"
            name="emergency_contact_phone"
            placeholder="+254..."
            type="tel"
            {...register(
              'emergency_contact_phone',
              optionalPhoneRules('Emergency contact phone')
            )}
          />
        </div>
      </fieldset>

      {includePassword ? (
        <fieldset className="border-t border-border pt-6">
          <legend className="text-sm font-bold text-text">
            Temporary password
          </legend>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <PasswordField
              autoComplete="new-password"
              error={errors.password?.message}
              hint="Give this temporary password to the Student securely."
              name="password"
              required
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must have at least 8 characters',
                },
                maxLength: {
                  value: 72,
                  message: 'Password must not exceed 72 characters',
                },
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*[0-9])/,
                  message: 'Password must contain a letter and a number',
                },
              })}
            />
            <PasswordField
              autoComplete="new-password"
              error={errors.confirm_password?.message}
              label="Confirm password"
              name="confirm_password"
              required
              {...register('confirm_password', {
                required: 'Confirm the password',
                validate: (value) =>
                  value === getValues('password') || 'Passwords do not match',
              })}
            />
          </div>
        </fieldset>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            disabled={isSubmitting}
            onClick={onCancel}
            variant="secondary"
          >
            <LuX aria-hidden="true" className="size-4" />
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
