import { LuInbox } from 'react-icons/lu';

import { EmptyState } from '../../../components/feedback/EmptyState';

export function DashboardEmptyState({
  title = 'No records are available.',
  description = 'New records will appear here.',
  Icon = LuInbox,
}) {
  return <EmptyState description={description} Icon={Icon} title={title} />;
}
