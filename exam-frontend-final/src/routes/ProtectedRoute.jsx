import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guards a route subtree.
 *
 * - Not logged in            -> redirect to /login, remembering where they were headed.
 * - Logged in, wrong role    -> redirect to /unauthorized.
 * - mustChangePassword       -> force through the password-reset step first,
 *                               unless the route itself is the reset page.
 * - Otherwise                -> render the nested routes.
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, role, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (user?.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}
