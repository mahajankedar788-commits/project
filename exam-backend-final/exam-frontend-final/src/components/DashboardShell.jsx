import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Generic authenticated shell: navy sidebar + top bar + <Outlet /> content area.
 * `navItems` shape: [{ to, label }]
 */
export default function DashboardShell({ navItems, badge }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-parchment lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:flex flex-col justify-between bg-ink text-parchment px-6 py-8">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] text-teal-light uppercase">
            Exam Portal
          </p>
          <p className="mt-1 text-xs text-parchment/50">{badge}</p>

          <nav className="mt-10 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-teal/15 text-teal-light'
                      : 'text-parchment/70 hover:bg-white/5 hover:text-parchment'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/10 pt-4">
          <p className="text-sm font-medium">{user?.username}</p>
          <p className="text-xs text-parchment/50">{user?.role}</p>
          <button
            onClick={logout}
            className="mt-3 text-xs font-semibold text-teal-light hover:underline"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-ink px-4 py-3 text-parchment lg:hidden">
        <p className="font-mono text-xs tracking-[0.3em] text-teal-light uppercase">
          Exam Portal
        </p>
        <button onClick={logout} className="text-xs font-semibold text-teal-light">
          Sign out
        </button>
      </div>

      <main className="px-6 py-8 lg:px-10 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
