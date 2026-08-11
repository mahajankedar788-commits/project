import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ROLE_HOME = { ADMIN: '/admin', STUDENT: '/student' };

export default function ChangePassword() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (next.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (next !== confirm) {
      setError('New password and confirmation do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: current,
        newPassword: next,
      });
      // Force a fresh login with the new password rather than silently
      // patching local state — keeps the client/server in sync.
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update your password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment px-6">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-card">
        <p className="font-mono text-xs tracking-[0.3em] text-teal-dark uppercase">
          Required step
        </p>
        <h1 className="mt-3 text-xl font-semibold text-ink">
          Set a new password
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          {user?.username}, this is a one-time step before you can continue.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <Field
            label="Temporary password"
            type="password"
            value={current}
            onChange={setCurrent}
            autoComplete="current-password"
          />
          <Field
            label="New password"
            type="password"
            value={next}
            onChange={setNext}
            autoComplete="new-password"
          />
          <Field
            label="Confirm new password"
            type="password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
          />

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-navy-600 disabled:opacity-60"
          >
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, autoComplete }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink/80">{label}</label>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink focus:border-teal focus:ring-1 focus:ring-teal"
      />
    </div>
  );
}
