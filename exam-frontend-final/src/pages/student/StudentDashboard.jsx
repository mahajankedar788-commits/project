import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function StudentDashboard() {
  const { user } = useAuth();

  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    Promise.all([api.get('/student/exams'), api.get('/student/results')])
      .then(([examsRes, resultsRes]) => {
        if (cancelled) return;
        setExams(examsRes.data.data);
        setResults(resultsRes.data.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load your dashboard.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Exams that are either open right now or scheduled to open later —
  // i.e. everything worth a student's attention, soonest first.
  const upcoming = useMemo(() => {
    const now = new Date();
    return exams
      .filter((e) => e.attemptStatus === 'NOT_STARTED' || e.attemptStatus === 'IN_PROGRESS')
      .filter((e) => new Date(e.endTime) >= now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 5);
  }, [exams]);

  const recentResults = results.slice(0, 5);

  // Personal summary cards, derived from the same two lists — no extra endpoint needed.
  const stats = useMemo(() => {
    const subjectsAllotted = new Set(exams.map((e) => e.subjectName)).size;
    const examsAttempted = results.length;
    const averagePercentage =
      results.length === 0
        ? null
        : Math.round(
            (results.reduce((sum, r) => sum + (r.totalScore / r.maxMarks) * 100, 0) / results.length) * 10
          ) / 10;
    const passRate =
      results.length === 0
        ? null
        : Math.round((results.filter((r) => r.passed).length * 1000) / results.length) / 10;

    return { subjectsAllotted, examsAttempted, averagePercentage, passRate };
  }, [exams, results]);

  const cards = [
    { label: 'Subjects allotted', value: stats.subjectsAllotted },
    { label: 'Exams attempted', value: stats.examsAttempted },
    { label: 'Average score', value: stats.averagePercentage === null ? '—' : `${stats.averagePercentage}%` },
    { label: 'Your pass rate', value: stats.passRate === null ? 'No results yet' : `${stats.passRate}%` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">
        Welcome, {user?.username}
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        Your allotted subjects and upcoming exams will appear here.
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white p-5 shadow-card">
            <p className="text-xs uppercase tracking-wide text-ink/45">{stat.label}</p>
            <p className="mt-2 font-display text-3xl text-ink">{loading ? '—' : stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-ink/45">
              Upcoming exams
            </p>
            <Link to="/student/exams" className="text-xs font-semibold text-navy hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="mt-4 rounded-lg border border-dashed border-ink/15 py-10 text-center text-sm text-ink/40">
              Loading…
            </div>
          ) : upcoming.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-ink/15 py-10 text-center text-sm text-ink/40">
              Nothing scheduled yet
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcoming.map((exam) => {
                const isOpen = exam.attemptStatus === 'IN_PROGRESS' || new Date(exam.startTime) <= new Date();
                return (
                  <li key={exam.examId} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-ink">{exam.subjectName}</p>
                      <p className="text-xs text-ink/50">
                        {isOpen ? `Closes ${formatDateTime(exam.endTime)}` : `Opens ${formatDateTime(exam.startTime)}`}
                      </p>
                    </div>
                    {isOpen && (
                      <span className="shrink-0 rounded-full bg-teal/10 px-2.5 py-1 text-xs font-semibold text-teal-dark">
                        {exam.attemptStatus === 'IN_PROGRESS' ? 'Resume' : 'Open now'}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-xl bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-ink/45">
              Recent results
            </p>
            <Link to="/student/results" className="text-xs font-semibold text-navy hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="mt-4 rounded-lg border border-dashed border-ink/15 py-10 text-center text-sm text-ink/40">
              Loading…
            </div>
          ) : recentResults.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-ink/15 py-10 text-center text-sm text-ink/40">
              No results yet
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentResults.map((result) => (
                <li key={result.attemptId} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-ink">{result.examName}</p>
                    <p className="text-xs text-ink/50">{result.subjectName}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-ink">
                      {result.totalScore}/{result.maxMarks}
                    </p>
                    <p className={`text-xs font-semibold ${result.passed ? 'text-teal-dark' : 'text-red-600'}`}>
                      {result.passed ? 'Passed' : 'Failed'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
}
