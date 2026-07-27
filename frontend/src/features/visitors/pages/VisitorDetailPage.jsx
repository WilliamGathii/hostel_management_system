import { useCallback, useEffect, useState } from 'react';
import { LuArrowLeft, LuLogIn, LuLogOut, LuShieldCheck } from 'react-icons/lu';
import { Link, useParams } from 'react-router-dom';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { PageContainer } from '../../../components/common/PageContainer';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusChip } from '../../../components/common/StatusChip';
import { Alert } from '../../../components/feedback/Alert';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { TextAreaField } from '../../../components/forms/TextAreaField';
import { useAuth } from '../../../hooks/useAuth';
import {
  formatDate,
  formatDateTime,
  formatLabel,
} from '../../../utils/formatters';
import {
  getVisitor,
  updateVisitorApproval,
  verifyVisitorEntry,
  verifyVisitorExit,
} from '../services/visitor.service';

const backPath = (role) => {
  if (role === 'student') return '/student/visitors';
  if (role === 'admin') return '/admin/visitors';
  return '/security/visitors';
};

export function VisitorDetailPage() {
  const { visitorId } = useParams();
  const { user } = useAuth();
  const [visitor, setVisitor] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadVisitor = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      setVisitor(await getVisitor(visitorId));
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [visitorId]);

  useEffect(() => {
    loadVisitor();
  }, [loadVisitor]);

  const runAction = async (operation, successMessage) => {
    setIsSaving(true);
    setActionError('');
    setNotice('');
    try {
      await operation();
      setConfirmation(null);
      setNotes('');
      setNotice(successMessage);
      await loadVisitor();
    } catch (error) {
      setActionError(error.message || 'Visitor record could not be updated.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmApproval = () =>
    runAction(
      () => updateVisitorApproval(visitorId, confirmation),
      `Visitor ${confirmation} successfully.`
    );

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-36 w-full" />
        <Skeleton className="mt-6 h-80 w-full" />
      </PageContainer>
    );
  }

  if (hasError || !visitor) {
    return (
      <PageContainer>
        <ErrorState
          description="This visitor record could not be loaded."
          onRetry={loadVisitor}
          title="Visitor unavailable"
        />
      </PageContainer>
    );
  }

  const isAdmin = user.role === 'admin';
  const isSecurity = user.role === 'security_staff';

  return (
    <PageContainer className="max-w-6xl">
      <PageHeader
        actions={
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-card bg-periwinkle-light px-4 text-sm font-semibold text-primary"
            to={backPath(user.role)}
          >
            <LuArrowLeft aria-hidden="true" className="size-4" />
            Back to visitors
          </Link>
        }
        description={`Visit scheduled for ${formatDate(visitor.visit_date)}`}
        title={visitor.visitor_name}
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <Card>
          <div className="flex flex-wrap gap-2">
            <StatusChip>{formatLabel(visitor.approval_status)}</StatusChip>
            {visitor.verification_status ? (
              <StatusChip variant="information">
                {formatLabel(visitor.verification_status)}
              </StatusChip>
            ) : null}
          </div>
          <dl className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-muted">
                Registered by
              </dt>
              <dd className="mt-1 font-semibold text-text">
                {visitor.student_name}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">
                Visitor phone
              </dt>
              <dd className="mt-1 font-semibold text-text">
                {visitor.visitor_phone}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">
                Identification
              </dt>
              <dd className="mt-1 font-semibold text-text">
                {visitor.identification_type || 'Not specified'}
                {visitor.identification_number
                  ? ` · ${visitor.identification_number}`
                  : ''}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">
                Expected visit time
              </dt>
              <dd className="mt-1 font-semibold text-text">
                {visitor.expected_entry_time || 'Not specified'} to{' '}
                {visitor.expected_exit_time || 'Not specified'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold text-muted">
                Purpose of visit
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-text">
                {visitor.purpose}
              </dd>
            </div>
          </dl>
          <div className="mt-8 grid gap-4 rounded-card bg-page p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-muted">Entry recorded</p>
              <p className="mt-1 font-semibold text-text">
                {formatDateTime(visitor.entry_time)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted">Exit recorded</p>
              <p className="mt-1 font-semibold text-text">
                {formatDateTime(visitor.exit_time)}
              </p>
            </div>
          </div>
        </Card>

        {isAdmin && visitor.approval_status === 'pending' ? (
          <Card className="self-start">
            <h2 className="text-lg font-bold text-text">Admin review</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Security Staff can verify entry only after approval.
            </p>
            <div className="mt-6 grid gap-3">
              <Button
                onClick={() => setConfirmation('approved')}
                variant="primary"
              >
                Approve Visitor
              </Button>
              <Button
                onClick={() => setConfirmation('rejected')}
                variant="danger"
              >
                Reject Visitor
              </Button>
            </div>
          </Card>
        ) : null}

        {isSecurity ? (
          <Card className="self-start">
            <div className="flex items-center gap-3">
              <LuShieldCheck
                aria-hidden="true"
                className="size-6 text-information"
              />
              <div>
                <h2 className="text-lg font-bold text-text">
                  Entry verification
                </h2>
                <p className="text-sm text-muted">
                  Security records entry and exit only.
                </p>
              </div>
            </div>
            <TextAreaField
              className="mt-6"
              label="Security notes"
              name="security-notes"
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              value={notes}
            />
            {!visitor.entry_time ? (
              <Button
                className="mt-5 min-h-14 w-full text-base"
                isLoading={isSaving}
                onClick={() =>
                  runAction(
                    () => verifyVisitorEntry(visitorId, notes.trim()),
                    'Visitor entry recorded successfully.'
                  )
                }
              >
                <LuLogIn aria-hidden="true" className="size-5" />
                Verify Entry
              </Button>
            ) : !visitor.exit_time ? (
              <Button
                className="mt-5 min-h-14 w-full text-base"
                isLoading={isSaving}
                onClick={() =>
                  runAction(
                    () => verifyVisitorExit(visitorId, notes.trim()),
                    'Visitor exit recorded successfully.'
                  )
                }
                variant="secondary"
              >
                <LuLogOut aria-hidden="true" className="size-5" />
                Record Exit
              </Button>
            ) : (
              <Alert className="mt-5" variant="success">
                Entry and exit are complete for this visit.
              </Alert>
            )}
          </Card>
        ) : null}
      </div>

      {confirmation ? (
        <ConfirmDialog
          confirmLabel={
            confirmation === 'approved' ? 'Approve Visitor' : 'Reject Visitor'
          }
          description={`Confirm that ${visitor.visitor_name}'s visit should be ${confirmation}.`}
          isLoading={isSaving}
          onCancel={() => setConfirmation(null)}
          onConfirm={confirmApproval}
          title={`${formatLabel(confirmation)} visitor`}
          variant={confirmation === 'approved' ? 'primary' : 'danger'}
        />
      ) : null}
    </PageContainer>
  );
}
