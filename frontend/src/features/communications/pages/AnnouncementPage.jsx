import { useCallback, useEffect, useState } from 'react';
import { LuMegaphone, LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { PageContainer } from '../../../components/common/PageContainer';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusChip } from '../../../components/common/StatusChip';
import { Alert } from '../../../components/feedback/Alert';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import { formatDateTime, formatLabel } from '../../../utils/formatters';
import { AnnouncementForm } from '../components/AnnouncementForm';
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from '../services/communication.service';

export function AnnouncementPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isAdmin = user.role === 'admin';

  const loadAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const result = await getAnnouncements({ page: 1, limit: 50 });
      setAnnouncements(
        Array.isArray(result.announcements) ? result.announcements : []
      );
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const saveAnnouncement = async (announcementData) => {
    if (editing) {
      await updateAnnouncement(editing.id, announcementData);
      setNotice('Announcement updated successfully.');
    } else {
      await createAnnouncement(announcementData);
      setNotice('Announcement created successfully.');
    }
    setEditing(null);
    setIsCreating(false);
    await loadAnnouncements();
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAnnouncement(deleting.id);
      setDeleting(null);
      setNotice('Announcement deleted successfully.');
      await loadAnnouncements();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        actions={
          isAdmin ? (
            <Button
              onClick={() => {
                setEditing(null);
                setIsCreating(true);
              }}
            >
              <LuPlus aria-hidden="true" className="size-4" />
              Create Announcement
            </Button>
          ) : null
        }
        description={
          isAdmin
            ? 'Publish clear hostel updates to the right audience.'
            : 'Read current hostel updates for your role.'
        }
        title={isAdmin ? 'Announcement Management' : 'Announcements'}
      />

      {notice ? (
        <Alert className="mb-6" variant="success">
          {notice}
        </Alert>
      ) : null}

      {isCreating || editing ? (
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-text">
            {editing ? 'Edit announcement' : 'Create announcement'}
          </h2>
          <div className="mt-6">
            <AnnouncementForm
              announcement={editing}
              key={editing?.id || 'new-announcement'}
              onCancel={() => {
                setEditing(null);
                setIsCreating(false);
              }}
              onSubmit={saveAnnouncement}
            />
          </div>
        </Card>
      ) : null}

      <Card>
        {isLoading ? (
          <div className="space-y-4" role="status">
            <span className="sr-only">Loading announcements</span>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : hasError ? (
          <ErrorState
            description="Announcements could not be loaded."
            onRetry={loadAnnouncements}
            title="Announcements unavailable"
          />
        ) : announcements.length === 0 ? (
          <EmptyState
            description={
              isAdmin
                ? 'Create an announcement when there is a hostel update.'
                : 'Current hostel updates will appear here.'
            }
            Icon={LuMegaphone}
            title="No announcements have been published."
          />
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <article
                className="rounded-card border border-border p-5"
                key={announcement.id}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-text">
                        {announcement.title}
                      </h2>
                      <StatusChip>
                        {formatLabel(announcement.status)}
                      </StatusChip>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-muted">
                      {announcement.target_role
                        ? formatLabel(announcement.target_role)
                        : 'All roles'}{' '}
                      ·{' '}
                      {formatDateTime(
                        announcement.published_at || announcement.created_at
                      )}
                    </p>
                  </div>
                  {isAdmin ? (
                    <div className="flex gap-2">
                      <Button
                        aria-label={`Edit ${announcement.title}`}
                        onClick={() => {
                          setIsCreating(false);
                          setEditing(announcement);
                        }}
                        variant="secondary"
                      >
                        <LuPencil aria-hidden="true" className="size-4" />
                        Edit
                      </Button>
                      <Button
                        aria-label={`Delete ${announcement.title}`}
                        onClick={() => setDeleting(announcement)}
                        variant="danger"
                      >
                        <LuTrash2 aria-hidden="true" className="size-4" />
                        Delete
                      </Button>
                    </div>
                  ) : null}
                </div>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-text">
                  {announcement.message}
                </p>
                {announcement.expires_at ? (
                  <p className="mt-4 text-xs text-muted">
                    Expires {formatDateTime(announcement.expires_at)}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </Card>

      {deleting ? (
        <ConfirmDialog
          confirmLabel="Delete Announcement"
          description={`Delete "${deleting.title}"? This action cannot be undone.`}
          isLoading={isDeleting}
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
          title="Delete announcement"
        />
      ) : null}
    </PageContainer>
  );
}
