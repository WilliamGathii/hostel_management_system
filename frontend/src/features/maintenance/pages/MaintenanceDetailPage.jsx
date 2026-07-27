import { useCallback, useEffect, useMemo, useState } from 'react';
import { LuArrowLeft, LuClock3, LuMessageSquarePlus } from 'react-icons/lu';
import { Link, useParams } from 'react-router-dom';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusChip } from '../../../components/common/StatusChip';
import { Alert } from '../../../components/feedback/Alert';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { SelectField } from '../../../components/forms/SelectField';
import { TextAreaField } from '../../../components/forms/TextAreaField';
import { useAuth } from '../../../hooks/useAuth';
import { formatDateTime, formatLabel } from '../../../utils/formatters';
import {
  addMaintenanceUpdate,
  assignMaintenanceRequest,
  getMaintenanceRequest,
  getMaintenanceRequests,
  updateMaintenanceStatus,
} from '../services/maintenance.service';

const nextStatuses = {
  admin: {
    submitted: ['rejected', 'cancelled'],
    assigned: ['in_progress', 'completed', 'rejected', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
  },
  maintenance_staff: {
    assigned: ['in_progress', 'completed'],
    in_progress: ['completed'],
  },
};

const backPath = (role) => {
  if (role === 'student') return '/student/maintenance';
  if (role === 'admin') return '/admin/maintenance';
  return '/maintenance/requests';
};

export function MaintenanceDetailPage() {
  const { requestId } = useParams();
  const { user } = useAuth();
  const [maintenanceRequest, setMaintenanceRequest] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [staff, setStaff] = useState([]);
  const [staffId, setStaffId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [progressNote, setProgressNote] = useState('');
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadRequest = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const result = await getMaintenanceRequest(requestId);
      setMaintenanceRequest(result.maintenance_request || null);
      setUpdates(Array.isArray(result.updates) ? result.updates : []);
      setStaffId(result.maintenance_request?.assigned_staff_id || '');

      if (user.role === 'admin') {
        const listResult = await getMaintenanceRequests({
          page: 1,
          limit: 1,
        });
        setStaff(
          Array.isArray(listResult.maintenance_staff)
            ? listResult.maintenance_staff
            : []
        );
      }
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [requestId, user.role]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  const availableStatuses = useMemo(
    () => nextStatuses[user.role]?.[maintenanceRequest?.status] || [],
    [maintenanceRequest?.status, user.role]
  );

  useEffect(() => {
    setSelectedStatus(availableStatuses[0] || '');
  }, [availableStatuses]);

  const runAction = async (operation, successMessage) => {
    setIsSaving(true);
    setActionError('');
    setNotice('');
    try {
      await operation();
      setNotice(successMessage);
      await loadRequest();
    } catch (error) {
      setActionError(error.message || 'The request could not be updated.');
    } finally {
      setIsSaving(false);
    }
  };

  const assign = () =>
    runAction(
      () => assignMaintenanceRequest(requestId, staffId),
      'Maintenance Staff assigned successfully.'
    );

  const updateStatus = () =>
    runAction(
      () =>
        updateMaintenanceStatus(requestId, selectedStatus, statusNote.trim()),
      'Maintenance status updated successfully.'
    ).then(() => setStatusNote(''));

  const addNote = () =>
    runAction(
      () => addMaintenanceUpdate(requestId, progressNote.trim()),
      'Progress note added successfully.'
    ).then(() => setProgressNote(''));

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-36 w-full" />
        <Skeleton className="mt-6 h-80 w-full" />
      </PageContainer>
    );
  }

  if (hasError || !maintenanceRequest) {
    return (
      <PageContainer>
        <ErrorState
          description="This maintenance request could not be loaded."
          onRetry={loadRequest}
          title="Maintenance request unavailable"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        actions={
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-card bg-periwinkle-light px-4 text-sm font-semibold text-primary"
            to={backPath(user.role)}
          >
            <LuArrowLeft aria-hidden="true" className="size-4" />
            Back to requests
          </Link>
        }
        description={`Room ${maintenanceRequest.room_number} · Submitted ${formatDateTime(maintenanceRequest.submitted_at)}`}
        title={maintenanceRequest.title}
      />

      {notice ? (
        <Alert className="mb-6" variant="success">
          {notice}
        </Alert>
      ) : null}
      {actionError ? (
        <Alert className="mb-6" variant="error">
          {actionError}
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap gap-2">
              <StatusChip variant="warning">
                {formatLabel(maintenanceRequest.priority)} priority
              </StatusChip>
              <StatusChip>{formatLabel(maintenanceRequest.status)}</StatusChip>
            </div>
            <h2 className="mt-6 text-lg font-bold text-text">Issue details</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-text">
              {maintenanceRequest.description}
            </p>
            <dl className="mt-6 grid gap-5 rounded-card bg-page p-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold text-muted">Student</dt>
                <dd className="mt-1 font-semibold text-text">
                  {maintenanceRequest.student_name}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-muted">
                  Assigned staff
                </dt>
                <dd className="mt-1 font-semibold text-text">
                  {maintenanceRequest.assigned_staff_name || 'Not assigned'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-muted">Completed</dt>
                <dd className="mt-1 font-semibold text-text">
                  {formatDateTime(maintenanceRequest.completed_at)}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-text">Status history</h2>
            {updates.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                No progress updates have been recorded.
              </p>
            ) : (
              <ol className="mt-6 space-y-5">
                {updates.map((update) => (
                  <li className="flex gap-4" key={update.id}>
                    <LuClock3
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-information"
                    />
                    <div>
                      <p className="font-semibold text-text">
                        {formatLabel(update.status)}
                      </p>
                      {update.note ? (
                        <p className="mt-1 text-sm text-text">{update.note}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted">
                        {update.updated_by_name} ·{' '}
                        {formatDateTime(update.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        {user.role !== 'student' ? (
          <div className="space-y-6">
            {user.role === 'admin' ? (
              <Card>
                <h2 className="text-lg font-bold text-text">Assignment</h2>
                <SelectField
                  className="mt-5"
                  label="Maintenance Staff"
                  name="assigned-staff"
                  onChange={(event) => setStaffId(event.target.value)}
                  value={staffId}
                >
                  <option value="">Select staff member</option>
                  {staff.map((staffMember) => (
                    <option key={staffMember.id} value={staffMember.id}>
                      {staffMember.full_name}
                    </option>
                  ))}
                </SelectField>
                <Button
                  className="mt-4 w-full"
                  disabled={!staffId}
                  isLoading={isSaving}
                  onClick={assign}
                >
                  Assign Request
                </Button>
              </Card>
            ) : null}

            {availableStatuses.length > 0 ? (
              <Card>
                <h2 className="text-lg font-bold text-text">Update status</h2>
                <SelectField
                  className="mt-5"
                  label="New status"
                  name="new-maintenance-status"
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  value={selectedStatus}
                >
                  {availableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </SelectField>
                <TextAreaField
                  className="mt-5"
                  label="Status note"
                  name="status-note"
                  onChange={(event) => setStatusNote(event.target.value)}
                  rows={3}
                  value={statusNote}
                />
                <Button
                  className="mt-4 w-full"
                  disabled={!selectedStatus}
                  isLoading={isSaving}
                  onClick={updateStatus}
                >
                  Update Status
                </Button>
              </Card>
            ) : null}

            <Card>
              <h2 className="text-lg font-bold text-text">Progress note</h2>
              <TextAreaField
                className="mt-5"
                label="Note"
                name="progress-note"
                onChange={(event) => setProgressNote(event.target.value)}
                rows={4}
                value={progressNote}
              />
              <Button
                className="mt-4 w-full"
                disabled={progressNote.trim().length < 2}
                isLoading={isSaving}
                onClick={addNote}
              >
                <LuMessageSquarePlus aria-hidden="true" className="size-4" />
                Add Note
              </Button>
            </Card>
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}
