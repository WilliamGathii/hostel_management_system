import {
  LuBedDouble,
  LuBell,
  LuClipboardCheck,
  LuGraduationCap,
  LuHistory,
  LuLayoutDashboard,
  LuMegaphone,
  LuReceiptText,
  LuScrollText,
  LuShieldCheck,
  LuUserRound,
  LuUsersRound,
  LuWrench,
  LuChartNoAxesCombined,
} from 'react-icons/lu';

export const ROLE_LABELS = Object.freeze({
  student: 'Student',
  admin: 'Admin',
  maintenance_staff: 'Maintenance Staff',
  security_staff: 'Security Staff',
});

export const NAVIGATION_BY_ROLE = Object.freeze({
  student: [
    {
      label: 'Dashboard',
      path: '/student/dashboard',
      Icon: LuLayoutDashboard,
      mobile: true,
    },
    {
      label: 'Profile',
      path: '/student/profile',
      Icon: LuUserRound,
      mobile: true,
    },
    {
      label: 'Room',
      path: '/student/room',
      Icon: LuBedDouble,
      mobile: true,
    },
    {
      label: 'Maintenance',
      path: '/student/maintenance',
      Icon: LuWrench,
      mobile: true,
    },
    {
      label: 'Visitors',
      path: '/student/visitors',
      Icon: LuUsersRound,
      mobile: true,
    },
    {
      label: 'Announcements',
      path: '/student/announcements',
      Icon: LuMegaphone,
    },
    {
      label: 'Notifications',
      path: '/student/notifications',
      Icon: LuBell,
    },
    {
      label: 'Payments',
      path: '/student/payments',
      Icon: LuReceiptText,
    },
  ],
  admin: [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      Icon: LuLayoutDashboard,
      mobile: true,
    },
    {
      label: 'Students',
      path: '/admin/students',
      Icon: LuGraduationCap,
      mobile: true,
    },
    {
      label: 'Rooms',
      path: '/admin/rooms',
      Icon: LuBedDouble,
      mobile: true,
    },
    {
      label: 'Allocations',
      path: '/admin/allocations',
      Icon: LuClipboardCheck,
    },
    {
      label: 'Maintenance',
      path: '/admin/maintenance',
      Icon: LuWrench,
    },
    {
      label: 'Visitors',
      path: '/admin/visitors',
      Icon: LuUsersRound,
      mobile: true,
    },
    {
      label: 'Announcements',
      path: '/admin/announcements',
      Icon: LuMegaphone,
    },
    {
      label: 'Payments',
      path: '/admin/payments',
      Icon: LuReceiptText,
    },
    {
      label: 'Reports',
      path: '/admin/reports',
      Icon: LuChartNoAxesCombined,
      mobile: true,
    },
    {
      label: 'Audit Logs',
      path: '/admin/audit-logs',
      Icon: LuScrollText,
    },
  ],
  maintenance_staff: [
    {
      label: 'Dashboard',
      path: '/maintenance/dashboard',
      Icon: LuLayoutDashboard,
      mobile: true,
    },
    {
      label: 'Assigned Requests',
      path: '/maintenance/requests',
      Icon: LuWrench,
      mobile: true,
    },
    {
      label: 'History',
      path: '/maintenance/history',
      Icon: LuHistory,
      mobile: true,
    },
  ],
  security_staff: [
    {
      label: 'Dashboard',
      path: '/security/dashboard',
      Icon: LuLayoutDashboard,
      mobile: true,
    },
    {
      label: 'Approved Visitors',
      path: '/security/visitors',
      Icon: LuShieldCheck,
      mobile: true,
    },
    {
      label: 'Visitor History',
      path: '/security/history',
      Icon: LuHistory,
      mobile: true,
    },
  ],
});

export const getNavigationForRole = (role) => NAVIGATION_BY_ROLE[role] || [];
