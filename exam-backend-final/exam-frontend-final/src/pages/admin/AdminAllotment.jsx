import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

export default function AdminAllotment() {
  const [mode, setMode] = useState('bulk'); // 'bulk' | 'single'

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingRefData, setLoadingRefData] = useState(true);
  const [refError, setRefError] = useState('');

  const [courseId, setCourseId] = useState('');
  const [semester, setSemester] = useState('');
  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [result, setResult] = useState(null);

  const [viewStudentId, setViewStudentId] = useState('');
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState('');
  const [viewAllotments, setViewAllotments] = useState(null);

  async function loadRefData() {
    setLoadingRefData(true);
    setRefError('');
    try {
      const [coursesRes, subjectsRes, studentsRes] = await Promise.all([
        api.get('/admin/courses'),
        api.get('/admin/subjects'),
        api.get('/admin/students'),
      ]);
      setCourses(coursesRes.data.data);
      setSubjects(subjectsRes.data.data);
      setStudents(studentsRes.data.data);
    } catch (err) {
      setRefError(err.response?.data?.message || 'Could not load courses, subjects, and students.');
    } finally {
      setLoadingRefData(false);
    }
  }

  useEffect(() => {
    loadRefData();
  }, []);

  // Students who'd be affected by the current bulk selection — shown as a preview.
  const bulkPreviewStudents = useMemo(() => {
    if (mode !== 'bulk' || !courseId || !semester) return [];
    return students.filter(
      (s) => String(s.courseId) === String(courseId) && String(s.semester) === String(semester)
    );
  }, [mode, courseId, semester, students]);

  // Subjects narrowed to the chosen course + semester, when known — falls back to all subjects.
  const relevantSubjects = useMemo(() => {
    if (mode === 'bulk' && courseId && semester) {
      return subjects.filter(
        (sub) => String(sub.courseId) === String(courseId) && String(sub.semester) === String(semester)
      );
    }
    if (mode === 'single' && studentId) {
      const student = students.find((s) => String(s.id) === String(studentId));
      if (student) {
        return subjects.filter(
          (sub) => String(sub.courseId) === String(student.courseId) && String(sub.semester) === String(student.semester)
        );
      }
    }
    return subjects;
  }, [mode, courseId, semester, studentId, subjects, students]);

  function resetMessages() {
    setFormError('');
    setResult(null);
  }

  function switchMode(next) {
    setMode(next);
    setCourseId('');
    setSemester('');
    setStudentId('');
    setSubjectId('');
    resetMessages();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    resetMessages();

    if (!subjectId) {
      setFormError('Choose a subject to allot.');
      return;
    }
    if (mode === 'bulk' && (!courseId || !semester)) {
      setFormError('Choose a course and semester for bulk allotment.');
      return;
    }
    if (mode === 'single' && !studentId) {
      setFormError('Choose a student for a single override.');
      return;
    }

    const payload =
      mode === 'bulk'
        ? { courseId: Number(courseId), semester: Number(semester), subjectId: Number(subjectId) }
        : { studentId: Number(studentId), subjectId: Number(subjectId) };

    setSubmitting(true);
    try {
      const res = await api.post('/admin/allotment', payload);
      setResult(res.data);
      if (viewStudentId && (mode === 'single' ? String(studentId) === String(viewStudentId) : true)) {
        loadAllotmentsForStudent(viewStudentId);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not allot this subject.');
    } finally {
      setSubmitting(false);
    }
  }

  async function loadAllotmentsForStudent(id) {
    if (!id) return;
    setViewLoading(true);
    setViewError('');
    try {
      const res = await api.get(`/admin/allotment/student/${id}`);
      setViewAllotments(res.data.data);
    } catch (err) {
      setViewError(err.response?.data?.message || 'Could not load allotments for this student.');
    } finally {
      setViewLoading(false);
    }
  }

  function handleViewSubmit(e) {
    e.preventDefault();
    loadAllotmentsForStudent(viewStudentId);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Subject allotment</h1>
      <p className="mt-1 text-sm text-ink/60">
        Allot a subject to every student in a course and semester at once, or override for a single student.
      </p>

      {refError && <p className="mt-4 text-sm text-red-600">{refError}</p>}

      <div className="mt-6 rounded-xl bg-white p-6 shadow-card">
        <div className="flex gap-2">
          <ModeButton active={mode === 'bulk'} onClick={() => switchMode('bulk')}>
            Bulk by course &amp; semester
          </ModeButton>
          <ModeButton active={mode === 'single'} onClick={() => switchMode('single')}>
            Single student override
          </ModeButton>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
          {mode === 'bulk' ? (
            <>
              <Field label="Course">
                <select
                  value={courseId}
                  onChange={(e) => {
                    setCourseId(e.target.value);
                    setSubjectId('');
                  }}
                  className="input"
                  disabled={loadingRefData}
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
                  value={semester}
                  onChange={(e) => {
                    setSemester(e.target.value);
                    setSubjectId('');
                  }}
                  className="input"
                  placeholder="4"
                />
              </Field>
            </>
          ) : (
            <Field label="Student">
              <select
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  setSubjectId('');
                }}
                className="input"
                disabled={loadingRefData}
              >
                <option value="">Select a student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.regNo} — {s.name} ({s.courseName}, sem {s.semester})
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Subject">
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="input"
              disabled={loadingRefData}
            >
              <option value="">Select a subject</option>
              {relevantSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.subjectName} ({sub.subjectCode})
                </option>
              ))}
            </select>
          </Field>

          {mode === 'bulk' && courseId && semester && (
            <p className="sm:col-span-2 text-xs text-ink/50">
              {bulkPreviewStudents.length === 0
                ? 'No students found in that course and semester yet.'
                : `Will apply to ${bulkPreviewStudents.length} student(s) in this course and semester who don't already have it.`}
            </p>
          )}

          {formError && (
            <p className="sm:col-span-2 text-sm text-red-600" role="alert">
              {formError}
            </p>
          )}

          {result && (
            <div className="sm:col-span-2 rounded-xl border border-teal/40 bg-teal/10 p-4 text-sm text-ink">
              <p>{result.message}</p>
              {result.data?.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-ink/70">
                  {result.data.map((a) => (
                    <li key={a.id}>
                      {a.studentRegNo} — {a.studentName} → {a.subjectName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting || loadingRefData}
              className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-navy-600 disabled:opacity-60"
            >
              {submitting ? 'Allotting…' : 'Allot subject'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/45">
          View a student's allotted subjects
        </h2>

        <form onSubmit={handleViewSubmit} className="mt-3 flex flex-wrap items-end gap-3">
          <div className="min-w-[16rem]">
            <Field label="Student">
              <select
                value={viewStudentId}
                onChange={(e) => setViewStudentId(e.target.value)}
                className="input"
                disabled={loadingRefData}
              >
                <option value="">Select a student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.regNo} — {s.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <button
            type="submit"
            disabled={viewLoading || !viewStudentId}
            className="rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-ink/5 disabled:opacity-60"
          >
            {viewLoading ? 'Loading…' : 'View'}
          </button>
        </form>

        {viewError && <p className="mt-3 text-sm text-red-600">{viewError}</p>}

        {viewAllotments && (
          viewAllotments.length === 0 ? (
            <div className="mt-3 rounded-xl border border-dashed border-ink/20 bg-white/60 px-6 py-14 text-center text-sm text-ink/40">
              This student has no subjects allotted yet.
            </div>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-xl bg-white shadow-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                    <th className="px-4 py-3">Subject</th>
                  </tr>
                </thead>
                <tbody>
                  {viewAllotments.map((a) => (
                    <tr key={a.id} className="border-b border-ink/5 last:border-0">
                      <td className="px-4 py-3">{a.subjectName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
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

function ModeButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-lg px-4 py-2 text-sm font-semibold transition ' +
        (active ? 'bg-navy text-white shadow-card' : 'bg-ink/5 text-ink/70 hover:bg-ink/10')
      }
    >
      {children}
    </button>
  );
}
