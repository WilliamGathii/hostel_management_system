import { useState } from 'react';
import {
  LuBedDouble,
  LuCircleDollarSign,
  LuPlus,
  LuUsersRound,
  LuWrench,
} from 'react-icons/lu';
import { Link } from 'react-router-dom';

import { Button } from '../../../components/common/Button';
import { StatusChip } from '../../../components/common/StatusChip';
import { Alert } from '../../../components/feedback/Alert';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { formatDate, formatLabel } from '../../../utils/formatters';
import { PaymentForm } from '../../payments/components/PaymentForm';
import { createPayment } from '../../payments/services/payment.service';

const statusVariant = {
  active: 'success',
  available: 'success',
  paid: 'success',
  completed: 'success',
  checked_out: 'success',
  pending: 'warning',
  submitted: 'warning',
  assigned: 'information',
  in_progress: 'information',
  approved: 'success',
  checked_in: 'information',
  failed: 'error',
  rejected: 'error',
  cancelled: 'error',
  expired: 'neutral',
  reversed: 'information',
  inactive: 'neutral',
  full: 'warning',
  under_maintenance: 'warning',
};

const formatAmount = (amount) =>
  Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const detailLinkClass =
  'inline-flex min-h-11 items-center rounded-card px-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

function LoadingRecords({ label }) {
  return (
    <div className="space-y-3" role="status">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

function ModuleError({ description, onRetry, title }) {
  return (
    <ErrorState description={description} onRetry={onRetry} title={title} />
  );
}

export function StudentAllocationTab({
  allocations,
  error,
  isLoading,
  onRetry,
}) {
  if (isLoading) {
    return <LoadingRecords label="Loading room allocation history" />;
  }

  if (error) {
    return (
      <ModuleError
        description="Room allocation information could not be loaded."
        onRetry={onRetry}
        title="Allocation unavailable"
      />
    );
  }

  const currentAllocation = allocations.find(
    (allocation) => allocation.allocation_status === 'active'
  );
  const history = allocations.filter(
    (allocation) => allocation.allocation_status !== 'active'
  );

  return (
    <div className="space-y-6">
      {currentAllocation ? (
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-information">
                Current allocation
              </p>
              <h2 className="mt-1 text-xl font-bold text-text">
                Room {currentAllocation.room_number}
              </h2>
            </div>
            <StatusChip
              variant={statusVariant[currentAllocation.allocation_status]}
            >
              {formatLabel(currentAllocation.allocation_status)}
            </StatusChip>
          </div>
          <dl className="mt-5 grid gap-4 rounded-card bg-page p-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold text-muted">Floor</dt>
              <dd className="mt-1 text-sm font-semibold text-text">
                {currentAllocation.floor || 'Not specified'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Room status</dt>
              <dd className="mt-1">
                <StatusChip
                  variant={statusVariant[currentAllocation.room_status]}
                >
                  {formatLabel(currentAllocation.room_status)}
                </StatusChip>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Room type</dt>
              <dd className="mt-1 text-sm font-semibold text-text">
                {currentAllocation.room_type || 'Not specified'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Start date</dt>
              <dd className="mt-1 text-sm font-semibold text-text">
                {formatDate(currentAllocation.start_date)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">
                Expected end date
              </dt>
              <dd className="mt-1 text-sm font-semibold text-text">
                {formatDate(currentAllocation.expected_end_date)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Occupancy</dt>
              <dd className="mt-1 text-sm font-semibold text-text">
                {currentAllocation.current_occupancy ?? '-'} /{' '}
                {currentAllocation.capacity ?? '-'}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <EmptyState
          actions={
            <Link className={detailLinkClass} to="/admin/allocations">
              Open room allocations
            </Link>
          }
          description="This student has not been assigned to a room."
          Icon={LuBedDouble}
          title="No active room allocation."
        />
      )}

      {history.length > 0 ? (
        <div>
          <h2 className="text-lg font-bold text-text">Allocation history</h2>
          <div className="mt-4 hidden overflow-hidden rounded-card border border-border md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-page text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Room</th>
                  <th className="px-4 py-3 font-semibold">Start</th>
                  <th className="px-4 py-3 font-semibold">End</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((allocation) => (
                  <tr key={allocation.id}>
                    <td className="px-4 py-4 font-semibold text-text">
                      {allocation.room_number}
                    </td>
                    <td className="px-4 py-4 text-text">
                      {formatDate(allocation.start_date)}
                    </td>
                    <td className="px-4 py-4 text-text">
                      {formatDate(
                        allocation.actual_end_date ||
                          allocation.expected_end_date
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <StatusChip
                        variant={statusVariant[allocation.allocation_status]}
                      >
                        {formatLabel(allocation.allocation_status)}
                      </StatusChip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid gap-3 md:hidden">
            {history.map((allocation) => (
              <article className="rounded-card bg-page p-4" key={allocation.id}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold text-text">
                    Room {allocation.room_number}
                  </p>
                  <StatusChip
                    variant={statusVariant[allocation.allocation_status]}
                  >
                    {formatLabel(allocation.allocation_status)}
                  </StatusChip>
                </div>
                <p className="mt-3 text-sm text-muted">
                  {formatDate(allocation.start_date)} to{' '}
                  {formatDate(
                    allocation.actual_end_date || allocation.expected_end_date
                  )}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function StudentPaymentsTab({
  activeAllocation,
  error,
  isLoading,
  onRetry,
  paymentData,
  student,
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const payments = paymentData?.payments || [];
  const summary = paymentData?.summary || {};

  const submitPayment = async (data) => {
    await createPayment(data);
    setIsCreating(false);
    await onRetry();
  };

  return (
    <div className="space-y-6">
      <Alert variant="warning">
        These are simulated payment records. The system does not process real
        money.
      </Alert>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-text">Payment history</h2>
          <p className="mt-1 text-sm text-muted">
            Records linked to {student.full_name}.
          </p>
        </div>
        <Button onClick={() => setIsCreating((value) => !value)}>
          <LuPlus aria-hidden="true" className="size-4" />
          {isCreating ? 'Close form' : 'Add Payment Record'}
        </Button>
      </div>

      {isCreating ? (
        <div className="rounded-card border border-border p-5 sm:p-6">
          <h3 className="text-base font-bold text-text">
            Add simulated payment record
          </h3>
          <div className="mt-5">
            <PaymentForm
              contextAllocation={activeAllocation}
              contextStudent={student}
              isAdmin
              onCancel={() => setIsCreating(false)}
              onSubmit={submitPayment}
            />
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <LoadingRecords label="Loading simulated payment records" />
      ) : error ? (
        <ModuleError
          description="This student's simulated payment records could not be loaded."
          onRetry={onRetry}
          title="Payment records unavailable"
        />
      ) : (
        <>
          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-card bg-page p-4">
              <dt className="text-xs font-semibold text-muted">Records</dt>
              <dd className="mt-2 text-xl font-bold text-text">
                {summary.total_records ?? 0}
              </dd>
            </div>
            <div className="rounded-card bg-page p-4">
              <dt className="text-xs font-semibold text-muted">
                Total recorded as paid
              </dt>
              <dd className="mt-2 text-xl font-bold text-text">
                {formatAmount(summary.total_paid_amount)}
              </dd>
            </div>
            <div className="rounded-card bg-page p-4">
              <dt className="text-xs font-semibold text-muted">
                Latest payment date
              </dt>
              <dd className="mt-2 text-sm font-bold text-text">
                {formatDate(summary.latest_payment_date, '-')}
              </dd>
            </div>
            <div className="rounded-card bg-page p-4">
              <dt className="text-xs font-semibold text-muted">
                Latest payment status
              </dt>
              <dd className="mt-2">
                {summary.latest_payment_status ? (
                  <StatusChip
                    variant={statusVariant[summary.latest_payment_status]}
                  >
                    {formatLabel(summary.latest_payment_status)}
                  </StatusChip>
                ) : (
                  <span className="text-sm font-bold text-text">-</span>
                )}
              </dd>
            </div>
          </dl>

          {selectedPayment ? (
            <div className="rounded-card border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-information">
                    Simulated payment details
                  </p>
                  <p className="mt-1 font-bold text-text">
                    {selectedPayment.transaction_reference || 'No reference'}
                  </p>
                </div>
                <Button
                  onClick={() => setSelectedPayment(null)}
                  variant="ghost"
                >
                  Close details
                </Button>
              </div>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-muted">Amount</dt>
                  <dd className="font-semibold text-text">
                    {formatAmount(selectedPayment.amount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Method</dt>
                  <dd className="font-semibold text-text">
                    {selectedPayment.payment_method}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Recorded by</dt>
                  <dd className="font-semibold text-text">
                    {selectedPayment.recorded_by_name || 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Notes</dt>
                  <dd className="font-semibold text-text">
                    {selectedPayment.notes || 'No notes'}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          {payments.length === 0 ? (
            <EmptyState
              Icon={LuCircleDollarSign}
              title="No payment records have been added for this student."
            />
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-card border border-border md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-page text-xs text-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Reference</th>
                      <th className="px-4 py-3 font-semibold">Method</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-4 text-text">
                          {formatDate(payment.payment_date)}
                        </td>
                        <td className="max-w-48 truncate px-4 py-4 text-text">
                          {payment.transaction_reference || 'No reference'}
                        </td>
                        <td className="px-4 py-4 text-text">
                          {payment.payment_method}
                        </td>
                        <td className="px-4 py-4 font-semibold text-text">
                          {formatAmount(payment.amount)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusChip
                            variant={statusVariant[payment.payment_status]}
                          >
                            {formatLabel(payment.payment_status)}
                          </StatusChip>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            className="min-h-11 font-semibold text-primary hover:underline focus-visible:outline-primary"
                            onClick={() => setSelectedPayment(payment)}
                            type="button"
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-3 md:hidden">
                {payments.map((payment) => (
                  <article
                    className="rounded-card bg-page p-4"
                    key={payment.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-text">
                          {formatAmount(payment.amount)}
                        </p>
                        <p className="mt-1 break-all text-xs text-muted">
                          {payment.transaction_reference || 'No reference'}
                        </p>
                      </div>
                      <StatusChip
                        variant={statusVariant[payment.payment_status]}
                      >
                        {formatLabel(payment.payment_status)}
                      </StatusChip>
                    </div>
                    <p className="mt-3 text-sm text-muted">
                      {payment.payment_method} ·{' '}
                      {formatDate(payment.payment_date)}
                    </p>
                    <Button
                      className="mt-4 w-full"
                      onClick={() => setSelectedPayment(payment)}
                      variant="secondary"
                    >
                      View details
                    </Button>
                  </article>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export function StudentMaintenanceTab({ error, isLoading, onRetry, requests }) {
  if (isLoading) {
    return <LoadingRecords label="Loading maintenance requests" />;
  }
  if (error) {
    return (
      <ModuleError
        description="This student's maintenance requests could not be loaded."
        onRetry={onRetry}
        title="Maintenance requests unavailable"
      />
    );
  }
  if (requests.length === 0) {
    return (
      <EmptyState
        Icon={LuWrench}
        title="No maintenance requests have been submitted by this student."
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-card border border-border md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-page text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Request</th>
              <th className="px-4 py-3 font-semibold">Room</th>
              <th className="px-4 py-3 font-semibold">Priority</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Submitted</th>
              <th className="px-4 py-3 font-semibold">Assigned staff</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-4 py-4 font-semibold text-text">
                  {request.title}
                </td>
                <td className="px-4 py-4 text-text">{request.room_number}</td>
                <td className="px-4 py-4">
                  <StatusChip variant={statusVariant[request.priority]}>
                    {formatLabel(request.priority)}
                  </StatusChip>
                </td>
                <td className="px-4 py-4">
                  <StatusChip variant={statusVariant[request.status]}>
                    {formatLabel(request.status)}
                  </StatusChip>
                </td>
                <td className="px-4 py-4 text-text">
                  {formatDate(request.submitted_at)}
                </td>
                <td className="px-4 py-4 text-text">
                  {request.assigned_staff_name || 'Not assigned'}
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    className={detailLinkClass}
                    to={`/admin/maintenance/${request.id}`}
                  >
                    View details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {requests.map((request) => (
          <article className="rounded-card bg-page p-4" key={request.id}>
            <div className="flex items-start justify-between gap-3">
              <p className="font-bold text-text">{request.title}</p>
              <StatusChip variant={statusVariant[request.status]}>
                {formatLabel(request.status)}
              </StatusChip>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted">Room</dt>
                <dd className="font-semibold text-text">
                  {request.room_number}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Priority</dt>
                <dd className="font-semibold text-text">
                  {formatLabel(request.priority)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted">Assigned staff</dt>
                <dd className="font-semibold text-text">
                  {request.assigned_staff_name || 'Not assigned'}
                </dd>
              </div>
            </dl>
            <Link
              className={`${detailLinkClass} mt-3 w-full justify-center bg-periwinkle-light`}
              to={`/admin/maintenance/${request.id}`}
            >
              View details
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}

export function StudentVisitorsTab({ error, isLoading, onRetry, visitors }) {
  if (isLoading) {
    return <LoadingRecords label="Loading visitor records" />;
  }
  if (error) {
    return (
      <ModuleError
        description="This student's visitor records could not be loaded."
        onRetry={onRetry}
        title="Visitor records unavailable"
      />
    );
  }
  if (visitors.length === 0) {
    return (
      <EmptyState
        Icon={LuUsersRound}
        title="No visitors have been registered by this student."
      />
    );
  }

  const entryLabel = (visitor) =>
    visitor.entry_time ? 'Entered' : 'Not entered';
  const exitLabel = (visitor) =>
    visitor.exit_time ? 'Exited' : visitor.entry_time ? 'Inside' : 'Not exited';

  return (
    <>
      <div className="hidden overflow-hidden rounded-card border border-border md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-page text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Visitor</th>
              <th className="px-4 py-3 font-semibold">Visit date</th>
              <th className="px-4 py-3 font-semibold">Purpose</th>
              <th className="px-4 py-3 font-semibold">Approval</th>
              <th className="px-4 py-3 font-semibold">Entry</th>
              <th className="px-4 py-3 font-semibold">Exit</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visitors.map((visitor) => (
              <tr key={visitor.id}>
                <td className="px-4 py-4 font-semibold text-text">
                  {visitor.visitor_name}
                </td>
                <td className="px-4 py-4 text-text">
                  {formatDate(visitor.visit_date)}
                </td>
                <td className="max-w-56 truncate px-4 py-4 text-text">
                  {visitor.purpose}
                </td>
                <td className="px-4 py-4">
                  <StatusChip variant={statusVariant[visitor.approval_status]}>
                    {formatLabel(visitor.approval_status)}
                  </StatusChip>
                </td>
                <td className="px-4 py-4 text-text">{entryLabel(visitor)}</td>
                <td className="px-4 py-4 text-text">{exitLabel(visitor)}</td>
                <td className="px-4 py-4 text-right">
                  <Link
                    className={detailLinkClass}
                    to={`/admin/visitors/${visitor.id}`}
                  >
                    View details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {visitors.map((visitor) => (
          <article className="rounded-card bg-page p-4" key={visitor.id}>
            <div className="flex items-start justify-between gap-3">
              <p className="font-bold text-text">{visitor.visitor_name}</p>
              <StatusChip variant={statusVariant[visitor.approval_status]}>
                {formatLabel(visitor.approval_status)}
              </StatusChip>
            </div>
            <p className="mt-2 text-sm text-muted">
              {formatDate(visitor.visit_date)}
            </p>
            <p className="mt-3 line-clamp-2 text-sm text-text">
              {visitor.purpose}
            </p>
            <p className="mt-3 text-sm text-muted">
              Entry: {entryLabel(visitor)} · Exit: {exitLabel(visitor)}
            </p>
            <Link
              className={`${detailLinkClass} mt-3 w-full justify-center bg-periwinkle-light`}
              to={`/admin/visitors/${visitor.id}`}
            >
              View details
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
