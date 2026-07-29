import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LuActivity,
  LuBedDouble,
  LuClipboardCheck,
  LuGraduationCap,
  LuReceiptText,
  LuUsersRound,
  LuWrench,
} from 'react-icons/lu';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusChip } from '../../../components/common/StatusChip';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { formatDate, formatLabel } from '../../../utils/formatters';
import { ReportTable } from '../components/ReportTable';
import { getReport } from '../services/report.service';

const reportTypes = [
  { value: 'rooms', label: 'Rooms', Icon: LuBedDouble },
  {
    value: 'allocations',
    label: 'Allocations',
    Icon: LuClipboardCheck,
  },
  { value: 'students', label: 'Students', Icon: LuGraduationCap },
  { value: 'maintenance', label: 'Maintenance', Icon: LuWrench },
  { value: 'visitors', label: 'Visitors', Icon: LuUsersRound },
  { value: 'payments', label: 'Payments', Icon: LuReceiptText },
];

const recordTitles = {
  allocations: 'Room allocation records',
  students: 'Student records',
  maintenance: 'Maintenance records',
  visitors: 'Visitor records',
  payments: 'Simulated Payment Records',
};

const statuses = {
  rooms: ['available', 'occupied', 'full', 'under_maintenance', 'inactive'],
  allocations: ['pending', 'active', 'completed', 'cancelled'],
  students: ['active', 'suspended', 'inactive'],
  maintenance: [
    'submitted',
    'assigned',
    'in_progress',
    'completed',
    'rejected',
    'cancelled',
  ],
  visitors: ['pending', 'approved', 'rejected', 'expired'],
  payments: ['pending', 'paid', 'failed', 'rejected', 'reversed'],
};

const statusVariant = {
  active: 'success',
  available: 'success',
  approved: 'success',
  paid: 'success',
  completed: 'success',
  pending: 'warning',
  submitted: 'warning',
  assigned: 'information',
  occupied: 'information',
  in_progress: 'information',
  reversed: 'information',
  full: 'warning',
  under_maintenance: 'warning',
  suspended: 'warning',
  inactive: 'neutral',
  cancelled: 'neutral',
  expired: 'neutral',
  rejected: 'error',
  failed: 'error',
};

const Status = ({ value }) => (
  <StatusChip variant={statusVariant[value]}>{formatLabel(value)}</StatusChip>
);

const amount = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const columnsByType = {
  allocations: [
    {
      label: 'Student',
      render: (record) => (
        <div>
          <p className="font-semibold">{record.student_name}</p>
          <p className="text-xs text-muted">{record.student_number}</p>
        </div>
      ),
    },
    { label: 'Room', render: (record) => record.room_number },
    {
      label: 'Start date',
      render: (record) => formatDate(record.start_date),
    },
    {
      label: 'Status',
      render: (record) => <Status value={record.allocation_status} />,
    },
  ],
  students: [
    {
      label: 'Student',
      render: (record) => (
        <div>
          <p className="font-semibold">{record.full_name}</p>
          <p className="text-xs text-muted">{record.student_number}</p>
        </div>
      ),
    },
    { label: 'Course', render: (record) => record.course || 'Not specified' },
    {
      label: 'Room',
      render: (record) => record.room_number || 'Not allocated',
    },
    {
      label: 'Status',
      render: (record) => <Status value={record.account_status} />,
    },
  ],
  maintenance: [
    {
      label: 'Request',
      render: (record) => (
        <div>
          <p className="font-semibold">{record.title}</p>
          <p className="text-xs text-muted">{record.student_name}</p>
        </div>
      ),
    },
    { label: 'Room', render: (record) => record.room_number },
    {
      label: 'Priority',
      render: (record) => <Status value={record.priority} />,
    },
    {
      label: 'Status',
      render: (record) => <Status value={record.status} />,
    },
    {
      label: 'Submitted',
      render: (record) => formatDate(record.submitted_at),
    },
  ],
  visitors: [
    {
      label: 'Visitor',
      render: (record) => (
        <div>
          <p className="font-semibold">{record.visitor_name}</p>
          <p className="text-xs text-muted">{record.student_name}</p>
        </div>
      ),
    },
    { label: 'Visit date', render: (record) => formatDate(record.visit_date) },
    {
      label: 'Approval',
      render: (record) => <Status value={record.approval_status} />,
    },
    {
      label: 'Visit status',
      render: (record) =>
        record.verification_status ? (
          <Status value={record.verification_status} />
        ) : (
          'Not verified'
        ),
    },
  ],
  payments: [
    {
      label: 'Student',
      render: (record) => (
        <div>
          <p className="font-semibold">{record.student_name}</p>
          <p className="text-xs text-muted">{record.student_number}</p>
        </div>
      ),
    },
    { label: 'Amount', render: (record) => amount(record.amount) },
    { label: 'Method', render: (record) => record.payment_method },
    {
      label: 'Payment date',
      render: (record) => formatDate(record.payment_date),
    },
    {
      label: 'Status',
      render: (record) => <Status value={record.payment_status} />,
    },
  ],
};

