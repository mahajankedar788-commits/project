import { useEffect, useState } from 'react';
import api from '../../api/axios';

const emptyForm = {
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 'A',
  marks: '',
};

export default function AdminQuestions() {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');

  const [questions, setQuestions] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    api.get('/admin/subjects').then((res) => setSubjects(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!subjectId) {
      setQuestions([]);
      return;
    }
    loadQuestions(subjectId);
  }, [subjectId]);

  async function loadQuestions(id) {
    setLoadingList(true);
    setListError('');
    try {
      const res = await api.get('/admin/questions', { params: { subjectId: id } });
      setQuestions(res.data.data);
    } catch (err) {
      setListError(err.response?.data?.message || 'Could not load questions.');
    } finally {
      setLoadingList(false);
    }
  }

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!subjectId) {
      setFormError('Pick a subject first.');
      return;
    }
    const { questionText, optionA, optionB, optionC, optionD, marks } = form;
    if (!questionText || !optionA || !optionB || !optionC || !optionD || !marks) {
      setFormError('Fill in the question, all four options, and marks.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/admin/questions', {
        ...form,
        subjectId: Number(subjectId),
        marks: Number(marks),
      });
      setForm(emptyForm);
      loadQuestions(subjectId);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not add this question.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(questionId) {
    try {
      await api.delete(`/admin/questions/${questionId}`);
      setQuestions((qs) => qs.filter((q) => q.id !== questionId));
    } catch (err) {
      setListError(err.response?.data?.message || 'Could not delete this question.');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Question bank</h1>
      <p className="mt-1 text-sm text-ink/60">
        Add MCQ questions per subject — exams randomly draw from this pool.
      </p>

      <div className="mt-6 max-w-sm">
        <label className="block text-sm">
          <span className="font-medium text-ink/80">Subject</span>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="input mt-1.5"
          >
            <option value="">Select a subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subjectName} ({s.subjectCode})
              </option>
            ))}
          </select>
        </label>
      </div>

      {!subjectId ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white/60 px-6 py-14 text-center text-sm text-ink/40">
          Pick a subject above to manage its question bank.
        </div>
      ) : (
        <>
          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-4 rounded-xl bg-white p-6 shadow-card"
            noValidate
          >
            <label className="block text-sm">
              <span className="font-medium text-ink/80">Question</span>
              <textarea
                value={form.questionText}
                onChange={(e) => updateField('questionText', e.target.value)}
                className="input mt-1.5"
                rows={2}
                placeholder="What does JVM stand for?"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              {['A', 'B', 'C', 'D'].map((key) => (
                <label key={key} className="block text-sm">
                  <span className="font-medium text-ink/80">Option {key}</span>
                  <input
                    value={form[`option${key}`]}
                    onChange={(e) => updateField(`option${key}`, e.target.value)}
                    className="input mt-1.5"
                  />
                </label>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 sm:max-w-sm">
              <label className="block text-sm">
                <span className="font-medium text-ink/80">Correct option</span>
                <select
                  value={form.correctOption}
                  onChange={(e) => updateField('correctOption', e.target.value)}
                  className="input mt-1.5"
                >
                  {['A', 'B', 'C', 'D'].map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-ink/80">Marks</span>
                <input
                  type="number"
                  min="1"
                  value={form.marks}
                  onChange={(e) => updateField('marks', e.target.value)}
                  className="input mt-1.5"
                  placeholder="2"
                />
              </label>
            </div>

            {formError && (
              <p className="text-sm text-red-600" role="alert">
                {formError}
              </p>
            )}

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-navy-600 disabled:opacity-60"
              >
                {submitting ? 'Adding…' : 'Add question'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/45">
              Questions in this subject ({questions.length})
            </h2>

            {loadingList ? (
              <p className="mt-3 text-sm text-ink/50">Loading…</p>
            ) : listError ? (
              <p className="mt-3 text-sm text-red-600">{listError}</p>
            ) : questions.length === 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-ink/20 bg-white/60 px-6 py-14 text-center text-sm text-ink/40">
                No questions yet for this subject.
              </div>
            ) : (
              <ul className="mt-3 space-y-3">
                {questions.map((q) => (
                  <li key={q.id} className="rounded-xl bg-white p-5 shadow-card">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-medium text-ink">{q.questionText}</p>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                      {['A', 'B', 'C', 'D'].map((key) => (
                        <div
                          key={key}
                          className={`rounded-lg px-3 py-2 ${
                            q.correctOption === key
                              ? 'bg-teal/15 text-teal-dark font-medium'
                              : 'bg-ink/5 text-ink/70'
                          }`}
                        >
                          {key}. {q[`option${key}`]}
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-ink/45">{q.marks} mark(s)</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
