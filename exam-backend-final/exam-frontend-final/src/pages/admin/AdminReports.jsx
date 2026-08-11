import { useEffect, useState } from 'react';
import api from '../../api/axios';

const TABS = [
  { key: 'subjects', label: 'Subject-wise', endpoint: '/admin/reports/subjects' },
  { key: 'courses', label: 'Course-wise', endpoint: '/admin/reports/courses' },
  { key: 'students', label: 'Student-wise', endpoint: '/admin/reports/students' },
];

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('subjects');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const tab = TABS.find((t) => t.key === activeTab);

    setLoading(true);
    setError('');
    api
      .get(tab.endpoint)
      .then((res) => {
        if (!cancelled) setRows(res.data.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load this report.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  function downloadCsv() {
    const tab = TABS.find((t) => t.key === activeTab);
    const columns = COLUMNS[activeTab];
    const header = columns.map((c) => c.label).join(',');
    const lines = rows.map((row) =>
      columns.map((c) => csvCell(c.value(row))).join(',')
    );
    const csv = [header, ...lines].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tab.key}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const columns = COLUMNS[activeTab];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Reports</h1>
      <p className="mt-1 text-sm text-ink/60">
        Performance is aggregated over graded exam attempts (submitted or auto-submitted).
      </p>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? 'bg-navy text-white shadow-card'
                  : 'bg-white text-ink/60 hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={downloadCsv}
          disabled={loading || rows.length === 0}
          className="rounded-lg border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink/70 hover:text-ink disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      <div className="mt-4">
        {loading ? (
          <p className="mt-3 text-sm text-ink/50">Loading…</p>
        ) : error ? (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        ) : rows.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-ink/20 bg-white/60 px-6 py-14 text-center text-sm text-ink/40">
            No graded attempts yet — this report fills in once students start completing exams.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/45">
                  {columns.map((c) => (
                    <th key={c.label} className="px-4 py-3">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-ink/5 last:border-0">
                    {columns.map((c) => (
                      <td key={c.label} className="px-4 py-3 text-ink/70">
                        {c.value(row)}
                      </td>
                    ))}
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

function pct(value) {
  return value === null || value === undefined ? '—' : `${value}%`;
}

const COLUMNS = {
  subjects: [
    { label: 'Subject', value: (r) => `${r.subjectName} (${r.subjectCode})` },
    { label: 'Course', value: (r) => r.courseName },
    { label: 'Graded attempts', value: (r) => r.totalAttempts },
    { label: 'Avg. score', value: (r) => pct(r.averagePercentage) },
    { label: 'Pass rate', value: (r) => pct(r.passRatePercent) },
  ],
  courses: [
    { label: 'Course', value: (r) => r.courseName },
    { label: 'Graded attempts', value: (r) => r.totalAttempts },
    { label: 'Avg. score', value: (r) => pct(r.averagePercentage) },
    { label: 'Pass rate', value: (r) => pct(r.passRatePercent) },
  ],
  students: [
    { label: 'Student', value: (r) => r.name },
    { label: 'Reg. no.', value: (r) => r.regNo },
    { label: 'Course', value: (r) => r.courseName },
    { label: 'Exams attempted', value: (r) => r.examsAttempted },
    { label: 'Avg. score', value: (r) => pct(r.averagePercentage) },
    { label: 'Pass rate', value: (r) => pct(r.passRatePercent) },
  ],
};

function csvCell(value) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}
