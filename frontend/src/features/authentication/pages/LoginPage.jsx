import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/feedback/Alert';
import { FormField } from '../../../components/forms/FormField';
import { PasswordField } from '../../../components/forms/PasswordField';
import { useAuth } from '../../../hooks/useAuth';
import { getRoleHomePath } from '../../../utils/role-home';

export function LoginPage() {
  const [submitError, setSubmitError] = useState('');
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setSubmitError('');

    try {
      const user = await login(values);
      const requestedPath = location.state?.from?.pathname;

      navigate(requestedPath || getRoleHomePath(user.role), {
        replace: true,
      });
    } catch (error) {
      setSubmitError(
        error.statusCode === 401
          ? 'Incorrect email or password.'
          : error.message || 'Unable to sign in. Please try again.'
      );
    }
  };

  return (
    <div>
      <div>
        <p className="text-sm font-semibold text-information">Welcome back</p>
        <h2 className="mt-1 text-2xl font-bold text-text">Sign in</h2>
        <p className="mt-2 text-sm text-muted">
          Use your Hostel Management System account.
        </p>
      </div>

      {submitError ? (
        <div className="mt-5">
          <Alert variant="error">{submitError}</Alert>
        </div>
      ) : null}
      {location.state?.notice ? (
        <div className="mt-5">
          <Alert variant="success">{location.state.notice}</Alert>
        </div>
      ) : null}

      <form
        className="mt-6 space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <FormField
          autoComplete="email"
          error={errors.email?.message}
          label="Email address"
          name="email"
          placeholder="name@example.com"
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

        <div>
          <PasswordField
            autoComplete="current-password"
            error={errors.password?.message}
            name="password"
            placeholder="Enter your password"
            required
            {...register('password', {
              required: 'Password is required',
            })}
          />
          <div className="mt-2 text-right">
            <Link
              className="text-sm font-semibold text-information hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              to="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button className="w-full" isLoading={isSubmitting} type="submit">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New student?{' '}
        <Link
          className="font-semibold text-information hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          to="/register"
        >
          Create a student account
        </Link>
      </p>
    </div>
  );
}
