import { LuFileChartColumn } from 'react-icons/lu';

import { EmptyState } from '../../../components/feedback/EmptyState';

export function ReportTable({
  columns,
  emptyDescription,
  emptyTitle,
  records,
}) {
  if (!records.length) {
    return (
      <EmptyState
        description={emptyDescription}
        Icon={LuFileChartColumn}
        title={emptyTitle}
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-card border border-border md:block">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-page text-xs text-muted">
            <tr>
              {columns.map((column) => (
                <th className="px-4 py-3 font-semibold" key={column.label}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((record) => (
              <tr className="hover:bg-page/70" key={record.id}>
                {columns.map((column) => (
                  <td className="px-4 py-4 text-text" key={column.label}>
                    {column.render(record)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {records.map((record) => (
          <article className="rounded-card bg-page p-4" key={record.id}>
            <dl className="grid grid-cols-2 gap-4">
              {columns.map((column) => (
                <div key={column.label}>
                  <dt className="text-xs font-semibold text-muted">
                    {column.label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-text">
                    {column.render(record)}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