const roomColumns = [
  { label: 'Room', render: (record) => record.room_number },
  { label: 'Type', render: (record) => record.room_type },
  { label: 'Floor', render: (record) => record.floor || 'Not specified' },
  {
    label: 'Occupancy',
    render: (record) => `${record.current_occupancy} of ${record.capacity}`,
  },
  { label: 'Status', render: (record) => <Status value={record.status} /> },
];

function SummaryPanels({ report, reportType }) {
  const items = useMemo(() => {
    if (reportType === 'rooms') {
      const summary = report.summary || {};
      return [
        ['Rooms', summary.total_rooms],
        ['Capacity', summary.total_capacity],
        ['Occupied beds', summary.current_occupancy],
        ['Available beds', summary.available_beds],
        ['Occupancy rate', `${summary.occupancy_rate || 0}%`],
      ];
    }
    if (reportType === 'students') {
      const summary = report.summary || {};
      return [
        ['Students', summary.total_students],
        ['Active accounts', summary.active_students],
        ['Suspended accounts', summary.suspended_students],
        ['Inactive accounts', summary.inactive_students],
        ['Registered in period', summary.registrations_in_period],
        ['Allocated students', summary.allocated_students],
      ].slice(0, 5);
    }
    if (reportType === 'allocations') {
      const summary = report.summary || {};
      return [
        ['Allocations', summary.total_allocations],
        ['Active', summary.active_allocations],
        ['Pending', summary.pending_allocations],
        ['Completed', summary.completed_allocations],
        ['Cancelled', summary.cancelled_allocations],
      ];
    }
    if (reportType === 'maintenance') {
      const summary = report.summary || {};
      return [
        ['Requests', summary.total_requests],
        ['Assigned', summary.assigned_requests],
        ['Unassigned', summary.unassigned_requests],
        ['Completed', summary.completed_requests],
        [
          'Average completion',
          summary.average_completion_hours
            ? `${summary.average_completion_hours} hours`
            : 'No data',
        ],
      ];
    }
    if (reportType === 'visitors') {
      const summary = report.summary || {};
      return [
        ['Visitors', summary.total_visitors],
        ['Entries', summary.entries_recorded],
        ['Exits', summary.exits_recorded],
        ['Currently inside', summary.currently_inside],
      ];
    }
    if (reportType === 'payments') {
      const summary = report.summary || {};
      return [
        ['Records', summary.total_records],
        ['Recorded amount', amount(summary.total_amount)],
        ['Paid amount', amount(summary.paid_amount)],
        ['Pending amount', amount(summary.pending_amount)],
      ];
    }
    return (report.status_breakdown || []).map((item) => [
      formatLabel(item.status),
      reportType === 'payments'
        ? `${item.total} · ${amount(item.amount)}`
        : item.total,
    ]);
  }, [report, reportType]);

  if (!items.length) {
    return null;
  }

  return (
    <section
      aria-label="Report summary"
      className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5"
    >
      {items.map(([label, value]) => (
        <Card className="min-h-24" key={label} variant="summary">
          <p className="text-xs font-semibold text-muted">{label}</p>
          <p className="mt-3 text-xl font-bold text-text">{value ?? 0}</p>
        </Card>
      ))}
    </section>
  );
}

function ReportChart({ report, reportType }) {
  const data = useMemo(() => {
    if (reportType === 'students') {
      const summary = report.summary || {};
      return [
        { name: 'Active', total: Number(summary.active_students || 0) },
        { name: 'Suspended', total: Number(summary.suspended_students || 0) },
        { name: 'Inactive', total: Number(summary.inactive_students || 0) },
      ];
    }
    return (report.status_breakdown || []).map((item) => ({
      name: formatLabel(item.status),
      total: Number(item.total || 0),
    }));
  }, [report, reportType]);
  const hasData = data.some((item) => item.total > 0);

  return (
    <Card>
      <h2 className="text-lg font-bold text-text">Status overview</h2>
      <p className="mt-1 text-sm text-muted">
        A summary of the records in this report.
      </p>
      {hasData ? (
        <div
          aria-label={`${formatLabel(reportType)} status chart`}
          className="mt-6 h-72 w-full"
          role="img"
        >
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={data} margin={{ left: -16, right: 8 }}>
              <CartesianGrid
                stroke="var(--color-border)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="name"
                stroke="var(--color-muted)"
                tick={{ fontSize: 12 }}
              />
              <YAxis allowDecimals={false} stroke="var(--color-muted)" />
              <Tooltip />
              <Bar
                dataKey="total"
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState
          description="Records will appear here when data is available."
          Icon={LuActivity}
          title="No chart data is available."
        />
      )}
    </Card>
  );
}

