import DashboardShell from '../../components/DashboardShell';

const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/subjects', label: 'Subjects' },
  { to: '/admin/allotment', label: 'Subject allotment' },
  { to: '/admin/questions', label: 'Question bank' },
  { to: '/admin/exams', label: 'Exams' },
  { to: '/admin/reports', label: 'Reports' },
];

export default function AdminLayout() {
  return <DashboardShell navItems={ADMIN_NAV} badge="Admin console" />;
}
