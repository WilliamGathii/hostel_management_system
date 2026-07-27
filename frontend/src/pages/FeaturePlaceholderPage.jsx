import {
  LuBedDouble,
  LuBell,
  LuClipboardCheck,
  LuFileText,
  LuHistory,
  LuMegaphone,
  LuReceiptText,
  LuUsersRound,
  LuWrench,
} from 'react-icons/lu';

import { Card } from '../components/common/Card';
import { PageContainer } from '../components/common/PageContainer';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/feedback/EmptyState';

const emptyStates = {
  'Room allocation': {
    title: 'No room allocations are available.',
    description: 'Room allocation records will appear here.',
    Icon: LuBedDouble,
  },
  'Maintenance requests': {
    title: 'No maintenance requests are available.',
    description: 'Submitted requests and progress updates will appear here.',
    Icon: LuWrench,
  },
  'Visitor registration': {
    title: 'No visitor registrations are available.',
    description: 'Registered visitors and approval results will appear here.',
    Icon: LuUsersRound,
  },
  Announcements: {
    title: 'No announcements have been published.',
    description: 'Hostel announcements will appear here.',
    Icon: LuMegaphone,
  },
  Notifications: {
    title: 'No notifications are available.',
    description: 'Your in-app notifications will appear here.',
    Icon: LuBell,
  },
  'Payment records': {
    title: 'No simulated payment records have been added.',
    description: 'Payment records will appear here after they are recorded.',
    Icon: LuReceiptText,
  },
  'Room management': {
    title: 'No rooms have been added.',
    description: 'Room records will appear here.',
    Icon: LuBedDouble,
  },
  'Maintenance management': {
    title: 'No maintenance requests are available.',
    description: 'Requests that need review or assignment will appear here.',
    Icon: LuWrench,
  },
  'Visitor approvals': {
    title: 'No visitor approvals are waiting.',
    description: 'Visitor requests that need a decision will appear here.',
    Icon: LuUsersRound,
  },
  'Announcement management': {
    title: 'No announcements have been published.',
    description: 'Created announcements will appear here.',
    Icon: LuMegaphone,
  },
  Reports: {
    title: 'No report information is available.',
    description: 'Report results will appear here.',
    Icon: LuFileText,
  },
  'Audit logs': {
    title: 'No activity has been recorded.',
    description: 'Important account and staff actions will appear here.',
    Icon: LuHistory,
  },
  'Assigned requests': {
    title: 'No assigned maintenance requests are available.',
    description: 'Requests assigned to your account will appear here.',
    Icon: LuWrench,
  },
  'Maintenance history': {
    title: 'No maintenance history is available.',
    description: 'Completed and previous work will appear here.',
    Icon: LuHistory,
  },
  'Approved visitors': {
    title: 'No approved visitors are available.',
    description: 'Approved visitor records will appear here for verification.',
    Icon: LuClipboardCheck,
  },
  'Visitor history': {
    title: 'No visitor history is available.',
    description: 'Recorded entry and exit activity will appear here.',
    Icon: LuHistory,
  },
};

export function FeaturePlaceholderPage({ title, description }) {
  const state = emptyStates[title] || {
    title: `No ${title.toLowerCase()} are available.`,
    description,
    Icon: LuFileText,
  };

  return (
    <PageContainer>
      <PageHeader description={description} title={title} />
      <Card>
        <EmptyState {...state} />
      </Card>
    </PageContainer>
  );
}
