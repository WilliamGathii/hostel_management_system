import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LuArrowLeft,
  LuBedDouble,
  LuCircleDollarSign,
  LuGraduationCap,
  LuPencil,
  LuShieldCheck,
  LuWrench,
} from 'react-icons/lu';
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusChip } from '../../../components/common/StatusChip';
import { Alert } from '../../../components/feedback/Alert';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { PanelSkeleton } from '../../../components/feedback/Skeleton';
import { getMaintenanceRequests } from '../../maintenance/services/maintenance.service';
import { getPayments } from '../../payments/services/payment.service';
import { getAllocations } from '../../rooms/services/room.service';
import { getVisitors } from '../../visitors/services/visitor.service';
import { StudentAccountForm } from '../components/StudentAccountForm';
import {
  StudentAllocationTab,
  StudentMaintenanceTab,
  StudentPaymentsTab,
  StudentVisitorsTab,
} from '../components/StudentModuleTabs';
import {
  getStudentById,
  updateStudent,
  updateStudentStatus,
} from '../services/student.service';

const tabs = [
  { label: 'Overview', value: 'overview' },
  { label: 'Room & Allocation', value: 'room' },
  { label: 'Payments', value: 'payments' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Visitors', value: 'visitors' },
];

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Inactive', value: 'inactive' },
];

const statusVariant = {
  active: 'success',
  paid: 'success',
  suspended: 'warning',
  pending: 'warning',
  failed: 'error',
  rejected: 'error',
  reversed: 'information',
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

const initialModules = {
  allocations: [],
  maintenanceRequests: [],
  maintenancePagination: {},
  paymentData: {},
  visitors: [],
  errors: {},
  isLoading: true,
};

const displayValue = (value) => value || 'Not provided';

const formatStatus = (status) =>
  status
    ? status
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'Not available';

const formatDate = (value, includeTime = false, fallback = 'Not available') => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    ...(includeTime ? { timeStyle: 'short' } : {}),
  }).format(date);
};

const formatAmount = (amount) =>
  Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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

function SummaryItem({ Icon, label, children }) {
  return (
    <div className="min-w-0 rounded-card bg-page p-4">
      <div className="flex items-center gap-2 text-muted">
        <Icon aria-hidden="true" className="size-4 shrink-0" />
        <dt className="text-xs font-semibold">{label}</dt>
      </div>
      <dd className="mt-2 break-words text-sm font-bold text-text">
        {children}
      </dd>
    </div>
  );
}

