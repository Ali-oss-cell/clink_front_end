import { Navigate, useLocation } from 'react-router-dom';
import type { User } from '../../../types/simple-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
  requireAuth?: boolean;
  isAuthenticated?: boolean;
  user?: User | null;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
  isAuthenticated = false,
  user = null,
}) => {
  const location = useLocation();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required and user doesn't have the right role
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirect based on user role to their appropriate dashboard
    switch (user.role) {
      case 'patient':
        return <Navigate to="/patient/dashboard" replace />;
      case 'psychologist':
        return <Navigate to="/psychologist/dashboard" replace />;
      case 'practice_manager':
        return <Navigate to="/manager/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // If user is authenticated but trying to access auth pages, redirect to dashboard
  if (isAuthenticated && user && (location.pathname === '/login' || location.pathname === '/register')) {
    switch (user.role) {
      case 'patient':
        return <Navigate to="/patient/dashboard" replace />;
      case 'psychologist':
        return <Navigate to="/psychologist/dashboard" replace />;
      case 'practice_manager':
        return <Navigate to="/manager/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
