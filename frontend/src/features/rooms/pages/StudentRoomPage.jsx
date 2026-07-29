import { useCallback, useEffect, useState } from 'react';
import { LuBedDouble } from 'react-icons/lu';

import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusChip } from '../../../components/common/StatusChip';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { formatDate, formatLabel } from '../../../utils/formatters';
import { getMyAllocation } from '../services/room.service';

export function StudentRoomPage() {
  const [allocation, setAllocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadAllocation = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      setAllocation(await getMyAllocation());
    } catch (error) {
      if (error.status === 404 || error.statusCode === 404) {
        setAllocation(null);
      } else {
        setHasError(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllocation();
  }, [loadAllocation]);

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        description="View the room assigned to your student account."
        title="My Room"
      />

      {isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : hasError ? (
        <ErrorState
          description="Your room allocation could not be loaded."
          onRetry={loadAllocation}
          title="Room allocation unavailable"
        />
      ) : !allocation ? (
        <Card>
          <EmptyState
            description="An Admin will notify you after a room has been assigned."
            Icon={LuBedDouble}
            title="No room is currently allocated to you."
          />
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-information">My stay</p>
              <h2 className="mt-1 text-2xl font-bold text-text">
                Room {allocation.room_code || allocation.room_number}
              </h2>
              <p className="mt-1 text-muted">
                {allocation.room_type_name || allocation.room_type}
              </p>
            </div>
            <StatusChip variant="success">
              {formatLabel(allocation.allocation_status)}
            </StatusChip>
          </div>
          <dl className="mt-8 grid gap-5 rounded-card bg-page p-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-muted">Floor</dt>
              <dd className="mt-1 font-semibold text-text">
                {allocation.floor_number || allocation.floor || 'Not specified'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">
                Room capacity
              </dt>
              <dd className="mt-1 font-semibold text-text">
                {allocation.capacity}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">
                Monthly rate at allocation
              </dt>
              <dd className="mt-1 font-semibold text-text">
                KSh{' '}
                {Number(
                  allocation.monthly_rate_at_allocation || 0
                ).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Start date</dt>
              <dd className="mt-1 font-semibold text-text">
                {formatDate(allocation.start_date)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">
                Expected end date
              </dt>
              <dd className="mt-1 font-semibold text-text">
                {formatDate(allocation.expected_end_date)}
              </dd>
            </div>
          </dl>
        </Card>
      )}
    </PageContainer>
  );
}