export function AdminStudentDetailPage() {
  const { studentId } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab') || 'overview';
  const activeTab = tabs.some((tab) => tab.value === requestedTab)
    ? requestedTab
    : 'overview';
  const [student, setStudent] = useState(null);
  const [modules, setModules] = useState(initialModules);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
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

  const loadModules = useCallback(async () => {
    setModules((current) => ({ ...current, errors: {}, isLoading: true }));
    const results = await Promise.allSettled([
      getAllocations({ page: 1, limit: 50, student_id: studentId }),
      getPayments({ page: 1, limit: 50, student_id: studentId }),
      getMaintenanceRequests({ page: 1, limit: 50, student_id: studentId }),
      getVisitors({ page: 1, limit: 50, student_id: studentId }),
    ]);
    const [allocations, payments, maintenance, visitors] = results;

    setModules({
      allocations:
        allocations.status === 'fulfilled' &&
        Array.isArray(allocations.value.allocations)
          ? allocations.value.allocations
          : [],
      paymentData: payments.status === 'fulfilled' ? payments.value : {},
      maintenanceRequests:
        maintenance.status === 'fulfilled' &&
        Array.isArray(maintenance.value.maintenance_requests)
          ? maintenance.value.maintenance_requests
          : [],
      maintenancePagination:
        maintenance.status === 'fulfilled'
          ? maintenance.value.pagination || {}
          : {},
      visitors:
        visitors.status === 'fulfilled' &&
        Array.isArray(visitors.value.visitors)
          ? visitors.value.visitors
          : [],
      errors: {
        allocations: allocations.status === 'rejected',
        payments: payments.status === 'rejected',
        maintenance: maintenance.status === 'rejected',
        visitors: visitors.status === 'rejected',
      },
      isLoading: false,
    });
  }, [studentId]);

  useEffect(() => {
    loadStudent();
    loadModules();
  }, [loadModules, loadStudent]);

  const currentAllocation = useMemo(
    () =>
      modules.allocations.find(
        (allocation) => allocation.allocation_status === 'active'
      ) || null,
    [modules.allocations]
  );

  const latestPayment = modules.paymentData.payments?.[0] || null;
  const maintenanceTotal =
    modules.maintenancePagination.total <= modules.maintenanceRequests.length;
  const openMaintenanceCount = maintenanceTotal
    ? modules.maintenanceRequests.filter(
        (request) =>
          !['completed', 'rejected', 'cancelled'].includes(request.status)
      ).length
    : null;

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
    setSuccessMessage('Student information updated successfully.');
    setIsEditingStudent(false);
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

  const openEditor = () => {
    setSearchParams({ tab: 'overview' });
    setSuccessMessage('');
    setStatusError('');
    setIsConfirming(false);
    setIsEditingStudent(true);
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
      <Link
        className="mb-3 inline-flex min-h-11 items-center gap-2 rounded-card px-2 text-sm font-semibold text-primary hover:text-primary-hover focus-visible:outline-primary"
        to="/admin/students"
      >
        <LuArrowLeft aria-hidden="true" className="size-4" />
        Back to students
      </Link>
      <PageHeader
        actions={
          !isEditingStudent ? (
            <Button onClick={openEditor}>
              <LuPencil aria-hidden="true" className="size-4" />
              Edit Student
            </Button>
          ) : null
        }
        description="Review the student profile and linked hostel records."
        title="Student Details"
      />

      <div className="space-y-5">
        {successMessage ? (
          <Alert variant="success">{successMessage}</Alert>
        ) : null}

        <Card className="py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <LuGraduationCap
                className="size-7 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <h2 className="break-words text-lg font-bold text-text">
                  {displayValue(student.full_name)}
                </h2>
                <p className="mt-1 break-words text-sm text-muted">
                  {displayValue(student.student_number)}
                  {student.course ? ` · ${student.course}` : ''}
                  {student.year_of_study
                    ? ` · Year ${student.year_of_study}`
                    : ''}
                </p>
              </div>
            </div>
            <StatusChip variant={statusVariant[student.account_status]}>
              {formatStatus(student.account_status)}
            </StatusChip>
          </div>
        </Card>

        <div
          className="max-w-full overflow-x-auto"
          aria-label="Student details"
        >
          <div
            className="flex min-w-max gap-1 rounded-card bg-periwinkle-light p-1"
            role="tablist"
          >
            {tabs.map((tab) => (
              <Link
                aria-controls={`student-tab-${tab.value}`}
                aria-selected={activeTab === tab.value}
                className={`min-h-11 rounded-card px-4 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  activeTab === tab.value
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted hover:bg-card/60 hover:text-primary'
                }`}
                id={`student-tab-control-${tab.value}`}
                key={tab.value}
                role="tab"
                to={`?tab=${tab.value}`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        <Card
          className="min-w-0"
          id={`student-tab-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`student-tab-control-${activeTab}`}
        >
          {activeTab === 'overview' ? (
            <div className="space-y-6">
              {!isEditingStudent ? (
                <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryItem Icon={LuShieldCheck} label="Account status">
                    {formatStatus(student.account_status)}
                  </SummaryItem>
                  <SummaryItem Icon={LuBedDouble} label="Current room">
                    {currentAllocation
                      ? `Room ${
                          currentAllocation.room_code ||
                          currentAllocation.room_number
                        }`
                      : '-'}
                  </SummaryItem>
                  <SummaryItem
                    Icon={LuCircleDollarSign}
                    label="Latest simulated payment"
                  >
                    {latestPayment
                      ? `${formatAmount(latestPayment.amount)} · ${formatStatus(
                          latestPayment.payment_status
                        )}`
                      : '-'}
                  </SummaryItem>
                  <SummaryItem Icon={LuWrench} label="Open maintenance">
                    {openMaintenanceCount ?? '-'}
                  </SummaryItem>
                </dl>
              ) : null}

              {isEditingStudent ? (
                <div>
                  <h2 className="text-lg font-bold text-text">
                    Edit student information
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Account status and sign-in settings are managed separately.
                  </p>
                  <div className="mt-6">
                    <StudentAccountForm
                      initialValues={student}
                      onCancel={() => setIsEditingStudent(false)}
                      onSubmit={submitStudentUpdate}
                      submitLabel="Save changes"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
                  <div>
                    <h2 className="text-lg font-bold text-text">
                      Personal information
                    </h2>
                    <dl className="mt-5 grid gap-5 sm:grid-cols-2">
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
                  </div>

                  <div className="border-t border-border pt-6 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
                    <h2 className="text-lg font-bold text-text">
                      Account information
                    </h2>
                    <dl className="mt-5 space-y-5">
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
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-6">
                <div className="flex items-start gap-3">
                  <LuShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-primary"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-text">
                      Account status
                    </h2>
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
              </div>
            </div>
          ) : null}

          {activeTab === 'room' ? (
            <StudentAllocationTab
              allocations={modules.allocations}
              error={modules.errors.allocations}
              isLoading={modules.isLoading}
              onRetry={loadModules}
            />
          ) : null}

          {activeTab === 'payments' ? (
            <StudentPaymentsTab
              activeAllocation={currentAllocation}
              error={modules.errors.payments}
              isLoading={modules.isLoading}
              onRetry={loadModules}
              paymentData={modules.paymentData}
              student={student}
            />
          ) : null}

          {activeTab === 'maintenance' ? (
            <StudentMaintenanceTab
              error={modules.errors.maintenance}
              isLoading={modules.isLoading}
              onRetry={loadModules}
              requests={modules.maintenanceRequests}
            />
          ) : null}

          {activeTab === 'visitors' ? (
            <StudentVisitorsTab
              error={modules.errors.visitors}
              isLoading={modules.isLoading}
              onRetry={loadModules}
              visitors={modules.visitors}
            />
          ) : null}
        </Card>
      </div>
    </PageContainer>
  );
}
