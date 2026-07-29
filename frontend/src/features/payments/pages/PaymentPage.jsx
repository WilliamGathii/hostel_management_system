import { useCallback, useEffect, useState } from 'react';
import {
  LuCircleDollarSign,
  LuPlus,
  LuSearch,
  LuShieldAlert,
} from 'react-icons/lu';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusChip } from '../../../components/common/StatusChip';
import { Alert } from '../../../components/feedback/Alert';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { SelectField } from '../../../components/forms/SelectField';
import { useAuth } from '../../../hooks/useAuth';
import {
  formatDate,
  formatDateTime,
  formatLabel,
} from '../../../utils/formatters';
import { PaymentForm } from '../components/PaymentForm';
import {
  createPayment,
  getMyPayments,
  getPayments,
  updatePaymentStatus,
} from '../services/payment.service';

const statusVariant = {
  pending: 'warning',
  paid: 'success',
  failed: 'error',
  rejected: 'error',
  reversed: 'information',
};

const transitions = {
  pending: ['paid', 'failed', 'rejected'],
  paid: ['reversed'],
};

const formatAmount = (amount) =>
  Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function PaymentPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const loader = isAdmin ? getPayments : getMyPayments;
      const result = await loader({
        page,
        limit: 20,
        search: isAdmin ? search || undefined : undefined,
        status: status || undefined,
      });
      setPayments(Array.isArray(result.payments) ? result.payments : []);
      setPagination(result.pagination || {});
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, page, search, status]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const submitPayment = async (data) => {
    await createPayment(data);
    setIsCreating(false);
    setPage(1);
    await loadPayments();
  };

  const reviewPayment = async () => {
    if (!selectedPayment || !nextStatus) {
      return;
    }
    setIsUpdating(true);
    setUpdateError('');
    try {
      await updatePaymentStatus(selectedPayment.id, {
        payment_status: nextStatus,
      });
      setSelectedPayment(null);
      setNextStatus('');
      await loadPayments();
    } catch (error) {
      setUpdateError(error.message || 'Payment status could not be updated.');
    } finally {
      setIsUpdating(false);
    }
  };

  const openReview = (payment) => {
    setSelectedPayment(payment);
    setNextStatus('');
    setUpdateError('');
  };

  return (
    <PageContainer>
      <PageHeader
        actions={
          <Button onClick={() => setIsCreating((value) => !value)}>
            <LuPlus aria-hidden="true" className="size-4" />
            {isCreating ? 'Close form' : 'Add Payment Record'}
          </Button>
        }
        description={
          isAdmin
            ? 'Record, review and track simulated hostel payments.'
            : 'Submit and review your simulated hostel payment history.'
        }
        title="Simulated Payments"
      />

      <Alert className="mb-6" variant="warning">
        Payment records demonstrate a workflow only. No money is transferred,
        and no external payment provider is connected.
      </Alert>

      {isCreating ? (
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-text">
            Record simulated payment
          </h2>
          <p className="mt-1 text-sm text-muted">
            Enter record information only. Never enter card, bank or account
            credentials.
          </p>
          <div className="mt-6">
            <PaymentForm
              isAdmin={isAdmin}
              onCancel={() => setIsCreating(false)}
              onSubmit={submitPayment}
            />
          </div>
        </Card>
      ) : null}

      {selectedPayment && isAdmin ? (
        <Card className="mb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold text-information">
                Payment review
              </p>
              <h2 className="mt-1 text-lg font-bold text-text">
                {selectedPayment.student_name}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {selectedPayment.transaction_reference || 'No reference'} ·{' '}
                {formatAmount(selectedPayment.amount)}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[14rem_auto_auto] sm:items-end">
              <SelectField
                label="New status"
                name="payment-review-status"
                onChange={(event) => setNextStatus(event.target.value)}
                value={nextStatus}
              >
                <option value="">Select status</option>
                {(transitions[selectedPayment.payment_status] || []).map(
                  (value) => (
                    <option key={value} value={value}>
                      {formatLabel(value)}
                    </option>
                  )
                )}
              </SelectField>
              <Button
                disabled={!nextStatus}
                isLoading={isUpdating}
                onClick={reviewPayment}
              >
                Update Status
              </Button>
              <Button
                onClick={() => setSelectedPayment(null)}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
          {updateError ? (
            <p className="mt-4 text-sm text-error">{updateError}</p>
          ) : null}
        </Card>
      ) : null}

      <Card>
        <form
          className={`grid gap-4 rounded-card bg-page p-4 ${
            isAdmin
              ? 'md:grid-cols-[minmax(0,1fr)_13rem_auto]'
              : 'md:grid-cols-[13rem_auto]'
          }`}
          onSubmit={submitSearch}
          role="search"
        >
          {isAdmin ? (
            <div>
              <label
                className="mb-1.5 block text-sm font-semibold text-text"
                htmlFor="payment-search"
              >
                Search payments
              </label>
              <input
                className="min-h-11 w-full rounded-card border border-border bg-card px-3.5 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary-soft"
                id="payment-search"
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Student or reference"
                type="search"
                value={searchInput}
              />
            </div>
          ) : null}
          <div>
            <label
              className="mb-1.5 block text-sm font-semibold text-text"
              htmlFor="payment-status-filter"
            >
              Status
            </label>
            <select
              className="min-h-11 w-full rounded-card border border-border bg-card px-3.5 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary-soft"
              id="payment-status-filter"
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              value={status}
            >
              <option value="">All statuses</option>
              {['pending', 'paid', 'failed', 'rejected', 'reversed'].map(
                (value) => (
                  <option key={value} value={value}>
                    {formatLabel(value)}
                  </option>
                )
              )}
            </select>
          </div>
          <Button className="md:self-end" type="submit">
            <LuSearch aria-hidden="true" className="size-4" />
            Apply
          </Button>
        </form>

        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-3" role="status">
              <span className="sr-only">Loading simulated payments</span>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : hasError ? (
            <ErrorState
              description="Simulated payment records could not be loaded."
              onRetry={loadPayments}
              title="Payment records unavailable"
            />
          ) : payments.length === 0 ? (
            <EmptyState
              description={
                search || status
                  ? 'Try a different search or payment status.'
                  : 'New simulated payment records will appear here.'
              }
              Icon={LuCircleDollarSign}
              title={
                search || status
                  ? 'No payment records matched your search.'
                  : 'No simulated payment records have been added.'
              }
            />
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-card border border-border md:block">
                <table className="w-full table-fixed text-left text-sm">
                  <thead className="bg-page text-xs text-muted">
                    <tr>
                      {isAdmin ? (
                        <th className="px-4 py-3 font-semibold">Student</th>
                      ) : null}
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Method</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 text-right font-semibold">
                        {isAdmin ? 'Action' : 'Recorded'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((payment) => (
                      <tr className="hover:bg-page/70" key={payment.id}>
                        {isAdmin ? (
                          <td className="px-4 py-4">
                            <p className="font-semibold text-text">
                              {payment.student_name}
                            </p>
                            <p className="text-xs text-muted">
                              {payment.student_number}
                            </p>
                          </td>
                        ) : null}
                        <td className="px-4 py-4 font-semibold text-text">
                          {formatAmount(payment.amount)}
                        </td>
                        <td className="px-4 py-4 text-text">
                          {payment.payment_method}
                        </td>
                        <td className="px-4 py-4 text-text">
                          {formatDate(payment.payment_date)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusChip
                            variant={statusVariant[payment.payment_status]}
                          >
                            {formatLabel(payment.payment_status)}
                          </StatusChip>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {isAdmin &&
                          (transitions[payment.payment_status] || []).length >
                            0 ? (
                            <button
                              className="font-semibold text-primary hover:underline focus-visible:outline-primary"
                              onClick={() => openReview(payment)}
                              type="button"
                            >
                              Review
                            </button>
                          ) : (
                            <span className="text-xs text-muted">
                              {formatDateTime(payment.created_at)}
                            </span>
                          )}
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
                        {isAdmin ? (
                          <p className="font-bold text-text">
                            {payment.student_name}
                          </p>
                        ) : null}
                        <p className="text-lg font-bold text-text">
                          {formatAmount(payment.amount)}
                        </p>
                      </div>
                      <StatusChip
                        variant={statusVariant[payment.payment_status]}
                      >
                        {formatLabel(payment.payment_status)}
                      </StatusChip>
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-muted">Method</dt>
                        <dd className="font-semibold text-text">
                          {payment.payment_method}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted">Payment date</dt>
                        <dd className="font-semibold text-text">
                          {formatDate(payment.payment_date)}
                        </dd>
                      </div>
                    </dl>
                    {isAdmin &&
                    (transitions[payment.payment_status] || []).length > 0 ? (
                      <Button
                        className="mt-4 w-full"
                        onClick={() => openReview(payment)}
                        variant="secondary"
                      >
                        Review Payment
                      </Button>
                    ) : null}
                  </article>
                ))}
              </div>
            </>
          )}
        </div>

        {pagination.totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <Button
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
              variant="secondary"
            >
              Previous
            </Button>
            <p className="text-sm text-muted">
              Page {page} of {pagination.totalPages}
            </p>
            <Button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((value) => value + 1)}
              variant="secondary"
            >
              Next
            </Button>
          </div>
        ) : null}
      </Card>

      <div className="mt-6 flex items-start gap-3 rounded-card bg-information-soft p-4 text-information">
        <LuShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p className="text-sm leading-6">
          The system stores record details only. It does not store card numbers,
          payment credentials or provider tokens.
        </p>
      </div>
    </PageContainer>
  );
}
