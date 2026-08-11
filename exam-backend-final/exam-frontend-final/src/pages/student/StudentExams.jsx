import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const TABS = [
  { key: 'ACTIVE', label: 'Available now' },
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'COMPLETED', label: 'Completed' },
];

// The backend only tells us the raw attemptStatus (NOT_STARTED | IN_PROGRESS |
// SUBMITTED | AUTO_SUBMITTED) plus the exam's time window — the "available
// now vs. upcoming vs. missed" bucketing is derived here from the clock.
function bucketFor(exam, now) {
  if (exam.attemptStatus === 'SUBMITTED' || exam.attemptStatus === 'AUTO_SUBMITTED') {
    return 'COMPLETED';
  }
  const start = new Date(exam.startTime);
  const end = new Date(exam.endTime);
  if (now < start) return 'UPCOMING';
  if (now > end) return 'COMPLETED'; // missed — window closed without an attempt
  return 'ACTIVE';
}

export default function StudentExams() {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('ACTIVE');

  const [startingId, setStartingId] = useState(null);
  const [startError, setStartError] = useState('');

  async function loadExams() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/student/exams');
      setExams(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your exams.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExams();
  }, []);

  const grouped = useMemo(() => {
    const now = new Date();
    const g = { ACTIVE: [], UPCOMING: [], COMPLETED: [] };
    for (const exam of exams) {
      g[bucketFor(exam, now)].push(exam);
    }
    return g;
  }, [exams]);

  async function handleStart(exam) {
    setStartError('');
    setStartingId(exam.examId);
    try {
      const res = await api.post(`/student/exams/${exam.examId}/start`);
      navigate(`/student/exams/${exam.examId}/take`, { state: { attempt: res.data.data } });
    } catch (err) {
      setStartError(err.response?.data?.message || 'Could not start this exam. Try again.');
    } finally {
      setStartingId(null);
    }
  }

  const visible = grouped[tab] || [];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">My exams</h1>
      <p className="mt-1 text-sm text-ink/60">
        Your allotted subjects and upcoming exam windows.
      </p>

      <div className="mt-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              'rounded-lg px-4 py-2 text-sm font-semibold transition ' +
              (tab === t.key ? 'bg-navy text-white shadow-card' : 'bg-ink/5 text-ink/70 hover:bg-ink/10')
            }
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-70">({grouped[t.key]?.length ?? 0})</span>
          </button>
        ))}
      </div>

      {startError && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {startError}
        </p>
      )}

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-ink/50">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink/20 bg-white/60 px-6 py-16 text-center text-sm text-ink/40">
            {tab === 'ACTIVE' && 'No exams are open to take right now.'}
            {tab === 'UPCOMING' && 'No upcoming exams scheduled yet.'}
            {tab === 'COMPLETED' && "You haven't completed any exams yet."}
          </div>
        ) : (
          <ul className="space-y-3">
            {visible.map((exam) => {
              const missed = tab === 'COMPLETED' && exam.attemptStatus === 'NOT_STARTED';
              return (
                <li
                  key={exam.examId}
                  className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{exam.subjectName}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/50">
                      <span>{exam.durationMinutes} min</span>
                      {tab === 'UPCOMING' && <span>Opens {formatDateTime(exam.startTime)}</span>}
                      {tab === 'ACTIVE' && <span>Closes {formatDateTime(exam.endTime)}</span>}
                      {tab === 'COMPLETED' && !missed && <span>Window closed {formatDateTime(exam.endTime)}</span>}
                    </div>
                  </div>

                  {tab === 'ACTIVE' && (
                    <button
                      onClick={() => handleStart(exam)}
                      disabled={startingId === exam.examId}
                      className="shrink-0 rounded-lg bg-teal-dark px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-teal disabled:opacity-60"
                    >
                      {startingId === exam.examId
                        ? 'Starting…'
                        : exam.attemptStatus === 'IN_PROGRESS'
                        ? 'Resume exam'
                        : 'Start exam'}
                    </button>
                  )}

                  {tab === 'COMPLETED' && (
                    <div className="shrink-0 text-right">
                      {missed ? (
                        <span className="text-xs font-semibold uppercase tracking-wide text-red-600">Missed</span>
                      ) : (
                        <p className="text-lg font-semibold text-ink">{exam.score}</p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
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
