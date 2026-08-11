import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get('/student/profile')
      .then((res) => {
        setProfile(res.data.data);
        setEmail(res.data.data.email || '');
        setMobile(res.data.data.mobile || '');
      })
      .catch((err) => setLoadError(err.response?.data?.message || 'Could not load your profile.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaveError('');
    setSaved(false);

    if (!email) {
      setSaveError('Email is required.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/student/profile', { email, mobile });
      setProfile(res.data.data);
      setSaved(true);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-ink/50">Loading…</p>;
  }

  if (loadError) {
    return <p className="text-sm text-red-600">{loadError}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Profile</h1>
      <p className="mt-1 text-sm text-ink/60">
        Update your contact details or change your password.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-card">
          <p className="text-xs uppercase tracking-wide text-ink/45">Student details</p>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Name" value={profile.name} />
            <Row label="Registration no." value={profile.regNo} />
            <Row label="Course" value={profile.courseName} />
            <Row label="Semester" value={profile.semester} />
            <Row label="Username" value={profile.username} />
          </dl>
          <p className="mt-4 text-xs text-ink/40">
            These details are managed by your administrator — contact them if anything here is wrong.
          </p>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleSave} className="rounded-xl bg-white p-6 shadow-card">
            <p className="text-xs uppercase tracking-wide text-ink/45">Contact details</p>

            <div className="mt-4 space-y-4">
              <Field label="Email" type="email" value={email} onChange={setEmail} />
              <Field label="Mobile" type="tel" value={mobile} onChange={setMobile} />
            </div>

            {saveError && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {saveError}
              </p>
            )}
            {saved && <p className="mt-3 text-sm text-teal-dark">Saved.</p>}

            <button
              type="submit"
              disabled={saving}
              className="mt-4 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-navy-600 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>

          <div className="rounded-xl bg-white p-6 shadow-card">
            <p className="text-xs uppercase tracking-wide text-ink/45">Password</p>
            <p className="mt-2 text-sm text-ink/60">
              Change your password from the dedicated screen.
            </p>
            <Link
              to="/change-password"
              className="mt-4 inline-block rounded-lg border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink/70 hover:text-ink"
            >
              Change password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink/50">{label}</dt>
      <dd className="font-medium text-ink">{value ?? '—'}</dd>
    </div>
  );
}

function Field({ label, type, value, onChange }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-ink/80">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink focus:border-teal focus:ring-1 focus:ring-teal"
      />
    </label>
  );
}
