import { useCallback, useEffect, useState } from 'react';
import { LuPencil, LuSave, LuX } from 'react-icons/lu';
import { useForm } from 'react-hook-form';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusChip } from '../../../components/common/StatusChip';
import { Alert } from '../../../components/feedback/Alert';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingSpinner } from '../../../components/feedback/LoadingSpinner';
import { FormField } from '../../../components/forms/FormField';
import { useAuth } from '../../../hooks/useAuth';
import {
  getMyStudentProfile,
  updateMyStudentProfile,
} from '../services/student.service';

const PHONE_PATTERN = /^[0-9+()\-\s]+$/;
const EDITABLE_FIELDS = new Set([
  'phone',
  'course',
  'year_of_study',
  'emergency_contact_name',
  'emergency_contact_phone',
]);

const toFormValues = (student) => ({
  phone: student?.phone || '',
  course: student?.course || '',
  year_of_study: student?.year_of_study || '',
  emergency_contact_name: student?.emergency_contact_name || '',
  emergency_contact_phone: student?.emergency_contact_phone || '',
});

const displayValue = (value) => value || 'Not provided';

const formatStatus = (status) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Not available';

const validateOptionalPhone = (value) => {
  if (!value) {
    return true;
  }

  if (value.length < 7 || value.length > 30) {
    return 'Phone number must be between 7 and 30 characters';
  }

  return PHONE_PATTERN.test(value) || 'Enter a valid phone number';
};

const validateOptionalText = (label, value) => {
  if (!value) {
    return true;
  }

  return (
    (value.length >= 2 && value.length <= 150) ||
    `${label} must be between 2 and 150 characters`
  );
};

function SummaryItem({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase text-muted">{label}</dt>
      <dd className="mt-2 break-words text-sm font-semibold text-text">
        {children}
      </dd>
    </div>
  );
}

export function StudentProfilePage() {
  const { refreshUser } = useAuth();
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: toFormValues(null),
  });

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);

    try {
      const loadedStudent = await getMyStudentProfile();

      if (!loadedStudent) {
        setLoadError(true);
        return;
      }

      setStudent(loadedStudent);
      reset(toFormValues(loadedStudent));
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const startEditing = () => {
    reset(toFormValues(student));
    setFormError('');
    setSuccessMessage('');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    reset(toFormValues(student));
    setFormError('');
    setIsEditing(false);
  };

  const submitProfile = async (formData) => {
    setFormError('');
    setSuccessMessage('');

    const updateData = {
      phone: formData.phone,
      course: formData.course,
      year_of_study: formData.year_of_study
        ? Number(formData.year_of_study)
        : null,
      emergency_contact_name: formData.emergency_contact_name,
      emergency_contact_phone: formData.emergency_contact_phone,
    };

    try {
      const updatedStudent = await updateMyStudentProfile(updateData);

      setStudent(updatedStudent);
      reset(toFormValues(updatedStudent));
      setIsEditing(false);
      setSuccessMessage('Your profile was updated successfully.');
      await refreshUser();
    } catch (error) {
      error.errors?.forEach((validationError) => {
        if (EDITABLE_FIELDS.has(validationError.field)) {
          setError(validationError.field, {
            message: validationError.message,
          });
        }
      });
      setFormError(error.message || 'We could not update your profile.');
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Card className="grid min-h-72 place-items-center">
          <LoadingSpinner label="Loading your profile" />
        </Card>
      </PageContainer>
    );
  }

  if (loadError || !student) {
    return (
      <PageContainer>
        <Card>
          <ErrorState
            description="We could not load your Student profile."
            onRetry={loadProfile}
            title="Profile unavailable"
          />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        actions={
          !isEditing ? (
            <Button onClick={startEditing}>
              <LuPencil aria-hidden="true" className="size-4" />
              Edit profile
            </Button>
          ) : null
        }
        description="View and update your personal information."
        title="My Profile"
      />

      <div className="space-y-6">
        {successMessage ? (
          <Alert variant="success">{successMessage}</Alert>
        ) : null}

        <Card>
          <h2 className="text-lg font-bold text-text">Account summary</h2>
          <p className="mt-1 text-sm text-muted">
            These account fields are read-only.
          </p>
          <dl className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryItem label="Name">
              {displayValue(student.full_name)}
            </SummaryItem>
            <SummaryItem label="Student number">
              {displayValue(student.student_number)}
            </SummaryItem>
            <SummaryItem label="Email">
              {displayValue(student.email)}
            </SummaryItem>
            <SummaryItem label="Account status">
              <StatusChip
                variant={
                  student.account_status === 'active' ? 'success' : 'warning'
                }
              >
                {formatStatus(student.account_status)}
              </StatusChip>
            </SummaryItem>
            <SummaryItem label="Role">Student</SummaryItem>
          </dl>
        </Card>

        {isEditing ? (
          <Card>
            <h2 className="text-lg font-bold text-text">
              Edit personal information
            </h2>
            <p className="mt-1 text-sm text-muted">
              Only the fields below can be changed.
            </p>

            <form
              className="mt-6 space-y-6"
              noValidate
              onSubmit={handleSubmit(submitProfile)}
            >
              {formError ? <Alert variant="error">{formError}</Alert> : null}

              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  error={errors.phone?.message}
                  label="Phone number"
                  name="phone"
                  placeholder="+254..."
                  {...register('phone', {
                    validate: validateOptionalPhone,
                  })}
                />
                <FormField
                  error={errors.course?.message}
                  label="Course"
                  name="course"
                  {...register('course', {
                    validate: (value) => validateOptionalText('Course', value),
                  })}
                />
                <FormField
                  error={errors.year_of_study?.message}
                  label="Year of study"
                  min="1"
                  name="year_of_study"
                  type="number"
                  {...register('year_of_study', {
                    validate: (value) =>
                      !value ||
                      (Number.isInteger(Number(value)) && Number(value) >= 1) ||
                      'Year of study must be a positive integer',
                  })}
                />
                <FormField
                  error={errors.emergency_contact_name?.message}
                  label="Emergency contact name"
                  name="emergency_contact_name"
                  {...register('emergency_contact_name', {
                    validate: (value) =>
                      validateOptionalText('Emergency contact name', value),
                  })}
                />
                <FormField
                  className="md:col-span-2"
                  error={errors.emergency_contact_phone?.message}
                  label="Emergency contact phone"
                  name="emergency_contact_phone"
                  placeholder="+254..."
                  {...register('emergency_contact_phone', {
                    validate: validateOptionalPhone,
                  })}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  disabled={isSubmitting}
                  onClick={cancelEditing}
                  variant="secondary"
                >
                  <LuX aria-hidden="true" className="size-4" />
                  Cancel
                </Button>
                <Button isLoading={isSubmitting} type="submit">
                  <LuSave aria-hidden="true" className="size-4" />
                  Save changes
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card>
            <h2 className="text-lg font-bold text-text">
              Personal information
            </h2>
            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <SummaryItem label="Phone number">
                {displayValue(student.phone)}
              </SummaryItem>
              <SummaryItem label="Course">
                {displayValue(student.course)}
              </SummaryItem>
              <SummaryItem label="Year of study">
                {displayValue(student.year_of_study)}
              </SummaryItem>
              <SummaryItem label="Emergency contact name">
                {displayValue(student.emergency_contact_name)}
              </SummaryItem>
              <SummaryItem label="Emergency contact phone">
                {displayValue(student.emergency_contact_phone)}
              </SummaryItem>
            </dl>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
