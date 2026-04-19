import { useState, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { User } from '../../../types/simple-auth';
import { getPrivacyPolicyStatus, type PrivacyPolicyStatus } from '../../../services/api/privacy';
import { PrivacyPolicyModal } from '../PrivacyPolicyModal/PrivacyPolicyModal';
import { getDashboardPathForRole } from '../../../utils/authRedirects';

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
  /** Once the patient taps Accept on the modal, ignore stale re-fetches that reopen it. */
  const privacyAcceptedRef = useRef(false);

  useEffect(() => {
    if (!user?.id) {
      privacyAcceptedRef.current = false;
    }
  }, [user?.id]);

  // Check Privacy Policy status only for patients (not psychologists/admins).
  // Depend on stable ids, not `user` object identity — otherwise any parent re-fetch
  // (new object reference) re-runs this effect, re-fetches status, and can reopen
  // the modal after the patient just accepted (looks "stuck").
  useEffect(() => {
    const checkPrivacyPolicy = async () => {
      if (requireAuth && isAuthenticated && user && user.role === 'patient') {
        try {
          const status = await getPrivacyPolicyStatus();
          setPrivacyStatus(status);

          if (status.accepted && !status.needs_update) {
            setShowPrivacyModal(false);
            setPrivacyChecked(true);
          } else if (privacyAcceptedRef.current) {
            setShowPrivacyModal(false);
            setPrivacyChecked(true);
          } else {
            setShowPrivacyModal(true);
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
  }, [requireAuth, isAuthenticated, user?.id, user?.role]);

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
            privacyAcceptedRef.current = true;
            setShowPrivacyModal(false);
            setPrivacyChecked(true);
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
            color: '#8f9f88'
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
        color: '#8f9f88'
      }}>
        Loading...
      </div>
    );
  }

  // If specific roles are required and user doesn't have the right role
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace />;
  }

  // If user is authenticated but trying to access auth pages, redirect to dashboard
  // Only redirect if we have both authentication flag AND valid user data
  // Keep /reset-password reachable when logged in (user may have opened the email link in same browser).
  if (
    isAuthenticated &&
    user &&
    user.role &&
    (location.pathname === '/login' ||
      location.pathname === '/register' ||
      location.pathname === '/forgot-password')
  ) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace />;
  }

  return <>{children}</>;
};
