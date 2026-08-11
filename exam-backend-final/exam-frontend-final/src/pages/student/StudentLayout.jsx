import DashboardShell from '../../components/DashboardShell';

const STUDENT_NAV = [
  { to: '/student', label: 'Dashboard', end: true },
  { to: '/student/exams', label: 'My exams' },
  { to: '/student/results', label: 'Results' },
  { to: '/student/profile', label: 'Profile' },
];

export default function StudentLayout() {
  return <DashboardShell navItems={STUDENT_NAV} badge="Student portal" />;
}
