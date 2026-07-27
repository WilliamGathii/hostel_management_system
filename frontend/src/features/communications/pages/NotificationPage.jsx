import { useCallback, useEffect, useState } from 'react';
import { LuBell, LuCheck, LuCheckCheck } from 'react-icons/lu';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { PageHeader } from '../../../components/common/PageHeader';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { formatDateTime, formatLabel } from '../../../utils/formatters';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/communication.service';

export function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const result = await getNotifications({ page: 1, limit: 50 });
      setNotifications(
        Array.isArray(result.notifications) ? result.notifications : []
      );
      setUnreadCount(Number(result.unread_count) || 0);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markRead = async (notificationId) => {
    await markNotificationRead(notificationId);
    await loadNotifications();
  };

  const markAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await markAllNotificationsRead();
      await loadNotifications();
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        actions={
          unreadCount > 0 ? (
            <Button
              isLoading={isMarkingAll}
              onClick={markAllRead}
              variant="secondary"
            >
              <LuCheckCheck aria-hidden="true" className="size-4" />
              Mark All Read
            </Button>
          ) : null
        }
        description={`${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.`}
        title="Notifications"
      />

      <Card>
        {isLoading ? (
          <div className="space-y-3" role="status">
            <span className="sr-only">Loading notifications</span>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : hasError ? (
          <ErrorState
            description="Your notifications could not be loaded."
            onRetry={loadNotifications}
            title="Notifications unavailable"
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            description="Room, maintenance, visitor, and announcement updates will appear here."
            Icon={LuBell}
            title="No notifications are available."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <article
                className={`rounded-card border p-4 ${
                  notification.read_at
                    ? 'border-border bg-card'
                    : 'border-periwinkle bg-periwinkle-light/45'
                }`}
                key={notification.id}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-text">
                        {notification.title}
                      </h2>
                      {!notification.read_at ? (
                        <span className="rounded-full bg-information-soft px-2.5 py-1 text-xs font-semibold text-information">
                          Unread
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-text">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      {formatLabel(notification.notification_type)} ·{' '}
                      {formatDateTime(notification.created_at)}
                    </p>
                  </div>
                  {!notification.read_at ? (
                    <Button
                      onClick={() => markRead(notification.id)}
                      variant="ghost"
                    >
                      <LuCheck aria-hidden="true" className="size-4" />
                      Mark Read
                    </Button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
