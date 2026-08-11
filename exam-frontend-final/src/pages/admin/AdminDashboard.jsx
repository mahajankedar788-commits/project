import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => setStats(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load dashboard stats.'));
  }, []);

  const cards = [
    { label: 'Registered students', value: stats?.registeredStudents ?? '—' },
    { label: 'Active subjects', value: stats?.activeSubjects ?? '—' },
    { label: 'Exams scheduled', value: stats?.examsScheduled ?? '—' },
    {
      label: 'Overall pass rate',
      value: stats
        ? stats.gradedAttempts === 0
          ? 'No data yet'
          : `${stats.overallPassRate}%`
        : '—',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">
        Welcome back, {user?.username}
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        Here's the current state of the examination system.
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-white p-5 shadow-card"
          >
            <p className="text-xs uppercase tracking-wide text-ink/45">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-3xl text-ink">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <Link
        to="/admin/reports"
        className="mt-10 flex items-center justify-center rounded-xl border border-dashed border-ink/20 bg-white/60 px-6 py-10 text-center text-sm font-semibold text-navy hover:bg-white"
      >
        View subject, course, and student-wise performance reports →
      </Link>
    </div>
  );
}
