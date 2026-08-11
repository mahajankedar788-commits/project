import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [expandedId, setExpandedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    api
      .get('/student/results')
      .then((res) => setResults(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load your results.'))
      .finally(() => setLoading(false));
  }, []);

  function toggleDetail(attemptId) {
    if (expandedId === attemptId) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(attemptId);
    setDetail(null);
    setDetailError('');
    setDetailLoading(true);
    api
      .get(`/student/results/${attemptId}`)
      .then((res) => setDetail(res.data.data))
      .catch((err) => setDetailError(err.response?.data?.message || 'Could not load this result.'))
      .finally(() => setDetailLoading(false));
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Results</h1>
      <p className="mt-1 text-sm text-ink/60">
        Marks and pass/fail status for exams you've completed.
      </p>

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-ink/50">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink/20 bg-white/60 px-6 py-14 text-center text-sm text-ink/40">
            No results yet — this fills in once you submit an exam.
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <div key={result.attemptId} className="overflow-hidden rounded-xl bg-white shadow-card">
                <button
                  onClick={() => toggleDetail(result.attemptId)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div>
                    <p className="font-medium text-ink">{result.examName}</p>
                    <p className="text-xs text-ink/50">
                      {result.subjectName} · {formatDateTime(result.submittedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-ink">
                        {result.totalScore}/{result.maxMarks}
                      </p>
                      <p className={`text-xs font-semibold ${result.passed ? 'text-teal-dark' : 'text-red-600'}`}>
                        {result.passed ? 'Passed' : 'Failed'}
                      </p>
                    </div>
                    <span className="text-ink/40">{expandedId === result.attemptId ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expandedId === result.attemptId && (
                  <div className="border-t border-ink/10 px-5 py-4">
                    {detailLoading ? (
                      <p className="text-sm text-ink/50">Loading breakdown…</p>
                    ) : detailError ? (
                      <p className="text-sm text-red-600">{detailError}</p>
                    ) : (
                      <ul className="space-y-3">
                        {detail?.breakdown.map((q, i) => (
                          <li key={q.questionId} className="text-sm">
                            <p className="font-medium text-ink">
                              {i + 1}. {q.questionText}
                            </p>
                            <p className="mt-1 text-xs text-ink/60">
                              Your answer:{' '}
                              <span className={q.correct ? 'font-semibold text-teal-dark' : 'font-semibold text-red-600'}>
                                {q.selectedOption ?? 'Not answered'}
                              </span>
                              {!q.correct && (
                                <>
                                  {' '}
                                  · Correct answer: <span className="font-semibold text-ink">{q.correctOption}</span>
                                </>
                              )}
                              {' '}· {q.marks} mark{q.marks === 1 ? '' : 's'}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
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