export function ReportPage() {
  const [reportType, setReportType] = useState('rooms');
  const [report, setReport] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    date_from: '',
    date_to: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      setReport(
        await getReport(reportType, {
          page: 1,
          limit: 50,
          search: appliedFilters.search || undefined,
          status: appliedFilters.status || undefined,
          date_from: appliedFilters.date_from || undefined,
          date_to: appliedFilters.date_to || undefined,
        })
      );
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters, reportType]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const changeType = (value) => {
    setReportType(value);
    setFilters({ search: '', status: '', date_from: '', date_to: '' });
    setAppliedFilters({});
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const records = report.records || [];

  return (
    <PageContainer>
      <PageHeader
        description="Review live hostel records using simple operational filters."
        title="Reports and Statistics"
      />

      <div
        aria-label="Report type"
        className="mb-6 flex gap-2 overflow-x-auto rounded-card bg-card p-2 shadow-card"
        role="tablist"
      >
        {reportTypes.map(({ Icon, label, value }) => (
          <button
            aria-selected={reportType === value}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-card px-4 text-sm font-semibold focus-visible:outline-primary ${
              reportType === value
                ? 'bg-periwinkle text-primary'
                : 'text-muted hover:bg-page hover:text-primary'
            }`}
            key={value}
            onClick={() => changeType(value)}
            role="tab"
            type="button"
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </button>
        ))}
      </div>

      <Card className="mb-6">
        <form
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(12rem,1fr)_12rem_12rem_12rem_auto]"
          onSubmit={applyFilters}
        >
          <div>
            <label
              className="mb-1.5 block text-sm font-semibold text-text"
              htmlFor="report-search"
            >
              Search
            </label>
            <input
              className="min-h-11 w-full rounded-card border border-border bg-card px-3.5 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary-soft disabled:bg-page"
              disabled={reportType !== 'students'}
              id="report-search"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
              placeholder={
                reportType === 'students'
                  ? 'Student name, number or course'
                  : 'Not used for this report'
              }
              type="search"
              value={filters.search}
            />
          </div>
          <div>
            <label
              className="mb-1.5 block text-sm font-semibold text-text"
              htmlFor="report-status"
            >
              Status
            </label>
            <select
              className="min-h-11 w-full rounded-card border border-border bg-card px-3.5 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary-soft"
              id="report-status"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
              value={filters.status}
            >
              <option value="">All statuses</option>
              {statuses[reportType].map((value) => (
                <option key={value} value={value}>
                  {formatLabel(value)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="mb-1.5 block text-sm font-semibold text-text"
              htmlFor="report-date-from"
            >
              From
            </label>
            <input
              className="min-h-11 w-full rounded-card border border-border bg-card px-3.5 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary-soft"
              id="report-date-from"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  date_from: event.target.value,
                }))
              }
              type="date"
              value={filters.date_from}
            />
          </div>
          <div>
            <label
              className="mb-1.5 block text-sm font-semibold text-text"
              htmlFor="report-date-to"
            >
              To
            </label>
            <input
              className="min-h-11 w-full rounded-card border border-border bg-card px-3.5 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary-soft"
              id="report-date-to"
              min={filters.date_from || undefined}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  date_to: event.target.value,
                }))
              }
              type="date"
              value={filters.date_to}
            />
          </div>
          <Button className="xl:self-end" type="submit">
            Apply Filters
          </Button>
        </form>
      </Card>

      {isLoading ? (
        <div className="space-y-4" role="status">
          <span className="sr-only">Loading report</span>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      ) : hasError ? (
        <Card>
          <ErrorState
            description="The selected report could not be loaded."
            onRetry={loadReport}
            title="Report unavailable"
          />
        </Card>
      ) : (
        <div className="space-y-6">
          <SummaryPanels report={report} reportType={reportType} />
          <ReportChart report={report} reportType={reportType} />

          {reportType === 'rooms' ? (
            <Card>
              <h2 className="mb-5 text-lg font-bold text-text">
                Room availability and occupancy
              </h2>
              <ReportTable
                columns={roomColumns}
                emptyDescription="Add room records to prepare availability and occupancy reports."
                emptyTitle="No rooms are available for this report."
                records={report.rooms || []}
              />
            </Card>
          ) : null}

          {reportType !== 'rooms' ? (
            <Card>
              <h2 className="mb-5 text-lg font-bold text-text">
                {recordTitles[reportType]}
              </h2>
              <ReportTable
                columns={columnsByType[reportType]}
                emptyDescription="Adjust the filters or add relevant system records."
                emptyTitle={`No ${reportType} records matched this report.`}
                records={records}
              />
            </Card>
          ) : null}
        </div>
      )}
    </PageContainer>
  );
}
