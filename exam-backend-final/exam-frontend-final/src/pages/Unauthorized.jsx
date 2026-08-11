import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const { role, logout } = useAuth();
  const home = role === 'ADMIN' ? '/admin' : role === 'STUDENT' ? '/student' : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-teal-dark uppercase">
          403
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-ink">
          This area isn't part of your account
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          You're signed in{role ? ` as a ${role.toLowerCase()}` : ''}, and this
          page belongs to a different role. Head back to your dashboard, or
          sign out to switch accounts.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to={home}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-600"
          >
            Go to my dashboard
          </Link>
          <button
            onClick={logout}
            className="rounded-lg border border-ink/15 px-4 py-2 text-sm font-semibold text-ink hover:bg-ink/5"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
