import { useEffect, useState } from 'react';
import api from '../../api/axios';

const emptyForm = {
  regNo: '',
  name: '',
  courseId: '',
  semester: '',
  email: '',
  mobile: '',
};

export default function AdminStudents() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [generatedCreds, setGeneratedCreds] = useState(null);

  const [newCourseName, setNewCourseName] = useState('');
  const [addingCourse, setAddingCourse] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);

  const [rowError, setRowError] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [resettingId, setResettingId] = useState(null);
  const [resetCreds, setResetCreds] = useState(null);

  async function loadCourses() {
    const res = await api.get('/admin/courses');
    setCourses(res.data.data);
  }

  async function loadStudents() {
    setLoadingList(true);
    setListError('');
    try {
      const res = await api.get('/admin/students');
      setStudents(res.data.data);
    } catch (err) {
      setListError(err.response?.data?.message || 'Could not load students.');
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadCourses().catch(() => {});
    loadStudents();
  }, []);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleAddCourse(e) {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    setAddingCourse(true);
    try {
      const res = await api.post('/admin/courses', { courseName: newCourseName.trim() });
      const created = res.data.data;
      setCourses((c) => [...c, created]);
      setForm((f) => ({ ...f, courseId: String(created.id) }));
      setNewCourseName('');
      setShowCourseForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not add course.');
    } finally {
      setAddingCourse(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setGeneratedCreds(null);

    if (!form.regNo || !form.name || !form.courseId || !form.semester || !form.email) {
      setFormError('Fill in registration number, name, course, semester, and email.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/admin/students', {
        ...form,
        courseId: Number(form.courseId),
        semester: Number(form.semester),
      });
      setGeneratedCreds(res.data.data);
      setForm(emptyForm);
      loadStudents();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not register this student.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(student) {
    if (!window.confirm(`Remove ${student.name} (${student.regNo})? This deletes their registration and login.`)) {
      return;
    }
    setRowError('');
    setRemovingId(student.id);
    try {
      await api.delete(`/admin/students/${student.id}`);
      setStudents((list) => list.filter((s) => s.id !== student.id));
    } catch (err) {
      setRowError(err.response?.data?.message || 'Could not remove this student.');
    } finally {
      setRemovingId(null);
    }
  }

  async function handleResetPassword(student) {
    if (!window.confirm(`Reset the password for ${student.name} (${student.regNo})? Their old password stops working immediately.`)) {
      return;
    }
    setRowError('');
    setResettingId(student.id);
    try {
      const res = await api.post(`/admin/students/${student.id}/reset-password`);
      setResetCreds(res.data.data);
    } catch (err) {
      setRowError(err.response?.data?.message || 'Could not reset this password.');
    } finally {
      setResettingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Students</h1>
      <p className="mt-1 text-sm text-ink/60">
        Register new students — their username and password are generated automatically.
      </p>

      {generatedCreds && (
        <div className="mt-6 rounded-xl border border-teal/40 bg-teal/10 p-5">
          <p className="text-sm font-semibold text-ink">
            {generatedCreds.name} registered — share these credentials now
          </p>
          <p className="mt-1 text-xs text-ink/60">
            This password won't be shown again. Copy it before dismissing this message.
          </p>
          <div className="mt-3 flex flex-wrap gap-6 font-mono text-sm">
            <div>
              <p className="text-xs text-ink/45">Username</p>
              <p className="text-ink">{generatedCreds.generatedUsername}</p>
            </div>
            <div>
              <p className="text-xs text-ink/45">Password</p>
              <p className="text-ink">{generatedCreds.generatedPassword}</p>
            </div>
          </div>
          <button
            onClick={() => setGeneratedCreds(null)}
            className="mt-4 text-xs font-semibold text-teal-dark hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {resetCreds && (
        <div className="mt-6 rounded-xl border border-teal/40 bg-teal/10 p-5">
          <p className="text-sm font-semibold text-ink">
            Password reset for {resetCreds.name} — share the new password now
          </p>
          <p className="mt-1 text-xs text-ink/60">
            This won't be shown again. Their old password no longer works.
          </p>
          <div className="mt-3 flex flex-wrap gap-6 font-mono text-sm">
            <div>
              <p className="text-xs text-ink/45">Username</p>
              <p className="text-ink">{resetCreds.username}</p>
            </div>
            <div>
              <p className="text-xs text-ink/45">New password</p>
              <p className="text-ink">{resetCreds.generatedPassword}</p>
            </div>
          </div>
          <button
            onClick={() => setResetCreds(null)}
            className="mt-4 text-xs font-semibold text-teal-dark hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-4 rounded-xl bg-white p-6 shadow-card sm:grid-cols-2"
        noValidate
      >
        <Field label="Registration number">
          <input
            value={form.regNo}
            onChange={(e) => updateField('regNo', e.target.value)}
            className="input"
            placeholder="2324CO123"
          />
        </Field>

        <Field label="Full name">
          <input
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="input"
            placeholder="Asha Patil"
          />
        </Field>

        <Field label="Course">
          <div className="flex gap-2">
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
            <button
              type="button"
              onClick={() => setShowCourseForm((v) => !v)}
              className="shrink-0 rounded-lg border border-ink/15 px-3 text-xs font-semibold text-ink hover:bg-ink/5"
            >
              + New
            </button>
          </div>
          {showCourseForm && (
            <div className="mt-2 flex gap-2">
              <input
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="Course name"
                className="input"
              />
              <button
                type="button"
                onClick={handleAddCourse}
                disabled={addingCourse}
                className="shrink-0 rounded-lg bg-navy px-3 text-xs font-semibold text-white hover:bg-navy-600 disabled:opacity-60"
              >
                {addingCourse ? 'Adding…' : 'Add'}
              </button>
            </div>
          )}
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

        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="input"
            placeholder="asha@example.com"
          />
        </Field>

        <Field label="Mobile (optional)">
          <input
            value={form.mobile}
            onChange={(e) => updateField('mobile', e.target.value)}
            className="input"
            placeholder="9876543210"
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
            {submitting ? 'Registering…' : 'Register student'}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/45">
          All students
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
        ) : students.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-ink/20 bg-white/60 px-6 py-14 text-center text-sm text-ink/40">
            No students registered yet.
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                  <th className="px-4 py-3">Reg No</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Sem</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{s.regNo}</td>
                    <td className="px-4 py-3">{s.name}</td>
                    <td className="px-4 py-3 text-ink/70">{s.courseName}</td>
                    <td className="px-4 py-3 text-ink/70">{s.semester}</td>
                    <td className="px-4 py-3 text-ink/70">{s.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleResetPassword(s)}
                          disabled={resettingId === s.id}
                          className="text-xs font-semibold text-navy hover:underline disabled:opacity-50"
                        >
                          {resettingId === s.id ? 'Resetting…' : 'Reset password'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(s)}
                          disabled={removingId === s.id}
                          className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                        >
                          {removingId === s.id ? 'Removing…' : 'Remove'}
                        </button>
                      </div>
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
