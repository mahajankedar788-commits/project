import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

const AuthContext = createContext(null);

const TOKEN_KEY = 'exam_portal_token';
const USER_KEY = 'exam_portal_user';

function readStoredSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  if (!token || !rawUser) return { token: null, user: null };

  try {
    const decoded = jwtDecode(token);
    // Treat an expired token as no session at all.
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return { token: null, user: null };
    }
    return { token, user: JSON.parse(rawUser) };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Keep multiple tabs in sync on login/logout.
    function onStorage(e) {
      if (e.key === TOKEN_KEY) {
        setSession(readStoredSession());
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  async function login(username, password) {
    setLoading(true);
    setError(null);
    try {
      // Expected response shape:
      // { token, role: 'ADMIN' | 'STUDENT', username, mustChangePassword }
      const { data } = await api.post('/auth/login', { username, password });

      const user = {
        username: data.username,
        role: data.role,
        mustChangePassword: !!data.mustChangePassword,
      };

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setSession({ token: data.token, user });

      return user;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Invalid username or password. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setSession({ token: null, user: null });
  }

  const value = useMemo(
    () => ({
      token: session.token,
      user: session.user,
      isAuthenticated: !!session.token,
      role: session.user?.role || null,
      loading,
      error,
      login,
      logout,
    }),
    [session, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
