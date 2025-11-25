import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { User } from '../../../types/simple-auth';
import { getPrivacyPolicyStatus, type PrivacyPolicyStatus } from '../../../services/api/privacy';
import { PrivacyPolicyModal } from '../PrivacyPolicyModal/PrivacyPolicyModal';

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
  const [privacyStatus, setPrivacyStatus] = useState<PrivacyPolicyStatus | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);

  // Check Privacy Policy status only for patients (not psychologists/admins)
  useEffect(() => {
    const checkPrivacyPolicy = async () => {
      if (requireAuth && isAuthenticated && user && user.role === 'patient') {
        try {
          const status = await getPrivacyPolicyStatus();
          setPrivacyStatus(status);
          
          // Check if Privacy Policy needs to be accepted
          if (!status.accepted || status.needs_update) {
            setShowPrivacyModal(true);
          } else {
            setPrivacyChecked(true);
          }
        } catch (error: any) {
          // If check fails (e.g., 403 for non-patients), skip it
          if (error.response?.status === 403) {
            console.warn('Privacy Policy check skipped (not a patient)');
          } else {
            console.warn('Privacy Policy check failed:', error);
          }
          setPrivacyChecked(true);
        }
      } else {
        // Not a patient or not authenticated - skip privacy check
        setPrivacyChecked(true);
      }
    };

    checkPrivacyPolicy();
  }, [requireAuth, isAuthenticated, user]);

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show Privacy Policy modal if needed
  if (showPrivacyModal && privacyStatus) {
    return (
      <>
        <PrivacyPolicyModal
          isOpen={showPrivacyModal}
          onClose={() => {
            // If user closes without accepting, redirect to login
            setShowPrivacyModal(false);
            // Don't redirect, just close - user can still access but will be prompted again
          }}
          onAccept={() => {
            setShowPrivacyModal(false);
            setPrivacyChecked(true);
            // Reload privacy status
            getPrivacyPolicyStatus().then(setPrivacyStatus).catch(console.error);
          }}
          required={true}
        />
        {/* Show loading state while checking */}
        {!privacyChecked && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            fontSize: '18px',
            color: '#2c5aa0'
          }}>
            Loading...
          </div>
        )}
      </>
    );
  }

  // Wait for privacy check to complete
  if (requireAuth && isAuthenticated && !privacyChecked) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#2c5aa0'
      }}>
        Loading...
      </div>
    );
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
  // Only redirect if we have both authentication flag AND valid user data
  if (isAuthenticated && user && user.role && (location.pathname === '/login' || location.pathname === '/register')) {
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

  return <>{children}</>;
};
