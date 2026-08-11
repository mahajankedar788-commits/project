import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_HOME = {
  ADMIN: '/admin',
  STUDENT: '/student',
};

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const params = new URLSearchParams(location.search);
  const sessionExpired = params.get('expired') === '1';

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!username.trim() || !password) {
      setFormError('Enter both your username and password.');
      return;
    }

    try {
      const user = await login(username.trim(), password);
      const redirectTo = location.state?.from?.pathname || ROLE_HOME[user.role] || '/';
      navigate(redirectTo, { replace: true });
    } catch {
      // error message is already surfaced via auth context's `error`
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-parchment">
      {/* Left: brand panel with an OMR answer-sheet motif */}
      <div className="relative hidden lg:flex flex-col justify-between bg-ink overflow-hidden px-14 py-12 text-parchment">
        <OmrPattern />
        <div className="relative z-10">
          <p className="font-mono text-xs tracking-[0.3em] text-teal-light uppercase">
            Exam Portal
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight max-w-sm">
            Every answer, accounted for.
          </h1>
          <p className="mt-4 max-w-sm text-sm text-parchment/70">
            Sign in to schedule exams, manage your question bank, or sit for
            your next assessment.
          </p>
        </div>
        <p className="relative z-10 text-xs text-parchment/50">
          © {new Date().getFullYear()} SS IT Solutions — Online Examination System
        </p>
      </div>

      {/* Right: login form */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <p className="font-mono text-xs tracking-[0.3em] text-teal-dark uppercase">
              Exam Portal
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-ink">Sign in</h2>
          <p className="mt-1 text-sm text-ink/60">
            Use the credentials issued to you by your institute.
          </p>

          {sessionExpired && (
            <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Your session ended. Sign in again to continue.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-ink/80"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Registration number or admin ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-teal focus:ring-1 focus:ring-teal"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ink/80"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-teal focus:ring-1 focus:ring-teal"
              />
            </div>

            {(formError || error) && (
              <p className="text-sm text-red-600" role="alert">
                {formError || error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-xs text-ink/45">
            First time signing in? Your username is your registration number
            and your password was provided by your administrator. You'll be
            asked to set a new password after login.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Faint rows of OMR-style answer bubbles used as ambient texture on the brand panel. */
function OmrPattern() {
  const rows = 10;
  const cols = 4;
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
      viewBox="0 0 400 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <circle
            key={`${r}-${c}`}
            cx={40 + c * 90}
            cy={40 + r * 58}
            r={10}
            fill="none"
            stroke="#5EEAD4"
            strokeWidth="2"
          />
        ))
      )}
    </svg>
  );
}
