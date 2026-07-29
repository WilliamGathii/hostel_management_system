import { useCallback, useEffect, useState } from 'react';
import { LuArrowLeft } from 'react-icons/lu';
import { Link, useParams } from 'react-router-dom';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusChip } from '../../../components/common/StatusChip';
import { Alert } from '../../../components/feedback/Alert';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { formatLabel } from '../../../utils/formatters';
import { RoomForm } from '../components/RoomForm';
import {
  getRoomById,
  updateRoom,
  updateRoomStatus,
} from '../services/room.service';

export function AdminRoomDetailPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [status, setStatus] = useState('');
  const [notice, setNotice] = useState('');
  const [statusError, setStatusError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadRoom = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const result = await getRoomById(roomId);
      setRoom(result);
      setStatus(result?.operational_status || '');
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  const saveDetails = async (roomData) => {
    const updatedRoom = await updateRoom(roomId, roomData);
    setRoom(updatedRoom);
    setNotice('Room details updated successfully.');
  };

  const saveStatus = async () => {
    setIsSavingStatus(true);
    setStatusError('');
    setNotice('');

    try {
      const updatedRoom = await updateRoomStatus(roomId, status);
      setRoom(updatedRoom);
      setNotice('Room status updated successfully.');
    } catch (error) {
      setStatusError(error.message || 'Room status could not be updated.');
    } finally {
      setIsSavingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="mt-6 h-80 w-full" />
      </PageContainer>
    );
  }

  if (hasError || !room) {
    return (
      <PageContainer>
        <ErrorState
          description="This room could not be loaded."
          onRetry={loadRoom}
          title="Room unavailable"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        actions={
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-card bg-periwinkle-light px-4 text-sm font-semibold text-primary"
            to="/admin/rooms"
          >
            <LuArrowLeft aria-hidden="true" className="size-4" />
            Back to rooms
          </Link>
        }
        description={`${room.room_type_name} on Floor ${room.floor_number}, with ${room.current_occupancy} of ${room.capacity} spaces occupied.`}
        title={`Room ${room.room_code}`}
      />

      {notice ? (
        <Alert className="mb-6" variant="success">
          {notice}
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card>
          <h2 className="text-lg font-bold text-text">Room information</h2>
          <dl className="mt-5 grid gap-4 rounded-card bg-page p-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-muted">Room type</dt>
              <dd className="mt-1 font-semibold text-text">
                {room.room_type_name} ({room.room_type_code})
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Monthly rate</dt>
              <dd className="mt-1 font-semibold text-text">
                KSh {Number(room.monthly_rate).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Floor</dt>
              <dd className="mt-1 font-semibold text-text">
                {room.floor_number}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Occupancy</dt>
              <dd className="mt-1 font-semibold text-text">
                {room.current_occupancy} of {room.capacity}
              </dd>
            </div>
          </dl>
          <div className="mt-6">
            <RoomForm
              initialValues={room}
              mode="edit"
              onSubmit={saveDetails}
              submitLabel="Save Changes"
            />
          </div>
        </Card>
        <Card className="self-start">
          <h2 className="text-lg font-bold text-text">Room status</h2>
          <div className="mt-3">
            <StatusChip>{formatLabel(room.occupancy_status)}</StatusChip>
          </div>
          <label
            className="mt-6 block text-sm font-semibold text-text"
            htmlFor="room-detail-status"
          >
            Change status
          </label>
          <select
            className="mt-1.5 min-h-11 w-full rounded-card border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary-soft"
            id="room-detail-status"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            <option value="active">Active</option>
            <option value="under_maintenance">Under maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
          {statusError ? (
            <p className="mt-2 text-sm text-error">{statusError}</p>
          ) : null}
          <Button
            className="mt-4 w-full"
            disabled={status === room.operational_status}
            isLoading={isSavingStatus}
            onClick={saveStatus}
          >
            Update Status
          </Button>
        </Card>
      </div>
    </PageContainer>
  );
}
