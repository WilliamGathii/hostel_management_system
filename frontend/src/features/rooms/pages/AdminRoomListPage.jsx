import { useCallback, useEffect, useState } from 'react';
import { LuBedDouble, LuPlus, LuSearch } from 'react-icons/lu';
import { Link } from 'react-router-dom';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusChip } from '../../../components/common/StatusChip';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { formatLabel } from '../../../utils/formatters';
import { RoomForm } from '../components/RoomForm';
import { createRoom, getRooms } from '../services/room.service';

const statusVariant = {
  available: 'success',
  occupied: 'information',
  full: 'warning',
  under_maintenance: 'warning',
  inactive: 'neutral',
};

export function AdminRoomListPage() {
  const [rooms, setRooms] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadRooms = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const result = await getRooms({
        page: 1,
        limit: 50,
        search,
        status,
      });
      setRooms(Array.isArray(result.rooms) ? result.rooms : []);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const submitSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const submitRoom = async (roomData) => {
    await createRoom(roomData);
    setIsCreating(false);
    await loadRooms();
  };

  return (
    <PageContainer>
      <PageHeader
        actions={
          <Button onClick={() => setIsCreating((value) => !value)}>
            <LuPlus aria-hidden="true" className="size-4" />
            {isCreating ? 'Close form' : 'Add Room'}
          </Button>
        }
        description="Create rooms and keep capacity and availability accurate."
        title="Room Management"
      />

      {isCreating ? (
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-text">Add a room</h2>
          <p className="mt-1 text-sm text-muted">
            New rooms begin with available status and zero occupants.
          </p>
          <div className="mt-6">
            <RoomForm
              onCancel={() => setIsCreating(false)}
              onSubmit={submitRoom}
              submitLabel="Create Room"
            />
          </div>
        </Card>
      ) : null}

      <Card>
        <form
          className="grid gap-4 rounded-card bg-page p-4 md:grid-cols-[minmax(0,1fr)_13rem_auto]"
          onSubmit={submitSearch}
          role="search"
        >
          <div>
            <label
              className="mb-1.5 block text-sm font-semibold text-text"
              htmlFor="room-search"
            >
              Search rooms
            </label>
            <input
              className="min-h-11 w-full rounded-card border border-border bg-card px-3.5 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary-soft"
              id="room-search"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Room number, type or floor"
              type="search"
              value={searchInput}
            />
          </div>
          <div>
            <label
              className="mb-1.5 block text-sm font-semibold text-text"
              htmlFor="room-status-filter"
            >
              Status
            </label>
            <select
              className="min-h-11 w-full rounded-card border border-border bg-card px-3.5 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary-soft"
              id="room-status-filter"
              onChange={(event) => setStatus(event.target.value)}
              value={status}
            >
              <option value="">All statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="full">Full</option>
              <option value="under_maintenance">Under maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <Button className="md:self-end" type="submit">
            <LuSearch aria-hidden="true" className="size-4" />
            Search
          </Button>
        </form>

        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-3" role="status">
              <span className="sr-only">Loading rooms</span>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : hasError ? (
            <ErrorState
              description="Room information could not be loaded."
              onRetry={loadRooms}
              title="Rooms unavailable"
            />
          ) : rooms.length === 0 ? (
            <EmptyState
              description={
                search || status
                  ? 'Try a different room number, type, floor, or status.'
                  : 'Add the first hostel room to begin allocation.'
              }
              Icon={LuBedDouble}
              title={
                search || status
                  ? 'No rooms matched your search.'
                  : 'No rooms have been added.'
              }
            />
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-card border border-border md:block">
                <table className="w-full table-fixed text-left text-sm">
                  <thead className="bg-page text-xs text-muted">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Room</th>
                      <th className="px-5 py-3 font-semibold">Floor</th>
                      <th className="px-5 py-3 font-semibold">Occupancy</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rooms.map((room) => (
                      <tr className="hover:bg-page/70" key={room.id}>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-text">
                            {room.room_number}
                          </p>
                          <p className="text-muted">{room.room_type}</p>
                        </td>
                        <td className="px-5 py-4 text-text">
                          {room.floor || 'Not specified'}
                        </td>
                        <td className="px-5 py-4 text-text">
                          {room.current_occupancy} of {room.capacity}
                        </td>
                        <td className="px-5 py-4">
                          <StatusChip variant={statusVariant[room.status]}>
                            {formatLabel(room.status)}
                          </StatusChip>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            className="font-semibold text-primary hover:underline"
                            to={`/admin/rooms/${room.id}`}
                          >
                            View room
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-3 md:hidden">
                {rooms.map((room) => (
                  <article className="rounded-card bg-page p-4" key={room.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-text">
                          {room.room_number}
                        </p>
                        <p className="text-sm text-muted">{room.room_type}</p>
                      </div>
                      <StatusChip variant={statusVariant[room.status]}>
                        {formatLabel(room.status)}
                      </StatusChip>
                    </div>
                    <p className="mt-4 text-sm text-text">
                      {room.current_occupancy} of {room.capacity} occupied
                    </p>
                    <Link
                      className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-card bg-periwinkle-light px-4 text-sm font-semibold text-primary"
                      to={`/admin/rooms/${room.id}`}
                    >
                      View room
                    </Link>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>
    </PageContainer>
  );
}
