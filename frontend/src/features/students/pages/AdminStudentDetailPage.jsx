import { useCallback, useEffect, useState } from 'react';
import {
  LuArrowLeft,
  LuGraduationCap,
  LuPencil,
  LuShieldCheck,
} from 'react-icons/lu';
import { Link, useLocation, useParams } from 'react-router-dom';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusChip } from '../../../components/common/StatusChip';
import { Alert } from '../../../components/feedback/Alert';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { PanelSkeleton } from '../../../components/feedback/Skeleton';
import { StudentAccountForm } from '../components/StudentAccountForm';
import {
  getStudentById,
  updateStudent,
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
      <dt className="text-xs font-semibold text-muted">{label}</dt>
      <dd className="mt-1.5 break-words text-sm font-semibold text-text">
        {children}
      </dd>
    </div>
  );
}

export function AdminStudentDetailPage() {
  const { studentId } = useParams();
  const location = useLocation();
  const [student, setStudent] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.notice || ''
  );
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

  const submitStudentUpdate = async (studentData) => {
    const updatedStudent = await updateStudent(student.id, studentData);

    if (!updatedStudent) {
      throw new Error('The updated Student account could not be loaded.');
    }

    setStudent(updatedStudent);
    setSelectedStatus(updatedStudent.account_status);
    setSuccessMessage('Student account updated successfully.');
    setIsEditingAccount(false);
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
        <PanelSkeleton label="Loading student details" />
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
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-card px-2 text-sm font-semibold text-primary hover:text-primary-hover focus-visible:outline-primary"
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
          <>
            {!isEditingAccount ? (
              <Button
                onClick={() => {
                  setSuccessMessage('');
                  setStatusError('');
                  setIsConfirming(false);
                  setIsEditingAccount(true);
                }}
              >
                <LuPencil aria-hidden="true" className="size-4" />
                Edit account
              </Button>
            ) : null}
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-card bg-periwinkle-light px-4 py-2.5 text-sm font-semibold text-primary hover:bg-periwinkle focus-visible:outline-primary"
              to="/admin/students"
            >
              <LuArrowLeft aria-hidden="true" className="size-4" />
              Back to students
            </Link>
          </>
        }
        description="Review student information and account access."
        title="Student Details"
      />

      <div className="space-y-6">
        {successMessage ? (
          <Alert variant="success">{successMessage}</Alert>
        ) : null}

        <Card className="bg-primary text-white">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <LuGraduationCap
                className="size-8 shrink-0 text-periwinkle"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="break-words text-xl font-bold">
                  {displayValue(student.full_name)}
                </p>
                <p className="mt-1 break-words text-sm text-periwinkle-light">
                  {displayValue(student.student_number)}
                </p>
              </div>
            </div>
            <StatusChip variant={statusVariant[student.account_status]}>
              {formatStatus(student.account_status)}
            </StatusChip>
          </div>
        </Card>

        {isEditingAccount ? (
          <Card>
            <h2 className="text-lg font-bold text-text">
              Edit student information
            </h2>
            <p className="mt-1 text-sm text-muted">
              Account status and sign-in settings are managed separately.
            </p>
            <div className="mt-6">
              <StudentAccountForm
                initialValues={student}
                onCancel={() => setIsEditingAccount(false)}
                onSubmit={submitStudentUpdate}
                submitLabel="Save changes"
              />
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
            <Card>
              <h2 className="text-lg font-bold text-text">
                Personal information
              </h2>
              <dl className="mt-6 grid gap-6 sm:grid-cols-2">
                <DetailItem label="Phone">
                  {displayValue(student.phone)}
                </DetailItem>
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
              </dl>
            </Card>

            <Card>
              <h2 className="text-lg font-bold text-text">
                Account information
              </h2>
              <dl className="mt-6 space-y-5">
                <DetailItem label="Email">
                  {displayValue(student.email)}
                </DetailItem>
                <DetailItem label="Registered">
                  {formatDate(student.account_created_at)}
                </DetailItem>
                <DetailItem label="Last login">
                  {formatDate(student.last_login_at, true)}
                </DetailItem>
                <DetailItem label="Role">Student</DetailItem>
              </dl>
            </Card>
          </div>
        )}

        <Card>
          <div className="flex items-start gap-3">
            <LuShieldCheck
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-primary"
            />
            <div>
              <h2 className="text-lg font-bold text-text">Account status</h2>
              <p className="mt-1 text-sm text-muted">
                Status controls whether this student can sign in.
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
                    className="min-h-11 w-full rounded-card border border-border bg-card px-3.5 py-2.5 text-sm text-text outline-none hover:border-periwinkle focus:border-primary focus:ring-3 focus:ring-primary-soft"
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
      </div>
    </PageContainer>
  );
}
