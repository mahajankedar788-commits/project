import { useEffect, useState } from 'react';
import api from '../../api/axios';

const emptyForm = {
  subjectCode: '',
  subjectName: '',
  courseId: '',
  semester: '',
  totalMarks: '',
  passingMarks: '',
  durationMinutes: '',
};

export default function AdminSubjects() {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [justAdded, setJustAdded] = useState(null);

  const [rowError, setRowError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  async function loadCourses() {
    const res = await api.get('/admin/courses');
    setCourses(res.data.data);
  }

  async function loadSubjects() {
    setLoadingList(true);
    setListError('');
    try {
      const res = await api.get('/admin/subjects');
      setSubjects(res.data.data);
    } catch (err) {
      setListError(err.response?.data?.message || 'Could not load subjects.');
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadCourses().catch(() => {});
    loadSubjects();
  }, []);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setJustAdded(null);

    const { subjectCode, subjectName, courseId, semester, totalMarks, passingMarks, durationMinutes } = form;
    if (!subjectCode || !subjectName || !courseId || !semester || !totalMarks || !passingMarks || !durationMinutes) {
      setFormError('Fill in every field.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/admin/subjects', {
        subjectCode,
        subjectName,
        courseId: Number(courseId),
        semester: Number(semester),
        totalMarks: Number(totalMarks),
        passingMarks: Number(passingMarks),
        durationMinutes: Number(durationMinutes),
      });
      setJustAdded(res.data.data);
      setForm(emptyForm);
      loadSubjects();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not add this subject.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(subject) {
    if (!window.confirm(`Remove ${subject.subjectName} (${subject.subjectCode})? This also removes its question bank.`)) {
      return;
    }
    setRowError('');
    setRemovingId(subject.id);
    try {
      await api.delete(`/admin/subjects/${subject.id}`);
      setSubjects((list) => list.filter((s) => s.id !== subject.id));
    } catch (err) {
      setRowError(err.response?.data?.message || 'Could not remove this subject.');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Subjects</h1>
      <p className="mt-1 text-sm text-ink/60">
        Add subjects per course and semester — question banks and exams attach to these.
      </p>

      {justAdded && (
        <div className="mt-6 rounded-xl border border-teal/40 bg-teal/10 p-4 text-sm text-ink">
          <strong>{justAdded.subjectName}</strong> ({justAdded.subjectCode}) added to {justAdded.courseName}.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-4 rounded-xl bg-white p-6 shadow-card sm:grid-cols-2"
        noValidate
      >
        <Field label="Subject code">
          <input
            value={form.subjectCode}
            onChange={(e) => updateField('subjectCode', e.target.value)}
            className="input"
            placeholder="CO22412"
          />
        </Field>

        <Field label="Subject name">
          <input
            value={form.subjectName}
            onChange={(e) => updateField('subjectName', e.target.value)}
            className="input"
            placeholder="Java Programming"
          />
        </Field>

        <Field label="Course">
          <select
            value={form.courseId}
            onChange={(e) => updateField('courseId', e.target.value)}
            className="input"
          >
            <option value="">Select a course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseName}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Semester">
          <input
            type="number"
            min="1"
            max="8"
            value={form.semester}
            onChange={(e) => updateField('semester', e.target.value)}
            className="input"
            placeholder="4"
          />
        </Field>

        <Field label="Total marks">
          <input
            type="number"
            min="1"
            value={form.totalMarks}
            onChange={(e) => updateField('totalMarks', e.target.value)}
            className="input"
            placeholder="100"
          />
        </Field>

        <Field label="Passing marks">
          <input
            type="number"
            min="1"
            value={form.passingMarks}
            onChange={(e) => updateField('passingMarks', e.target.value)}
            className="input"
            placeholder="40"
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
            {submitting ? 'Adding…' : 'Add subject'}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/45">
          All subjects
        </h2>

        {rowError && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {rowError}
          </p>
        )}

        {loadingList ? (
          <p className="mt-3 text-sm text-ink/50">Loading…</p>
        ) : listError ? (
          <p className="mt-3 text-sm text-red-600">{listError}</p>
        ) : subjects.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-ink/20 bg-white/60 px-6 py-14 text-center text-sm text-ink/40">
            No subjects added yet.
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Sem</th>
                  <th className="px-4 py-3">Marks</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{s.subjectCode}</td>
                    <td className="px-4 py-3">{s.subjectName}</td>
                    <td className="px-4 py-3 text-ink/70">{s.courseName}</td>
                    <td className="px-4 py-3 text-ink/70">{s.semester}</td>
                    <td className="px-4 py-3 text-ink/70">
                      {s.passingMarks}/{s.totalMarks}
                    </td>
                    <td className="px-4 py-3 text-ink/70">{s.durationMinutes} min</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleRemove(s)}
                        disabled={removingId === s.id}
                        className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                      >
                        {removingId === s.id ? 'Removing…' : 'Remove'}
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
