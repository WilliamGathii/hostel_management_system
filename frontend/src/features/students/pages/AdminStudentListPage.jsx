import { useCallback, useEffect, useState } from 'react';
import {
  LuChevronLeft,
  LuChevronRight,
  LuPlus,
  LuSearch,
  LuUserRound,
} from 'react-icons/lu';
import { Link } from 'react-router-dom';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { PageContainer } from '../../../components/common/PageContainer';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusChip } from '../../../components/common/StatusChip';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingSpinner } from '../../../components/feedback/LoadingSpinner';
import { getStudents } from '../services/student.service';

const PAGE_LIMIT = 10;

const statusVariant = {
  active: 'success',
  suspended: 'warning',
  inactive: 'neutral',
};

const formatStatus = (status) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Not available';

const formatDate = (value) => {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? 'Not available'
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
      }).format(date);
};

const initialPagination = {
  page: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 0,
};

function StudentMobileCard({ student }) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-card bg-primary-soft text-primary">
          <LuUserRound aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="break-words font-semibold text-text">
            {student.full_name}
          </p>
          <p className="mt-1 break-words text-sm text-muted">{student.email}</p>
        </div>
        <StatusChip variant={statusVariant[student.account_status]}>
          {formatStatus(student.account_status)}
        </StatusChip>
      </div>

      <dl className="mt-5 grid gap-4 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase text-muted">
            Student number
          </dt>
          <dd className="mt-1 font-medium text-text">
            {student.student_number}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-muted">
            Registered
          </dt>
          <dd className="mt-1 font-medium text-text">
            {formatDate(student.account_created_at)}
          </dd>
        </div>
      </dl>

      <Link
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-card border border-border bg-card px-4 py-2.5 text-sm font-semibold text-text hover:bg-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        to={`/admin/students/${student.id}`}
      >
        View details
      </Link>
    </Card>
  );
}

export function AdminStudentListPage() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(initialPagination);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const result = await getStudents({
        page,
        limit: PAGE_LIMIT,
        search: appliedSearch,
        status,
      });

      setStudents(Array.isArray(result.students) ? result.students : []);
      setPagination(
        result.pagination || {
          ...initialPagination,
          page,
        }
      );
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [appliedSearch, page, status]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(searchInput.trim());
  };

  const changeStatus = (event) => {
    setPage(1);
    setStatus(event.target.value);
  };

  const hasFilters = Boolean(appliedSearch || status);
  const canGoBack = page > 1;
  const canGoForward =
    pagination.totalPages > 0 && page < pagination.totalPages;

  return (
    <PageContainer>
      <PageHeader
        actions={
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-card bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            to="/admin/students/new"
          >
            <LuPlus aria-hidden="true" className="size-4" />
            Add Student
          </Link>
        }
        description="View and manage registered student accounts."
        title="Student Management"
      />

      <Card>
        <form
          className="grid gap-4 md:grid-cols-[minmax(0,1fr)_12rem_auto]"
          onSubmit={submitSearch}
        >
          <div>
            <label
              className="mb-1.5 block text-sm font-semibold text-text"
              htmlFor="student-search"
            >
              Search students
            </label>
            <input
              className="min-h-11 w-full rounded-card border border-border bg-card px-3.5 py-2.5 text-sm text-text outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary-soft"
              id="student-search"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Name, student number or email"
              type="search"
              value={searchInput}
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-sm font-semibold text-text"
              htmlFor="student-status"
            >
              Account status
            </label>
            <select
              className="min-h-11 w-full rounded-card border border-border bg-card px-3.5 py-2.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
              id="student-status"
              onChange={changeStatus}
              value={status}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <Button className="md:self-end" type="submit">
            <LuSearch aria-hidden="true" className="size-4" />
            Search
          </Button>
        </form>
      </Card>

      <section className="mt-6" aria-labelledby="student-results-title">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              className="text-lg font-bold text-text"
              id="student-results-title"
            >
              Student accounts
            </h2>
            <p className="text-sm text-muted">
              {pagination.total} total student
              {pagination.total === 1 ? '' : 's'}
            </p>
          </div>
          <p className="text-sm text-muted">
            Page {pagination.totalPages === 0 ? 0 : pagination.page} of{' '}
            {pagination.totalPages}
          </p>
        </div>

        {isLoading ? (
          <Card className="grid min-h-64 place-items-center">
            <LoadingSpinner label="Loading students" />
          </Card>
        ) : hasError ? (
          <Card>
            <ErrorState
              description="We could not load Student accounts."
              onRetry={loadStudents}
              title="Student list unavailable"
            />
          </Card>
        ) : students.length === 0 ? (
          <Card>
            <EmptyState
              description={
                hasFilters
                  ? 'Try a different search or account status.'
                  : 'Student accounts will appear here after registration.'
              }
              title={
                hasFilters
                  ? 'No students matched your search'
                  : 'No student accounts are available yet'
              }
            />
          </Card>
        ) : (
          <>
            <Card className="hidden overflow-hidden p-0 md:block">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-page text-xs uppercase text-muted">
                    <tr>
                      <th className="px-5 py-3 font-semibold" scope="col">
                        Student
                      </th>
                      <th className="px-5 py-3 font-semibold" scope="col">
                        Student number
                      </th>
                      <th className="px-5 py-3 font-semibold" scope="col">
                        Account status
                      </th>
                      <th className="px-5 py-3 font-semibold" scope="col">
                        Registered
                      </th>
                      <th
                        className="px-5 py-3 text-right font-semibold"
                        scope="col"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-text">
                            {student.full_name}
                          </p>
                          <p className="mt-1 text-muted">{student.email}</p>
                        </td>
                        <td className="px-5 py-4 font-medium text-text">
                          {student.student_number}
                        </td>
                        <td className="px-5 py-4">
                          <StatusChip
                            variant={statusVariant[student.account_status]}
                          >
                            {formatStatus(student.account_status)}
                          </StatusChip>
                        </td>
                        <td className="px-5 py-4 text-muted">
                          {formatDate(student.account_created_at)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            className="font-semibold text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            to={`/admin/students/${student.id}`}
                          >
                            View details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid gap-4 md:hidden">
              {students.map((student) => (
                <StudentMobileCard key={student.id} student={student} />
              ))}
            </div>
          </>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <Button
            disabled={!canGoBack || isLoading}
            onClick={() => setPage((currentPage) => currentPage - 1)}
            variant="secondary"
          >
            <LuChevronLeft aria-hidden="true" className="size-4" />
            Previous
          </Button>
          <Button
            disabled={!canGoForward || isLoading}
            onClick={() => setPage((currentPage) => currentPage + 1)}
            variant="secondary"
          >
            Next
            <LuChevronRight aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </section>
    </PageContainer>
  );
}
