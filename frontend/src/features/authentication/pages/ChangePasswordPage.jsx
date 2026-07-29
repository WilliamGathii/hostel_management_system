import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/feedback/Alert';
import { PasswordField } from '../../../components/forms/PasswordField';
import { useAuth } from '../../../hooks/useAuth';

const passwordByteLength = (value) => new TextEncoder().encode(value).length;

export function ChangePasswordPage() {
  const [submitError, setSubmitError] = useState('');
  const { changeRequiredPassword } = useAuth();
  const navigate = useNavigate();
  const {
    getValues,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    setSubmitError('');

    try {
      await changeRequiredPassword(values);
      navigate('/login', {
        replace: true,
        state: {
          notice:
            'Your password has been changed. Log in using your new password.',
          noticeVariant: 'success',
          passwordChangeFinished: true,
        },
      });
    } catch (error) {
      if (error.statusCode === 401) {
        navigate('/login', {
          replace: true,
          state: {
            notice:
              'Your password-change session expired. Please log in again.',
            noticeVariant: 'information',
            passwordChangeFinished: true,
          },
        });
        return;
      }

      error.errors?.forEach((fieldError) => {
        if (['newPassword', 'confirmPassword'].includes(fieldError.field)) {
          setError(fieldError.field, {
            message: fieldError.message,
            type: 'server',
          });
        }
      });
      setSubmitError(
        error.message === 'Validation failed'
          ? 'Check the password details and try again.'
          : error.message || 'The password could not be changed.'
      );
    }
  };

  return (
    <div>
      <div>
        <p className="text-sm font-semibold text-information">
          Account security
        </p>
        <h2 className="mt-1 text-2xl font-bold text-text">
          Create a new password
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          You must replace your temporary password before accessing your
          account.
        </p>
      </div>

      <div className="mt-5">
        <Alert variant="information">
          You need to create a new password before continuing.
        </Alert>
      </div>

      {submitError ? (
        <div className="mt-4">
          <Alert variant="error">{submitError}</Alert>
        </div>
      ) : null}

      <form
        className="mt-6 space-y-5"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <PasswordField
          autoComplete="new-password"
          error={errors.newPassword?.message}
          hint="Use at least 8 characters with a letter and a number."
          label="New password"
          name="newPassword"
          placeholder="Enter a new password"
          required
          {...register('newPassword', {
            required: 'New password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
            validate: {
              containsLetter: (value) =>
                /[A-Za-z]/.test(value) ||
                'Password must contain at least one letter',
              containsNumber: (value) =>
                /[0-9]/.test(value) ||
                'Password must contain at least one number',
              safeLength: (value) =>
                passwordByteLength(value) <= 72 ||
                'Password must not exceed 72 bytes',
            },
          })}
        />

        <PasswordField
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          label="Confirm new password"
          name="confirmPassword"
          placeholder="Enter the new password again"
          required
          {...register('confirmPassword', {
            required: 'Password confirmation is required',
            validate: (value) =>
              value === getValues('newPassword') || 'Passwords must match',
          })}
        />

        <Button className="w-full" isLoading={isSubmitting} type="submit">
          Save new password
        </Button>
      </form>
    </div>
  );
}
