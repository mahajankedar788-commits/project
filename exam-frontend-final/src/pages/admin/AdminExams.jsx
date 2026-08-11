import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { TIMEZONES, withBrowserTimeZone, localInputToUtcISOString } from '../../lib/timezone';

const { list: TIMEZONE_OPTIONS, defaultTz: BROWSER_TZ } = withBrowserTimeZone(TIMEZONES);

const emptyForm = {
  examName: '',
  subjectId: '',
  totalQuestions: '',
  durationMinutes: '',
  startTime: '',
  endTime: '',
  timeZone: BROWSER_TZ,
};

export default function AdminExams() {
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [justAdded, setJustAdded] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  async function loadSubjects() {
    const res = await api.get('/admin/subjects');
    setSubjects(res.data.data);
  }

  async function loadExams() {
    setLoadingList(true);
    setListError('');
    try {
      const res = await api.get('/admin/exams');
      setExams(res.data.data);
    } catch (err) {
      setListError(err.response?.data?.message || 'Could not load exams.');
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadSubjects().catch(() => {});
    loadExams();
  }, []);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Pre-fill duration from the subject's default when a subject is picked,
  // without overwriting anything the admin has already typed in.
  function handleSubjectChange(value) {
    const subject = subjects.find((s) => String(s.id) === String(value));
    setForm((f) => ({
      ...f,
      subjectId: value,
      durationMinutes: f.durationMinutes || (subject ? String(subject.durationMinutes) : f.durationMinutes),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setJustAdded(null);

    const { examName, subjectId, totalQuestions, durationMinutes, startTime, endTime, timeZone } = form;
    if (!examName || !subjectId || !totalQuestions || !durationMinutes || !startTime || !endTime || !timeZone) {
      setFormError('Fill in every field.');
      return;
    }

    // Convert the wall-clock times as entered, interpreted in the chosen
    // timezone, into real UTC instants — not the browser's own timezone.
    const startTimeUtc = localInputToUtcISOString(startTime, timeZone);
    const endTimeUtc = localInputToUtcISOString(endTime, timeZone);
    if (new Date(endTimeUtc) <= new Date(startTimeUtc)) {
      setFormError('The exam window must end after it starts.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/admin/exams', {
        examName,
        subjectId: Number(subjectId),
        totalQuestions: Number(totalQuestions),
        durationMinutes: Number(durationMinutes),
        startTime: startTimeUtc,
        endTime: endTimeUtc,
      });
      setJustAdded(res.data.data);
      setForm(emptyForm);
      loadExams();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not schedule this exam.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(examId) {
    setDeletingId(examId);
    try {
      await api.delete(`/admin/exams/${examId}`);
      setExams((es) => es.filter((e) => e.id !== examId));
    } catch (err) {
      setListError(err.response?.data?.message || 'Could not delete this exam.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Exams</h1>
      <p className="mt-1 text-sm text-ink/60">
        Schedule an exam window for a subject — questions are drawn at random from its question bank.
      </p>

      {justAdded && (
        <div className="mt-6 rounded-xl border border-teal/40 bg-teal/10 p-4 text-sm text-ink">
          <strong>{justAdded.examName}</strong> scheduled for {justAdded.subjectName}.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-4 rounded-xl bg-white p-6 shadow-card sm:grid-cols-2"
        noValidate
      >
        <Field label="Exam name">
          <input
            value={form.examName}
            onChange={(e) => updateField('examName', e.target.value)}
            className="input"
            placeholder="Mid-semester test"
          />
        </Field>

        <Field label="Subject">
          <select
            value={form.subjectId}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="input"
          >
            <option value="">Select a subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subjectName} ({s.subjectCode})
              </option>
            ))}
          </select>
        </Field>

        <Field label="Number of questions">
          <input
            type="number"
            min="1"
            value={form.totalQuestions}
            onChange={(e) => updateField('totalQuestions', e.target.value)}
            className="input"
            placeholder="20"
          />
        </Field>

        <Field label="Duration (minutes)">
          <input
            type="number"
            min="1"
            value={form.durationMinutes}
            onChange={(e) => updateField('durationMinutes', e.target.value)}
            className="input"
            placeholder="60"
          />
        </Field>

        <Field label="Opens">
          <input
            type="datetime-local"
            value={form.startTime}
            onChange={(e) => updateField('startTime', e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Closes">
          <input
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => updateField('endTime', e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Timezone">
          <select
            value={form.timeZone}
            onChange={(e) => updateField('timeZone', e.target.value)}
            className="input"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </Field>
        <p className="sm:col-span-2 -mt-2 text-xs text-ink/50">
          "Opens" and "Closes" above are read as wall-clock time in the timezone you pick here —
          e.g. select Mumbai / India to schedule by IST regardless of your own device's timezone.
        </p>

        {formError && (
          <p className="sm:col-span-2 text-sm text-red-600" role="alert">
            {formError}
          </p>
        )}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-navy-600 disabled:opacity-60"
          >
            {submitting ? 'Scheduling…' : 'Schedule exam'}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/45">
          All exams
        </h2>

        {loadingList ? (
          <p className="mt-3 text-sm text-ink/50">Loading…</p>
        ) : listError ? (
          <p className="mt-3 text-sm text-red-600">{listError}</p>
        ) : exams.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-ink/20 bg-white/60 px-6 py-14 text-center text-sm text-ink/40">
            No exams scheduled yet.
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                  <th className="px-4 py-3">Exam</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Questions</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Window (your local time)</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">{exam.examName}</td>
                    <td className="px-4 py-3 text-ink/70">{exam.subjectName}</td>
                    <td className="px-4 py-3 text-ink/70">{exam.totalQuestions}</td>
                    <td className="px-4 py-3 text-ink/70">{exam.durationMinutes} min</td>
                    <td className="px-4 py-3 text-ink/70">
                      {formatDateTime(exam.startTime)} – {formatDateTime(exam.endTime)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(exam.id)}
                        disabled={deletingId === exam.id}
                        className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-60"
                      >
                        {deletingId === exam.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-ink/80">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
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
