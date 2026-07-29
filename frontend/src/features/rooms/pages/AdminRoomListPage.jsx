import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LuArrowLeft,
  LuBedDouble,
  LuBuilding2,
  LuChevronRight,
  LuLayers3,
  LuPencil,
  LuPlus,
  LuSearch,
} from 'react-icons/lu';
import { Link, useSearchParams } from 'react-router-dom';

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
import { formatLabel } from '../../../utils/formatters';
import { BulkRoomForm } from '../components/BulkRoomForm';
import { RoomForm } from '../components/RoomForm';
import { RoomTypeForm } from '../components/RoomTypeForm';
import {
  createRoom,
  createRoomsBulk,
  getRoomFloors,
  getRooms,
  getRoomTypes,
  updateRoomType,
  updateRoomTypeStatus,
} from '../services/room.service';

const tabs = [
  { label: 'Room Types', value: 'types', Icon: LuLayers3 },
  { label: 'Floors & Rooms', value: 'rooms', Icon: LuBuilding2 },
];

const statusVariant = {
  active: 'success',
  available: 'success',
  partially_occupied: 'information',
  full: 'warning',
  under_maintenance: 'warning',
  inactive: 'neutral',
};

const formatCurrency = (amount) =>
  `KSh ${Number(amount || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;

function LoadingList({ label }) {
  return (
    <div className="space-y-3" role="status">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

export function AdminRoomListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'types' ? 'types' : 'rooms';
  const selectedFloor =
    activeTab === 'rooms' ? searchParams.get('floor') || '' : '';
  const [roomTypes, setRoomTypes] = useState([]);
  const [floorSummaries, setFloorSummaries] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [roomTypeId, setRoomTypeId] = useState('');
  const [operationalStatus, setOperationalStatus] = useState('');
  const [occupancyStatus, setOccupancyStatus] = useState('');
  const [openForm, setOpenForm] = useState('');
  const [editingRoomType, setEditingRoomType] = useState(null);
  const [statusRoomType, setStatusRoomType] = useState(null);
  const [isUpdatingTypeStatus, setIsUpdatingTypeStatus] = useState(false);
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadRoomTypes = useCallback(async () => {
    const result = await getRoomTypes();
    setRoomTypes(Array.isArray(result) ? result : []);
  }, []);

  const loadFloors = useCallback(async () => {
    const result = await getRoomFloors();
    setFloorSummaries(Array.isArray(result) ? result : []);
  }, []);

  const loadRooms = useCallback(async () => {
    if (!selectedFloor) {
      setRooms([]);
      setPagination({});
      return;
    }

    const result = await getRooms({
      page,
      limit: 50,
      search,
      floor: selectedFloor,
      room_type_id: roomTypeId,
      operational_status: operationalStatus,
      occupancy_status: occupancyStatus,
    });
    const loadedRooms = Array.isArray(result.rooms) ? result.rooms : [];
    setRooms(loadedRooms);
    setPagination(result.pagination || {});
  }, [
    occupancyStatus,
    operationalStatus,
    page,
    roomTypeId,
    search,
    selectedFloor,
  ]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      await Promise.all([loadRoomTypes(), loadFloors(), loadRooms()]);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [loadFloors, loadRoomTypes, loadRooms]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const groupedRooms = useMemo(() => {
    const groups = new Map();

    rooms.forEach((room) => {
      const key = `${room.floor_number}-${room.room_type_id}`;

      if (!groups.has(key)) {
        groups.set(key, {
          floorNumber: room.floor_number,
          roomTypeCode: room.room_type_code,
          roomTypeName: room.room_type_name,
          rooms: [],
        });
      }
      groups.get(key).rooms.push(room);
    });

    return [...groups.values()];
  }, [rooms]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const openFloor = (floorNumber, preserveNotice = false) => {
    setPage(1);
    setSearchInput('');
    setSearch('');
    setRoomTypeId('');
    setOperationalStatus('');
    setOccupancyStatus('');
    if (!preserveNotice) {
      setNotice('');
    }
    setSearchParams({
      tab: 'rooms',
      floor: String(floorNumber),
    });
  };

  const showAllFloors = () => {
    setPage(1);
    setSearchInput('');
    setSearch('');
    setRoomTypeId('');
    setOperationalStatus('');
    setOccupancyStatus('');
    setSearchParams({ tab: 'rooms' });
  };

  const submitSingleRoom = async (roomData) => {
    const room = await createRoom(roomData);
    setOpenForm('');
    setNotice(`Room ${room.room_code} created successfully.`);
    await loadFloors();

    if (selectedFloor === String(room.floor_number)) {
      await loadRooms();
    } else {
      openFloor(room.floor_number, true);
    }
  };

  const finishBulkCreation = async (result) => {
    setOpenForm('');
    setPage(1);
    setNotice(
      `${result.created_count} rooms created from ${result.first_room_code} to ${result.last_room_code}.`
    );
    await loadFloors();

    if (selectedFloor === String(result.floor_number)) {
      await loadRooms();
    } else {
      openFloor(result.floor_number, true);
    }
  };

  const saveRoomType = async (roomTypeData) => {
    await updateRoomType(editingRoomType.id, roomTypeData);
    setEditingRoomType(null);
    setNotice('Room type updated successfully.');
    await loadRoomTypes();
    await loadRooms();
  };

  const changeRoomTypeStatus = async () => {
    setIsUpdatingTypeStatus(true);

    try {
      const nextStatus =
        statusRoomType.status === 'active' ? 'inactive' : 'active';
      await updateRoomTypeStatus(statusRoomType.id, nextStatus);
      setNotice(`Room type ${statusRoomType.code} is now ${nextStatus}.`);
      setStatusRoomType(null);
      await loadRoomTypes();
    } finally {
      setIsUpdatingTypeStatus(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        actions={
          activeTab === 'rooms' ? (
            <Button onClick={() => setOpenForm('bulk')}>
              <LuPlus aria-hidden="true" className="size-4" />
              Generate Rooms
            </Button>
          ) : null
        }
        description={
          selectedFloor
            ? `Review and manage rooms on Floor ${selectedFloor}.`
            : 'Organise approved room types and rooms by floor.'
        }
        title="Room Management"
      />

      {notice ? (
        <Alert className="mb-5" variant="success">
          {notice}
        </Alert>
      ) : null}

      <div className="mb-5 max-w-full overflow-x-auto">
        <div
          aria-label="Room management sections"
          className="flex min-w-max gap-1 rounded-card bg-periwinkle-light p-1"
          role="tablist"
        >
          {tabs.map(({ Icon, label, value }) => (
            <Link
              aria-selected={activeTab === value}
              className={`inline-flex min-h-11 items-center gap-2 rounded-card px-4 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary ${
                activeTab === value
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted hover:bg-card/60 hover:text-primary'
              }`}
              key={value}
              role="tab"
              to={`?tab=${value}`}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {activeTab === 'types' ? (
        <Card>
          <div>
            <h2 className="text-lg font-bold text-text">Approved room types</h2>
            <p className="mt-1 text-sm text-muted">
              Rates shown are the current monthly values for each room type.
            </p>
          </div>

          <div className="mt-6">
            {isLoading ? (
              <LoadingList label="Loading room types" />
            ) : hasError ? (
              <ErrorState
                description="Room types could not be loaded."
                onRetry={loadData}
                title="Room types unavailable"
              />
            ) : roomTypes.length === 0 ? (
              <EmptyState title="No room types are available." />
            ) : (
              <>
                <div className="hidden overflow-hidden rounded-card border border-border md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-page text-xs text-muted">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Code</th>
                        <th className="px-4 py-3 font-semibold">Name</th>
                        <th className="px-4 py-3 font-semibold">
                          Monthly rate
                        </th>
                        <th className="px-4 py-3 font-semibold">Capacity</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {roomTypes.map((roomType) => (
                        <tr key={roomType.id}>
                          <td className="px-4 py-4 text-lg font-bold text-primary">
                            {roomType.code}
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-semibold text-text">
                              {roomType.name}
                            </p>
                            <p className="text-xs text-muted">
                              {roomType.rooms_count} room
                              {roomType.rooms_count === 1 ? '' : 's'}
                            </p>
                          </td>
                          <td className="px-4 py-4 font-semibold text-text">
                            {formatCurrency(roomType.monthly_rate)}
                          </td>
                          <td className="px-4 py-4 text-text">
                            {roomType.default_capacity}
                          </td>
                          <td className="px-4 py-4">
                            <StatusChip
                              variant={statusVariant[roomType.status]}
                            >
                              {formatLabel(roomType.status)}
                            </StatusChip>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={() => setEditingRoomType(roomType)}
                                variant="ghost"
                              >
                                <LuPencil
                                  aria-hidden="true"
                                  className="size-4"
                                />
                                Edit
                              </Button>
                              <Button
                                onClick={() => setStatusRoomType(roomType)}
                                variant="secondary"
                              >
                                {roomType.status === 'active'
                                  ? 'Deactivate'
                                  : 'Activate'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid gap-3 md:hidden">
                  {roomTypes.map((roomType) => (
                    <article
                      className="rounded-card bg-page p-4"
                      key={roomType.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-bold text-primary">
                            {roomType.code}
                          </p>
                          <p className="font-bold text-text">{roomType.name}</p>
                        </div>
                        <StatusChip variant={statusVariant[roomType.status]}>
                          {formatLabel(roomType.status)}
                        </StatusChip>
                      </div>
                      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <dt className="text-muted">Monthly rate</dt>
                          <dd className="font-semibold text-text">
                            {formatCurrency(roomType.monthly_rate)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted">Capacity</dt>
                          <dd className="font-semibold text-text">
                            {roomType.default_capacity}
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => setEditingRoomType(roomType)}
                          variant="secondary"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => setStatusRoomType(roomType)}
                          variant="ghost"
                        >
                          {roomType.status === 'active'
                            ? 'Deactivate'
                            : 'Activate'}
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          {openForm ? (
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-text">
                    {openForm === 'bulk'
                      ? 'Generate rooms in bulk'
                      : 'Add a single room'}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Room codes and capacities are generated from the selected
                    room type.
                  </p>
                </div>
                {openForm === 'bulk' ? (
                  <Button onClick={() => setOpenForm('single')} variant="ghost">
                    Add Single Room
                  </Button>
                ) : (
                  <Button onClick={() => setOpenForm('bulk')} variant="ghost">
                    Generate a batch
                  </Button>
                )}
              </div>
              <div className="mt-6">
                {openForm === 'bulk' ? (
                  <BulkRoomForm
                    existingRooms={rooms}
                    onCancel={() => setOpenForm('')}
                    onCreated={finishBulkCreation}
                    onSubmit={createRoomsBulk}
                    roomTypes={roomTypes}
                  />
                ) : (
                  <RoomForm
                    onCancel={() => setOpenForm('')}
                    onSubmit={submitSingleRoom}
                    roomTypes={roomTypes}
                    submitLabel="Create Room"
                  />
                )}
              </div>
            </Card>
          ) : null}

          <Card>
            {!selectedFloor ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-text">
                      Hostel floors
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      Choose a floor to view and manage its rooms.
                    </p>
                  </div>
                  {!isLoading && floorSummaries.length > 0 ? (
                    <p className="text-sm font-semibold text-muted">
                      {floorSummaries.length} floor
                      {floorSummaries.length === 1 ? '' : 's'}
                    </p>
                  ) : null}
                </div>

                <div className="mt-6">
                  {isLoading ? (
                    <LoadingList label="Loading floors" />
                  ) : hasError ? (
                    <ErrorState
                      description="Floor information could not be loaded."
                      onRetry={loadData}
                      title="Floors unavailable"
                    />
                  ) : floorSummaries.length === 0 ? (
                    <EmptyState
                      description="Generate the first hostel rooms to create a floor."
                      Icon={LuBuilding2}
                      title="No floors have been added."
                    />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {floorSummaries.map((floorSummary) => (
                        <button
                          aria-label={`View rooms on Floor ${floorSummary.floor_number}`}
                          className="group rounded-card border border-border bg-page p-5 text-left transition hover:border-periwinkle hover:bg-periwinkle-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                          key={floorSummary.floor_number}
                          onClick={() => openFloor(floorSummary.floor_number)}
                          type="button"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-semibold text-information">
                                Floor
                              </p>
                              <h3 className="mt-1 text-xl font-bold text-text">
                                Floor {floorSummary.floor_number}
                              </h3>
                              <p className="mt-1 text-sm text-muted">
                                {floorSummary.room_count} room
                                {floorSummary.room_count === 1 ? '' : 's'}
                              </p>
                            </div>
                            <LuChevronRight
                              aria-hidden="true"
                              className="mt-1 size-5 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary"
                            />
                          </div>
                          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4 text-sm">
                            <div>
                              <dt className="text-muted">Occupancy</dt>
                              <dd className="mt-0.5 font-semibold text-text">
                                {floorSummary.current_occupancy} of{' '}
                                {floorSummary.total_capacity} beds
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted">Available rooms</dt>
                              <dd className="mt-0.5 font-semibold text-success">
                                {floorSummary.available_room_count}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted">Maintenance</dt>
                              <dd className="mt-0.5 font-semibold text-text">
                                {floorSummary.maintenance_room_count}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted">Inactive</dt>
                              <dd className="mt-0.5 font-semibold text-text">
                                {floorSummary.inactive_room_count}
                              </dd>
                            </div>
                          </dl>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Button onClick={showAllFloors} variant="ghost">
                      <LuArrowLeft aria-hidden="true" className="size-4" />
                      All Floors
                    </Button>
                    <div className="border-l border-border pl-4">
                      <h2 className="text-lg font-bold text-text">
                        Floor {selectedFloor}
                      </h2>
                      <p className="text-sm text-muted">
                        Rooms grouped by type
                      </p>
                    </div>
                  </div>
                  {!isLoading && pagination.total ? (
                    <p className="text-sm font-semibold text-muted">
                      {pagination.total} room
                      {pagination.total === 1 ? '' : 's'}
                    </p>
                  ) : null}
                </div>

                <form
                  className="mt-6 grid gap-4 rounded-card bg-page p-4 md:grid-cols-2 xl:grid-cols-[minmax(12rem,1fr)_11rem_11rem_11rem_auto]"
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
                      placeholder="Room code or room type"
                      type="search"
                      value={searchInput}
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1.5 block text-sm font-semibold text-text"
                      htmlFor="room-type-filter"
                    >
                      Room type
                    </label>
                    <select
                      className="min-h-11 w-full rounded-card border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary-soft"
                      id="room-type-filter"
                      onChange={(event) => {
                        setRoomTypeId(event.target.value);
                        setPage(1);
                      }}
                      value={roomTypeId}
                    >
                      <option value="">All types</option>
                      {roomTypes.map((roomType) => (
                        <option key={roomType.id} value={roomType.id}>
                          {roomType.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="mb-1.5 block text-sm font-semibold text-text"
                      htmlFor="room-operational-filter"
                    >
                      Operation
                    </label>
                    <select
                      className="min-h-11 w-full rounded-card border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary-soft"
                      id="room-operational-filter"
                      onChange={(event) => {
                        setOperationalStatus(event.target.value);
                        setPage(1);
                      }}
                      value={operationalStatus}
                    >
                      <option value="">All states</option>
                      <option value="active">Active</option>
                      <option value="under_maintenance">
                        Under maintenance
                      </option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="mb-1.5 block text-sm font-semibold text-text"
                      htmlFor="room-occupancy-filter"
                    >
                      Occupancy
                    </label>
                    <select
                      className="min-h-11 w-full rounded-card border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary-soft"
                      id="room-occupancy-filter"
                      onChange={(event) => {
                        setOccupancyStatus(event.target.value);
                        setPage(1);
                      }}
                      value={occupancyStatus}
                    >
                      <option value="">All occupancy</option>
                      <option value="available">Available</option>
                      <option value="partially_occupied">
                        Partially occupied
                      </option>
                      <option value="full">Full</option>
                    </select>
                  </div>
                  <Button className="self-end" type="submit">
                    <LuSearch aria-hidden="true" className="size-4" />
                    Search
                  </Button>
                </form>

                <div className="mt-6">
                  {isLoading ? (
                    <LoadingList label="Loading rooms" />
                  ) : hasError ? (
                    <ErrorState
                      description="Room information could not be loaded."
                      onRetry={loadData}
                      title="Rooms unavailable"
                    />
                  ) : rooms.length === 0 ? (
                    <EmptyState
                      description={
                        search ||
                        roomTypeId ||
                        operationalStatus ||
                        occupancyStatus
                          ? 'Try different room filters.'
                          : 'Generate rooms for this floor when they are ready.'
                      }
                      Icon={LuBedDouble}
                      title={
                        search ||
                        roomTypeId ||
                        operationalStatus ||
                        occupancyStatus
                          ? 'No rooms matched your filters.'
                          : `No rooms have been added to Floor ${selectedFloor}.`
                      }
                    />
                  ) : (
                    <div className="space-y-8">
                      {groupedRooms.map((group) => (
                        <section
                          aria-labelledby={`room-group-${group.floorNumber}-${group.roomTypeCode}`}
                          key={`${group.floorNumber}-${group.roomTypeCode}`}
                        >
                          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border pb-3">
                            <h2
                              className="text-lg font-bold text-text"
                              id={`room-group-${group.floorNumber}-${group.roomTypeCode}`}
                            >
                              {group.roomTypeName}
                            </h2>
                            <p className="text-sm text-muted">
                              {group.rooms.length} room
                              {group.rooms.length === 1 ? '' : 's'}
                            </p>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {group.rooms.map((room) => (
                              <article
                                className="rounded-card bg-page p-4"
                                key={room.id}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-mono text-lg font-bold text-primary">
                                      {room.room_code}
                                    </p>
                                    <p className="text-sm text-muted">
                                      {formatCurrency(room.monthly_rate)}
                                    </p>
                                  </div>
                                  <StatusChip
                                    variant={
                                      statusVariant[room.occupancy_status]
                                    }
                                  >
                                    {formatLabel(room.occupancy_status)}
                                  </StatusChip>
                                </div>
                                <p className="mt-3 text-sm text-text">
                                  {room.current_occupancy} of {room.capacity}{' '}
                                  occupied
                                </p>
                                <p className="mt-1 text-xs text-muted">
                                  {formatLabel(room.operational_status)}
                                </p>
                                <Link
                                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-card bg-periwinkle-light px-4 text-sm font-semibold text-primary hover:bg-periwinkle focus-visible:outline-2 focus-visible:outline-primary"
                                  to={`/admin/rooms/${room.id}`}
                                >
                                  View room
                                </Link>
                              </article>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
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
              </>
            )}
          </Card>
        </div>
      )}

      {editingRoomType ? (
        <div
          aria-labelledby="room-type-edit-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary/35 p-4"
          role="dialog"
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-card bg-card p-5 shadow-xl sm:p-6">
            <h2
              className="text-lg font-bold text-text"
              id="room-type-edit-title"
            >
              Edit {editingRoomType.name}
            </h2>
            <div className="mt-5">
              <RoomTypeForm
                onCancel={() => setEditingRoomType(null)}
                onSubmit={saveRoomType}
                roomType={editingRoomType}
              />
            </div>
          </div>
        </div>
      ) : null}

      {statusRoomType ? (
        <ConfirmDialog
          confirmLabel={
            statusRoomType.status === 'active' ? 'Deactivate' : 'Activate'
          }
          description={
            statusRoomType.status === 'active'
              ? `Deactivate ${statusRoomType.name}? Existing rooms and allocation history will be kept, but new rooms cannot use this type.`
              : `Activate ${statusRoomType.name} for future room generation?`
          }
          isLoading={isUpdatingTypeStatus}
          onCancel={() => setStatusRoomType(null)}
          onConfirm={changeRoomTypeStatus}
          title="Confirm room type status"
          variant={statusRoomType.status === 'active' ? 'danger' : 'primary'}
        />
      ) : null}
    </PageContainer>
  );
}
