import { useCallback, useEffect, useState } from 'react';
import { LuPlus, LuSearch, LuWrench } from 'react-icons/lu';
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
import { SelectField } from '../../../components/forms/SelectField';
import { TextAreaField } from '../../../components/forms/TextAreaField';
import { useAuth } from '../../../hooks/useAuth';
import { formatDateTime, formatLabel } from '../../../utils/formatters';
import { getMyAllocation } from '../../rooms/services/room.service';
import {
  getMaintenanceRequests,
  getMyMaintenanceRequests,
  submitMaintenanceRequest,
} from '../services/maintenance.service';

const statusVariant = {
  submitted: 'information',
  assigned: 'information',
  in_progress: 'warning',
  completed: 'success',
  rejected: 'error',
  cancelled: 'neutral',
};
const priorityVariant = {
  low: 'neutral',
  medium: 'information',
  high: 'warning',
  urgent: 'error',
};

const detailPath = (role, requestId) => {
  if (role === 'student') return `/student/maintenance/${requestId}`;
  if (role === 'admin') return `/admin/maintenance/${requestId}`;
  return `/maintenance/requests/${requestId}`;
};

export function MaintenancePage({ historyOnly = false }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [allocation, setAllocation] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(historyOnly ? 'completed' : '');
  const [priority, setPriority] = useState('');
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
    defaultValues: { title: '', description: '', priority: 'medium' },
  });

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const params = {
        page: 1,
        limit: 50,
        search: search || undefined,
        status: (historyOnly ? 'completed' : status) || undefined,
        priority: priority || undefined,
      };
      const result =
        user.role === 'student'
          ? await getMyMaintenanceRequests(params)
          : await getMaintenanceRequests(params);
      setRequests(
        Array.isArray(result.maintenance_requests)
          ? result.maintenance_requests
          : []
      );

      if (user.role === 'student') {
        try {
          setAllocation(await getMyAllocation());
        } catch {
          setAllocation(null);
        }
      }
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [historyOnly, priority, search, status, user.role]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const submitSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const submitRequest = async (values) => {
    setSubmitError('');
    if (!allocation?.room_id) {
      setSubmitError('A current room allocation is required.');
      return;
    }

    try {
      await submitMaintenanceRequest({
        room_id: allocation.room_id,
        title: values.title,
        description: values.description,
        priority: values.priority,
      });
      reset();
      setShowForm(false);
      setNotice('Maintenance request submitted successfully.');
      await loadRequests();
    } catch (error) {
      setSubmitError(error.message || 'Request could not be submitted.');
    }
  };

  const isStudent = user.role === 'student';
  const pageTitle = historyOnly
    ? 'Maintenance History'
    : isStudent
      ? 'Maintenance Requests'
      : user.role === 'admin'
        ? 'Maintenance Management'
        : 'Assigned Requests';

  return (
    <PageContainer>
      <PageHeader
        actions={
          isStudent && !historyOnly ? (
            <Button
              disabled={!allocation}
              onClick={() => setShowForm((value) => !value)}
            >
              <LuPlus aria-hidden="true" className="size-4" />
              {showForm ? 'Close form' : 'Submit Request'}
            </Button>
          ) : null
        }
        description={
          historyOnly
            ? 'Review maintenance work that has been completed.'
            : isStudent
              ? 'Report room problems and follow their progress.'
              : user.role === 'admin'
                ? 'Review, assign, and track hostel maintenance work.'
                : 'Work on requests assigned to your account.'
        }
        title={pageTitle}
      />

      {notice ? (
        <Alert className="mb-6" variant="success">
          {notice}
        </Alert>
      ) : null}

      {isStudent && !allocation && !isLoading ? (
        <Alert className="mb-6" variant="information">
          A room allocation is required before you can submit a maintenance
          request.
        </Alert>
      ) : null}

      {showForm ? (
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-text">Report a room issue</h2>
          <p className="mt-1 text-sm text-muted">
            This request will be linked to room {allocation?.room_number}.
          </p>
          {submitError ? (
            <Alert className="mt-5" variant="error">
              {submitError}
            </Alert>
          ) : null}
          <form
            className="mt-6 space-y-5"
            onSubmit={handleSubmit(submitRequest)}
          >
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_12rem]">
              <FormField
                error={errors.title?.message}
                label="Issue title"
                name="title"
                required
                {...register('title', {
                  required: 'Title is required',
                  minLength: {
                    value: 3,
                    message: 'Title must have at least 3 characters',
                  },
                  maxLength: {
                    value: 150,
                    message: 'Title must not exceed 150 characters',
                  },
                })}
              />
              <SelectField
                error={errors.priority?.message}
                label="Priority"
                name="priority"
                required
                {...register('priority', { required: 'Priority is required' })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </SelectField>
            </div>
            <TextAreaField
              error={errors.description?.message}
              label="Description"
              name="description"
              required
              rows={5}
              {...register('description', {
                required: 'Description is required',
                minLength: {
                  value: 10,
                  message: 'Description must have at least 10 characters',
                },
                maxLength: {
                  value: 3000,
                  message: 'Description must not exceed 3000 characters',
                },
              })}
            />
            <div className="flex justify-end">
              <Button isLoading={isSubmitting} type="submit">
                Submit Request
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card>
        {!isStudent ? (
          <form
            className="mb-6 grid gap-4 rounded-card bg-page p-4 md:grid-cols-[minmax(0,1fr)_11rem_11rem_auto]"
            onSubmit={submitSearch}
            role="search"
          >
            <FormField
              label="Search requests"
              name="maintenance-search"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Title, student or room"
              type="search"
              value={searchInput}
            />
            <SelectField
              disabled={historyOnly}
              label="Status"
              name="maintenance-status"
              onChange={(event) => setStatus(event.target.value)}
              value={historyOnly ? 'completed' : status}
            >
              <option value="">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </SelectField>
            <SelectField
              label="Priority"
              name="maintenance-priority"
              onChange={(event) => setPriority(event.target.value)}
              value={priority}
            >
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </SelectField>
            <Button className="md:self-end" type="submit">
              <LuSearch aria-hidden="true" className="size-4" />
              Search
            </Button>
          </form>
        ) : null}

        {isLoading ? (
          <div className="space-y-3" role="status">
            <span className="sr-only">Loading maintenance requests</span>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : hasError ? (
          <ErrorState
            description="Maintenance requests could not be loaded."
            onRetry={loadRequests}
            title="Maintenance requests unavailable"
          />
        ) : requests.length === 0 ? (
          <EmptyState
            description={
              historyOnly
                ? 'Completed work will appear here.'
                : isStudent
                  ? 'Submit a request when your allocated room needs attention.'
                  : 'New requests will appear here when they are available.'
            }
            Icon={LuWrench}
            title={
              historyOnly
                ? 'No completed maintenance requests are available.'
                : 'No maintenance requests are available.'
            }
          />
        ) : (
          <div className="space-y-3">
            {requests.map((maintenanceRequest) => (
              <article
                className="rounded-card border border-border p-4 sm:flex sm:items-center sm:justify-between sm:gap-5"
                key={maintenanceRequest.id}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-text">
                      {maintenanceRequest.title}
                    </h2>
                    <StatusChip
                      variant={priorityVariant[maintenanceRequest.priority]}
                    >
                      {formatLabel(maintenanceRequest.priority)}
                    </StatusChip>
                    <StatusChip
                      variant={statusVariant[maintenanceRequest.status]}
                    >
                      {formatLabel(maintenanceRequest.status)}
                    </StatusChip>
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    Room {maintenanceRequest.room_number}
                    {!isStudent
                      ? ` · ${maintenanceRequest.student_name}`
                      : ''}{' '}
                    · {formatDateTime(maintenanceRequest.submitted_at)}
                  </p>
                </div>
                <Link
                  className="mt-4 inline-flex min-h-10 items-center justify-center rounded-card bg-periwinkle-light px-4 text-sm font-semibold text-primary hover:bg-periwinkle sm:mt-0"
                  to={detailPath(user.role, maintenanceRequest.id)}
                >
                  View request
                </Link>
              </article>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
