import { useCallback, useEffect, useState } from 'react';
import { LuPlus, LuSearch, LuUsersRound } from 'react-icons/lu';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusChip } from '../../../components/common/StatusChip';
import { Alert } from '../../../components/feedback/Alert';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { FormField } from '../../../components/forms/FormField';
import { TextAreaField } from '../../../components/forms/TextAreaField';
import { useAuth } from '../../../hooks/useAuth';
import {
  formatDate,
  formatDateTime,
  formatLabel,
} from '../../../utils/formatters';
import {
  getMyVisitors,
  getVisitors,
  registerVisitor,
} from '../services/visitor.service';

const statusVariant = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  expired: 'neutral',
};

const detailPath = (role, visitorId) => {
  if (role === 'student') return `/student/visitors/${visitorId}`;
  if (role === 'admin') return `/admin/visitors/${visitorId}`;
  return `/security/visitors/${visitorId}`;
};

export function VisitorPage({ historyOnly = false }) {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm({
    defaultValues: {
      visitor_name: '',
      visitor_phone: '',
      identification_type: '',
      identification_number: '',
      visit_date: '',
      expected_entry_time: '',
      expected_exit_time: '',
      purpose: '',
    },
  });

  const loadVisitors = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const params = {
        page: 1,
        limit: 50,
        search: search || undefined,
        approval_status: approvalStatus || undefined,
        verification_status: historyOnly ? 'checked_out' : undefined,
      };
      const result =
        user.role === 'student'
          ? await getMyVisitors(params)
          : await getVisitors(params);
      setVisitors(Array.isArray(result.visitors) ? result.visitors : []);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [approvalStatus, historyOnly, search, user.role]);

  useEffect(() => {
    loadVisitors();
  }, [loadVisitors]);

  const submitSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const submitVisitor = async (values) => {
    setSubmitError('');
    try {
      await registerVisitor(values);
      reset();
      setShowForm(false);
      setNotice('Visitor registered and sent for Admin approval.');
      await loadVisitors();
    } catch (error) {
      setSubmitError(error.message || 'Visitor could not be registered.');
    }
  };

  const isStudent = user.role === 'student';
  const isAdmin = user.role === 'admin';
  const pageTitle = historyOnly
    ? 'Visitor History'
    : isStudent
      ? 'Visitor Registration'
      : isAdmin
        ? 'Visitor Approvals'
        : 'Approved Visitors';

  return (
    <PageContainer>
      <PageHeader
        actions={
          isStudent && !historyOnly ? (
            <Button onClick={() => setShowForm((value) => !value)}>
              <LuPlus aria-hidden="true" className="size-4" />
              {showForm ? 'Close form' : 'Register Visitor'}
            </Button>
          ) : null
        }
        description={
          historyOnly
            ? 'Review visitors whose entry and exit have been recorded.'
            : isStudent
              ? 'Register visitors and follow their approval status.'
              : isAdmin
                ? 'Review visitor requests before the scheduled visit.'
                : 'Verify approved visitors at entry and exit.'
        }
        title={pageTitle}
      />

      {notice ? (
        <Alert className="mb-6" variant="success">
          {notice}
        </Alert>
      ) : null}

      {showForm ? (
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-text">Register a visitor</h2>
          <p className="mt-1 text-sm text-muted">
            The Admin must approve this request before entry.
          </p>
          {submitError ? (
            <Alert className="mt-5" variant="error">
              {submitError}
            </Alert>
          ) : null}
          <form
            className="mt-6 space-y-5"
            onSubmit={handleSubmit(submitVisitor)}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                error={errors.visitor_name?.message}
                label="Visitor name"
                name="visitor_name"
                required
                {...register('visitor_name', {
                  required: 'Visitor name is required',
                  maxLength: {
                    value: 150,
                    message: 'Visitor name must not exceed 150 characters',
                  },
                })}
              />
              <FormField
                error={errors.visitor_phone?.message}
                label="Visitor phone"
                name="visitor_phone"
                required
                type="tel"
                {...register('visitor_phone', {
                  required: 'Visitor phone is required',
                  minLength: {
                    value: 7,
                    message: 'Visitor phone must have at least 7 characters',
                  },
                })}
              />
              <FormField
                error={errors.identification_type?.message}
                label="Identification type"
                name="identification_type"
                placeholder="National ID or passport"
                {...register('identification_type', {
                  maxLength: {
                    value: 50,
                    message: 'Identification type is too long',
                  },
                })}
              />
              <FormField
                error={errors.identification_number?.message}
                label="Identification number"
                name="identification_number"
                {...register('identification_number', {
                  maxLength: {
                    value: 100,
                    message: 'Identification number is too long',
                  },
                })}
              />
              <FormField
                error={errors.visit_date?.message}
                label="Visit date"
                min={new Date().toISOString().slice(0, 10)}
                name="visit_date"
                required
                type="date"
                {...register('visit_date', {
                  required: 'Visit date is required',
                })}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  error={errors.expected_entry_time?.message}
                  label="Entry time"
                  name="expected_entry_time"
                  type="time"
                  {...register('expected_entry_time')}
                />
                <FormField
                  error={errors.expected_exit_time?.message}
                  label="Exit time"
                  name="expected_exit_time"
                  type="time"
                  {...register('expected_exit_time')}
                />
              </div>
            </div>
            <TextAreaField
              error={errors.purpose?.message}
              label="Purpose of visit"
              name="purpose"
              required
              {...register('purpose', {
                required: 'Purpose is required',
                maxLength: {
                  value: 1000,
                  message: 'Purpose must not exceed 1000 characters',
                },
              })}
            />
            <div className="flex justify-end">
              <Button isLoading={isSubmitting} type="submit">
                Submit for Approval
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card>
        {!isStudent ? (
          <form
            className="mb-6 grid gap-4 rounded-card bg-page p-4 md:grid-cols-[minmax(0,1fr)_13rem_auto]"
            onSubmit={submitSearch}
            role="search"
          >
            <FormField
              label="Search visitors"
              name="visitor-search"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Visitor or student name"
              type="search"
              value={searchInput}
            />
            <div>
              <label
                className="mb-1.5 block text-sm font-semibold text-text"
                htmlFor="visitor-approval-filter"
              >
                Approval status
              </label>
              <select
                className="min-h-11 w-full rounded-card border border-border bg-card px-3.5 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary-soft"
                disabled={!isAdmin}
                id="visitor-approval-filter"
                onChange={(event) => setApprovalStatus(event.target.value)}
                value={isAdmin ? approvalStatus : 'approved'}
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <Button className="md:self-end" type="submit">
              <LuSearch aria-hidden="true" className="size-4" />
              Search
            </Button>
          </form>
        ) : null}

        {isLoading ? (
          <div className="space-y-3" role="status">
            <span className="sr-only">Loading visitors</span>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : hasError ? (
          <ErrorState
            description="Visitor records could not be loaded."
            onRetry={loadVisitors}
            title="Visitors unavailable"
          />
        ) : visitors.length === 0 ? (
          <EmptyState
            description={
              historyOnly
                ? 'Completed visits will appear here.'
                : isStudent
                  ? 'Register a visitor when a visit is planned.'
                  : isAdmin
                    ? 'New visitor requests will appear here for review.'
                    : 'Approved visitors will appear here before entry.'
            }
            Icon={LuUsersRound}
            title={
              historyOnly
                ? 'No completed visitor records are available.'
                : isAdmin
                  ? 'No visitor approvals are waiting.'
                  : 'No approved visitors are available.'
            }
          />
        ) : (
          <div className="space-y-3">
            {visitors.map((visitor) => (
              <article
                className="rounded-card border border-border p-4 sm:flex sm:items-center sm:justify-between sm:gap-5"
                key={visitor.id}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-text">
                      {visitor.visitor_name}
                    </h2>
                    <StatusChip
                      variant={statusVariant[visitor.approval_status]}
                    >
                      {formatLabel(visitor.approval_status)}
                    </StatusChip>
                    {visitor.verification_status ? (
                      <StatusChip variant="information">
                        {formatLabel(visitor.verification_status)}
                      </StatusChip>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    {formatDate(visitor.visit_date)}
                    {!isStudent ? ` · ${visitor.student_name}` : ''}
                    {visitor.entry_time
                      ? ` · Entered ${formatDateTime(visitor.entry_time)}`
                      : ''}
                  </p>
                </div>
                <Link
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-card bg-periwinkle-light px-4 text-sm font-semibold text-primary hover:bg-periwinkle sm:mt-0"
                  to={detailPath(user.role, visitor.id)}
                >
                  View visitor
                </Link>
              </article>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
