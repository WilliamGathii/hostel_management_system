import {
  LuBedDouble,
  LuBell,
  LuChartNoAxesCombined,
  LuClipboardCheck,
  LuCircleDollarSign,
  LuCircleUserRound,
  LuClock3,
  LuDoorOpen,
  LuGraduationCap,
  LuHistory,
  LuMegaphone,
  LuReceiptText,
  LuShieldCheck,
  LuUserCheck,
  LuUsersRound,
  LuWrench,
} from 'react-icons/lu';

const studentQuickActions = [
  {
    title: 'View profile',
    description: 'Review your student account information.',
    path: '/student/profile',
    Icon: LuCircleUserRound,
  },
  {
    title: 'View room allocation',
    description: 'Open your current room information.',
    path: '/student/room',
    Icon: LuBedDouble,
  },
  {
    title: 'Submit maintenance request',
    description: 'Open maintenance request services.',
    path: '/student/maintenance',
    Icon: LuWrench,
  },
  {
    title: 'Register a visitor',
    description: 'Open visitor registration services.',
    path: '/student/visitors',
    Icon: LuUsersRound,
  },
  {
    title: 'Announcements',
    description: 'Read hostel announcements when available.',
    path: '/student/announcements',
    Icon: LuMegaphone,
  },
  {
    title: 'Notifications',
    description: 'View your in-app notifications.',
    path: '/student/notifications',
    Icon: LuBell,
  },
  {
    title: 'Payment records',
    description: 'Review simulated payment records.',
    path: '/student/payments',
    Icon: LuReceiptText,
  },
];

const adminQuickActions = [
  {
    title: 'Manage students',
    description: 'Open student account management.',
    path: '/admin/students',
    Icon: LuGraduationCap,
  },
  {
    title: 'Manage rooms',
    description: 'Open hostel room management.',
    path: '/admin/rooms',
    Icon: LuBedDouble,
  },
  {
    title: 'Manage allocations',
    description: 'Open room allocation management.',
    path: '/admin/allocations',
    Icon: LuClipboardCheck,
  },
  {
    title: 'Review maintenance',
    description: 'Open maintenance request management.',
    path: '/admin/maintenance',
    Icon: LuWrench,
  },
  {
    title: 'Review visitors',
    description: 'Open visitor approval management.',
    path: '/admin/visitors',
    Icon: LuUserCheck,
  },
  {
    title: 'Create announcements',
    description: 'Open announcement management.',
    path: '/admin/announcements',
    Icon: LuMegaphone,
  },
  {
    title: 'Review payments',
    description: 'Open simulated payment records.',
    path: '/admin/payments',
    Icon: LuCircleDollarSign,
  },
  {
    title: 'Open reports',
    description: 'Open planned hostel reports.',
    path: '/admin/reports',
    Icon: LuChartNoAxesCombined,
  },
];

const adminSummaryCards = [
  {
    title: 'Students',
    description:
      'Student totals will appear when dashboard statistics are connected.',
    Icon: LuGraduationCap,
    tone: 'information',
  },
  {
    title: 'Rooms',
    description: 'Room totals will appear after the room module is added.',
    Icon: LuBedDouble,
    tone: 'primary',
  },
  {
    title: 'Active allocations',
    description: 'Allocation totals will appear after allocation data is added.',
    Icon: LuClipboardCheck,
    tone: 'success',
  },
  {
    title: 'Maintenance requests',
    description:
      'Request totals will appear after the maintenance module is added.',
    Icon: LuWrench,
    tone: 'warning',
  },
  {
    title: 'Pending visitors',
    description: 'Visitor totals will appear after visitor data is added.',
    Icon: LuUsersRound,
    tone: 'information',
  },
  {
    title: 'Simulated payments',
    description: 'Payment totals will appear after payment records are added.',
    Icon: LuReceiptText,
    tone: 'success',
  },
];

const maintenanceSummaryCards = [
  {
    title: 'Assigned requests',
    Icon: LuClipboardCheck,
    tone: 'information',
  },
  {
    title: 'In-progress requests',
    Icon: LuClock3,
    tone: 'warning',
  },
  {
    title: 'Completed requests',
    Icon: LuShieldCheck,
    tone: 'success',
  },
  {
    title: 'Urgent requests',
    Icon: LuWrench,
    tone: 'error',
  },
];

const securitySummaryCards = [
  {
    title: 'Approved visitors',
    Icon: LuUserCheck,
    tone: 'information',
  },
  {
    title: 'Expected today',
    Icon: LuClock3,
    tone: 'warning',
  },
  {
    title: 'Visitors currently inside',
    Icon: LuDoorOpen,
    tone: 'primary',
  },
  {
    title: 'Completed visits',
    Icon: LuShieldCheck,
    tone: 'success',
  },
];

export const DASHBOARD_BY_ROLE = Object.freeze({
  student: {
    title: 'Student Dashboard',
    roleLabel: 'Student',
    welcomeMessage:
      'View your hostel information and access student services.',
    quickActions: studentQuickActions,
  },
  admin: {
    title: 'Admin Dashboard',
    roleLabel: 'Admin',
    welcomeMessage: 'Manage hostel operations and review system activity.',
    quickActions: adminQuickActions,
    summaryCards: adminSummaryCards,
  },
  maintenance_staff: {
    title: 'Maintenance Dashboard',
    roleLabel: 'Maintenance Staff',
    welcomeMessage: 'View assigned work and manage maintenance progress.',
    quickActions: [
      {
        title: 'Assigned requests',
        description: 'Open maintenance requests assigned to you.',
        path: '/maintenance/requests',
        Icon: LuWrench,
      },
      {
        title: 'Maintenance history',
        description: 'Review completed and previous maintenance work.',
        path: '/maintenance/history',
        Icon: LuHistory,
      },
    ],
    summaryCards: maintenanceSummaryCards,
  },
  security_staff: {
    title: 'Security Dashboard',
    roleLabel: 'Security Staff',
    welcomeMessage: 'Review approved visitors and manage entry records.',
    quickActions: [
      {
        title: 'Approved visitors',
        description: 'Open approved visitor records for verification.',
        path: '/security/visitors',
        Icon: LuUserCheck,
      },
      {
        title: 'Visitor history',
        description: 'Review recorded visitor entry and exit history.',
        path: '/security/history',
        Icon: LuHistory,
      },
    ],
    summaryCards: securitySummaryCards,
  },
});

export const MAINTENANCE_PRIORITIES = [
  { label: 'Low', variant: 'neutral' },
  { label: 'Medium', variant: 'information' },
  { label: 'High', variant: 'warning' },
  { label: 'Urgent', variant: 'error' },
];

export const MAINTENANCE_STATUSES = [
  'Submitted',
  'Assigned',
  'In progress',
  'Completed',
  'Rejected',
  'Cancelled',
];

export const VISITOR_WORKFLOW = [
  'A student registers a visitor.',
  'An Admin approves or rejects the visitor.',
  'Security Staff views approved visitors.',
  'Security Staff records the visitor entry.',
  'Security Staff records the visitor exit.',
];

export const getDashboardForRole = (role) => DASHBOARD_BY_ROLE[role] || null;
