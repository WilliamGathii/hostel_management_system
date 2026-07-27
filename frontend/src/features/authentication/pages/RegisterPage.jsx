import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/feedback/Alert';
import { FormField } from '../../../components/forms/FormField';
import { PasswordField } from '../../../components/forms/PasswordField';
import { useAuth } from '../../../hooks/useAuth';
import { getRoleHomePath } from '../../../utils/role-home';

const acceptedFields = new Set([
  'full_name',
  'email',
  'phone',
  'password',
  'student_number',
  'course',
  'year_of_study',
  'emergency_contact_name',
  'emergency_contact_phone',
]);

export function RegisterPage() {
  const [submitError, setSubmitError] = useState('');
  const { registerStudent } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      student_number: '',
      course: '',
      year_of_study: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      password: '',
      confirm_password: '',
    },
  });

  const applyBackendErrors = (backendErrors = []) => {
    backendErrors.forEach((error) => {
      if (acceptedFields.has(error.field)) {
        setError(error.field, {
          type: 'server',
          message: error.message,
        });
      }
    });
  };

  const onSubmit = async (values) => {
    setSubmitError('');
    const registrationData = { ...values };

    delete registrationData.confirm_password;

    try {
      const result = await registerStudent(registrationData);

      if (result.token && result.user) {
        navigate(getRoleHomePath(result.user.role), {
          replace: true,
        });
        return;
      }

      navigate('/login', {
        replace: true,
        state: {
          notice: 'Student account created. You can now sign in.',
        },
      });
    } catch (error) {
      applyBackendErrors(error.errors);
      setSubmitError(error.message || 'Unable to create the account.');
    }
  };

  return (
    <div>
      <div>
        <p className="text-sm font-semibold text-information">
          Student registration
        </p>
        <h2 className="mt-1 text-2xl font-bold text-text">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-muted">
          Registration is available to students only.
        </p>
      </div>

      {submitError ? (
        <div className="mt-5">
          <Alert variant="error">{submitError}</Alert>
        </div>
      ) : null}

      <form
        className="mt-6 space-y-5"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormField
          autoComplete="name"
          error={errors.full_name?.message}
          label="Full name"
          name="full_name"
          required
          {...register('full_name', {
            required: 'Full name is required',
            minLength: {
              value: 2,
              message: 'Full name must have at least 2 characters',
            },
            maxLength: {
              value: 150,
              message: 'Full name must not exceed 150 characters',
            },
          })}
        />

        <div className="grid gap-5 sm:grid-cols-2">
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
            required
            type="tel"
            {...register('phone', {
              required: 'Phone number is required',
              minLength: {
                value: 7,
                message: 'Phone number must have at least 7 characters',
              },
              maxLength: {
                value: 30,
                message: 'Phone number must not exceed 30 characters',
              },
              pattern: {
                value: /^[0-9+()\-\s]+$/,
                message: 'Enter a valid phone number',
              },
            })}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
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
          <FormField
            error={errors.course?.message}
            label="Course (optional)"
            name="course"
            {...register('course', {
              minLength: {
                value: 2,
                message: 'Course must have at least 2 characters',
              },
              maxLength: {
                value: 150,
                message: 'Course must not exceed 150 characters',
              },
            })}
          />
        </div>

        <FormField
          error={errors.year_of_study?.message}
          label="Year of study (optional)"
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

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            error={errors.emergency_contact_name?.message}
            label="Emergency contact name (optional)"
            name="emergency_contact_name"
            {...register('emergency_contact_name', {
              minLength: {
                value: 2,
                message: 'Contact name must have at least 2 characters',
              },
              maxLength: {
                value: 150,
                message: 'Contact name must not exceed 150 characters',
              },
            })}
          />
          <FormField
            error={errors.emergency_contact_phone?.message}
            label="Emergency contact phone (optional)"
            name="emergency_contact_phone"
            type="tel"
            {...register('emergency_contact_phone', {
              minLength: {
                value: 7,
                message: 'Contact phone must have at least 7 characters',
              },
              maxLength: {
                value: 30,
                message: 'Contact phone must not exceed 30 characters',
              },
              pattern: {
                value: /^[0-9+()\-\s]+$/,
                message: 'Enter a valid contact phone number',
              },
            })}
          />
        </div>

        <PasswordField
          autoComplete="new-password"
          error={errors.password?.message}
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
            required: 'Confirm your password',
            validate: (value) =>
              value === getValues('password') || 'Passwords do not match',
          })}
        />

        <Button className="w-full" isLoading={isSubmitting} type="submit">
          Create student account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link
          className="font-semibold text-information hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          to="/login"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
