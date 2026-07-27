import { useCallback, useEffect, useState } from 'react';
import { LuArrowLeft, LuShieldCheck } from 'react-icons/lu';
import { Link, useParams } from 'react-router-dom';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusChip } from '../../../components/common/StatusChip';
import { Alert } from '../../../components/feedback/Alert';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingSpinner } from '../../../components/feedback/LoadingSpinner';
import {
  getStudentById,
  updateStudentStatus,
} from '../services/student.service';

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Inactive', value: 'inactive' },
];

const statusVariant = {
  active: 'success',
  suspended: 'warning',
  inactive: 'neutral',
};

const statusMessages = {
  active: {
    title: 'Activate this student account?',
    description: 'The student will be able to use their account again.',
  },
  suspended: {
    title: 'Suspend this student account?',
    description:
      'The student will not be able to log in while the account is suspended.',
  },
  inactive: {
    title: 'Deactivate this student account?',
    description: 'The student will not be able to log in while it is inactive.',
  },
};

const displayValue = (value) => value || 'Not provided';

const formatStatus = (status) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Not available';

const formatDate = (value, includeTime = false) => {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    ...(includeTime ? { timeStyle: 'short' } : {}),
  }).format(date);
};

function DetailItem({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase text-muted">{label}</dt>
      <dd className="mt-2 break-words text-sm font-semibold text-text">
        {children}
      </dd>
    </div>
  );
}

export function AdminStudentDetailPage() {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusError, setStatusError] = useState('');

  const loadStudent = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);

    try {
      const loadedStudent = await getStudentById(studentId);

      if (!loadedStudent) {
        setLoadError(true);
        return;
      }

      setStudent(loadedStudent);
      setSelectedStatus(loadedStudent.account_status);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  const requestStatusChange = () => {
    setSuccessMessage('');
    setStatusError('');

    if (!selectedStatus || selectedStatus === student.account_status) {
      setStatusError('Choose a different account status before continuing.');
      return;
    }

    setIsConfirming(true);
  };

  const cancelStatusChange = () => {
    setSelectedStatus(student.account_status);
    setStatusError('');
    setIsConfirming(false);
  };

  const confirmStatusChange = async () => {
    setIsSaving(true);
    setStatusError('');

    try {
      const updatedStudent = await updateStudentStatus(
        student.id,
        selectedStatus
      );
      const nextStudent = updatedStudent || {
        ...student,
        account_status: selectedStatus,
      };

      setStudent(nextStudent);
      setSelectedStatus(nextStudent.account_status);
      setSuccessMessage(
        `The student account is now ${nextStudent.account_status}.`
      );
      setIsConfirming(false);
    } catch (error) {
      setStatusError(
        error.message || 'We could not update the student account status.'
      );
      setIsConfirming(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Card className="grid min-h-72 place-items-center">
          <LoadingSpinner label="Loading student details" />
        </Card>
      </PageContainer>
    );
  }

  if (loadError || !student) {
    return (
      <PageContainer>
        <PageHeader title="Student details" />
        <Card>
          <ErrorState
            description="The student record could not be found or loaded."
            onRetry={loadStudent}
            title="Student unavailable"
          />
        </Card>
        <Link
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-card px-2 text-sm font-semibold text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          to="/admin/students"
        >
          <LuArrowLeft aria-hidden="true" className="size-4" />
          Back to Student Management
        </Link>
      </PageContainer>
    );
  }

  const confirmation =
    statusMessages[selectedStatus] || statusMessages[student.account_status];

  return (
    <PageContainer>
      <PageHeader
        actions={
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-card border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text hover:bg-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            to="/admin/students"
          >
            <LuArrowLeft aria-hidden="true" className="size-4" />
            Back to students
          </Link>
        }
        description="Review safe account information and manage account status."
        title="Student Details"
      />

      <div className="space-y-6">
        {successMessage ? (
          <Alert variant="success">{successMessage}</Alert>
        ) : null}

        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-text">
                {displayValue(student.full_name)}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {displayValue(student.student_number)}
              </p>
            </div>
            <StatusChip variant={statusVariant[student.account_status]}>
              {formatStatus(student.account_status)}
            </StatusChip>
          </div>

          <dl className="mt-7 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <DetailItem label="Email">{displayValue(student.email)}</DetailItem>
            <DetailItem label="Phone">{displayValue(student.phone)}</DetailItem>
            <DetailItem label="Course">
              {displayValue(student.course)}
            </DetailItem>
            <DetailItem label="Year of study">
              {displayValue(student.year_of_study)}
            </DetailItem>
            <DetailItem label="Emergency contact">
              {displayValue(student.emergency_contact_name)}
            </DetailItem>
            <DetailItem label="Emergency phone">
              {displayValue(student.emergency_contact_phone)}
            </DetailItem>
            <DetailItem label="Registered">
              {formatDate(student.account_created_at)}
            </DetailItem>
            <DetailItem label="Last login">
              {formatDate(student.last_login_at, true)}
            </DetailItem>
          </dl>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-card bg-primary-soft text-primary">
              <LuShieldCheck aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-text">Account status</h2>
              <p className="mt-1 text-sm text-muted">
                Status changes affect whether this student can log in.
              </p>
            </div>
          </div>

          <div className="mt-6 max-w-xl">
            {statusError ? (
              <div className="mb-4">
                <Alert variant="error">{statusError}</Alert>
              </div>
            ) : null}

            {isConfirming ? (
              <Alert variant="warning">
                <p className="font-semibold">{confirmation.title}</p>
                <p className="mt-1">{confirmation.description}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    isLoading={isSaving}
                    onClick={confirmStatusChange}
                    variant="danger"
                  >
                    Confirm change
                  </Button>
                  <Button
                    disabled={isSaving}
                    onClick={cancelStatusChange}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </Alert>
            ) : (
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div>
                  <label
                    className="mb-1.5 block text-sm font-semibold text-text"
                    htmlFor="account-status"
                  >
                    Student account status
                  </label>
                  <select
                    className="min-h-11 w-full rounded-card border border-border bg-card px-3.5 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
                    id="account-status"
                    onChange={(event) => {
                      setSelectedStatus(event.target.value);
                      setStatusError('');
                      setSuccessMessage('');
                    }}
                    value={selectedStatus}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  disabled={selectedStatus === student.account_status}
                  onClick={requestStatusChange}
                >
                  Apply status
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Alert>
          Room, maintenance, visitor and payment information will be available
          after those modules are developed.
        </Alert>
      </div>
    </PageContainer>
  );
}
