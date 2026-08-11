import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api from '../../api/axios';

export default function TakeExam() {
  const { examId } = useParams();
  const location = useLocation();

  const [attempt, setAttempt] = useState(location.state?.attempt || null);
  const [loading, setLoading] = useState(!location.state?.attempt);
  const [loadError, setLoadError] = useState('');

  // Seeded from attempt.questions[].selectedOption so a resumed attempt shows prior picks.
  const [answers, setAnswers] = useState(() => seedAnswers(location.state?.attempt));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(null);

  const [confirmingSubmit, setConfirmingSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);

  const autoSubmitted = useRef(false);

  // Load the attempt if we arrived here directly (refresh / deep link) rather
  // than via the "Start exam" button, which already carries it in state.
  useEffect(() => {
    if (attempt) return;
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    api
      .post(`/student/exams/${examId}/start`)
      .then((res) => {
        if (!cancelled) {
          setAttempt(res.data.data);
          setAnswers(seedAnswers(res.data.data));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err.response?.data?.message || 'Could not load this exam.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt, examId]);

  // Countdown timer, driven by the server-supplied deadline.
  useEffect(() => {
    if (!attempt?.expiresAt) return;
    const expiresAt = new Date(attempt.expiresAt).getTime();

    function tick() {
      setRemainingSeconds(Math.max(0, Math.round((expiresAt - Date.now()) / 1000)));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [attempt?.expiresAt]);

  const questions = attempt?.questions || [];
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (!attempt || submitting || result) return;
      setSubmitting(true);
      setSubmitError('');
      try {
        // The backend grades whatever answers are already saved server-side —
        // flush every local pick first so a dropped autosave can't cost marks.
        await Promise.all(
          Object.entries(answers).map(([questionId, selectedOption]) =>
            api.put(`/student/attempts/${attempt.attemptId}/answer`, {
              questionId: Number(questionId),
              selectedOption,
            })
          )
        );
        const res = await api.post(`/student/attempts/${attempt.attemptId}/submit`);
        setResult({ ...res.data.data, auto });
      } catch (err) {
        setSubmitError(err.response?.data?.message || 'Could not submit your exam. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [attempt, answers, submitting, result]
  );

  // Auto-submit once the timer runs out.
  useEffect(() => {
    if (remainingSeconds === 0 && !autoSubmitted.current && !result) {
      autoSubmitted.current = true;
      handleSubmit(true);
    }
  }, [remainingSeconds, result, handleSubmit]);

  // Warn on accidental navigation/refresh while the exam is in progress.
  useEffect(() => {
    if (!attempt || result) return;
    function onBeforeUnload(e) {
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [attempt, result]);

  function selectOption(questionId, option) {
    setAnswers((a) => ({ ...a, [questionId]: option }));
    // Best-effort autosave — a failed save here isn't fatal, since every
    // answer is flushed again right before final submit.
    api.put(`/student/attempts/${attempt.attemptId}/answer`, {
      questionId,
      selectedOption: option,
    }).catch(() => {});
  }

  const timeLabel = useMemo(() => {
    if (remainingSeconds == null) return '--:--';
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [remainingSeconds]);

  const timeCritical = remainingSeconds != null && remainingSeconds <= 60;

  if (loading) {
    return (
      <FullScreenMessage>
        <p className="text-sm text-ink/50">Loading your exam…</p>
      </FullScreenMessage>
    );
  }

  if (loadError) {
    return (
      <FullScreenMessage>
        <p className="text-sm text-red-600">{loadError}</p>
        <Link to="/student/exams" className="mt-4 text-sm font-semibold text-teal-dark hover:underline">
          Back to my exams
        </Link>
      </FullScreenMessage>
    );
  }

  if (result) {
    const correctCount = result.breakdown?.filter((b) => b.correct).length ?? 0;
    const totalQuestions = result.breakdown?.length ?? questions.length;
    return (
      <FullScreenMessage>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-teal-dark">
          {result.auto ? 'Time expired — auto-submitted' : 'Submitted'}
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">{result.subjectName}</h1>
        <p className="mt-4 text-4xl font-semibold text-ink">
          {result.totalScore}
          <span className="text-lg font-normal text-ink/40">/{result.maxMarks}</span>
        </p>
        <p className={`mt-1 text-sm font-semibold ${result.passed ? 'text-teal-dark' : 'text-red-600'}`}>
          {result.passed ? 'Passed' : 'Not passed'}
          <span className="ml-1 font-normal text-ink/50">
            (passing marks: {result.passingMarks})
          </span>
        </p>
        <p className="mt-1 text-sm text-ink/60">
          {correctCount} of {totalQuestions} correct
        </p>
        <Link
          to="/student/exams"
          className="mt-8 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-navy-600"
        >
          Back to my exams
        </Link>
      </FullScreenMessage>
    );
  }

  if (!currentQuestion) {
    return (
      <FullScreenMessage>
        <p className="text-sm text-ink/50">This exam has no questions.</p>
      </FullScreenMessage>
    );
  }

  return (
    <div className="min-h-screen bg-parchment">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-ink px-6 py-3 text-parchment">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] text-teal-light uppercase">Exam in progress</p>
          <p className="mt-0.5 text-sm font-medium">{attempt.subjectName}</p>
        </div>
        <div
          className={`rounded-lg px-4 py-2 font-mono text-lg font-semibold ${
            timeCritical ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-teal-light'
          }`}
        >
          {timeLabel}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between text-xs text-ink/50">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span>{answeredCount} answered</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {questions.map((q, i) => (
            <button
              key={q.questionId}
              onClick={() => setCurrentIndex(i)}
              className={`h-8 w-8 rounded-md text-xs font-semibold transition ${
                i === currentIndex
                  ? 'bg-navy text-white'
                  : answers[q.questionId]
                  ? 'bg-teal/20 text-teal-dark'
                  : 'bg-ink/5 text-ink/50 hover:bg-ink/10'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-xl bg-white p-6 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">
            {currentQuestion.marks} mark(s)
          </p>
          <p className="mt-2 text-base font-medium text-ink">{currentQuestion.questionText}</p>

          <div className="mt-5 space-y-2.5">
            {['A', 'B', 'C', 'D'].map((key) => (
              <label
                key={key}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                  answers[currentQuestion.questionId] === key
                    ? 'border-teal bg-teal/10 text-ink'
                    : 'border-ink/15 text-ink/80 hover:bg-ink/5'
                }`}
              >
                <input
                  type="radio"
                  name={`q-${currentQuestion.questionId}`}
                  className="mt-0.5"
                  checked={answers[currentQuestion.questionId] === key}
                  onChange={() => selectOption(currentQuestion.questionId, key)}
                />
                <span>
                  <span className="font-semibold">{key}.</span> {currentQuestion[`option${key}`]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {submitError && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {submitError}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-ink/5 disabled:opacity-40"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                className="rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-ink/5"
              >
                Next
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setConfirmingSubmit(true)}
              disabled={submitting}
              className="rounded-lg bg-teal-dark px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-teal disabled:opacity-60"
            >
              Submit exam
            </button>
          </div>
        </div>
      </main>

      {confirmingSubmit && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-ink/50 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-card">
            <h2 className="text-lg font-semibold text-ink">Submit this exam?</h2>
            <p className="mt-2 text-sm text-ink/60">
              You've answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length && ' Unanswered questions will be marked incorrect.'}
              {' '}
              This can't be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmingSubmit(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-ink/70 hover:bg-ink/5"
              >
                Keep working
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmingSubmit(false);
                  handleSubmit(false);
                }}
                disabled={submitting}
                className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-600 disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function seedAnswers(attempt) {
  const initial = {};
  for (const q of attempt?.questions || []) {
    if (q.selectedOption) initial[q.questionId] = q.selectedOption;
  }
  return initial;
}

function FullScreenMessage({ children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-parchment px-6 text-center">
      {children}
    </div>
  );
}
