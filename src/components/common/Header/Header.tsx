import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../services/api/auth';
import styles from './Header.module.scss';

interface HeaderProps {
  isAuthenticated?: boolean;
  userRole?: 'patient' | 'psychologist' | 'practice_manager' | 'admin';
  userName?: string;
  /**
   * Legacy compatibility flag. Header uses overlay shell globally; class toggle is retained for safety.
   */
  heroOverlay?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isAuthenticated = false,
  userRole,
  userName,
  heroOverlay = false,
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // authService.logout clears storage and dispatches a global `auth:logout` event.
    // The app listens to that event to clear UI auth state immediately.
    await authService.logout();
    navigate('/');
  };

  const handleLoginClick = () => {
    // Clear any stale/invalid auth data when clicking login
    // This ensures the login page is accessible even if localStorage has old tokens
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        // If user data is invalid, clear it
        if (!parsedUser || !parsedUser.role || !parsedUser.email) {
          console.log('Clearing invalid auth data on login click');
          authService.logout();
        }
      } catch (error) {
        // If user data can't be parsed, clear it
        console.log('Clearing corrupted auth data on login click');
        authService.logout();
      }
    }
  };

  return (
    <header
      className={`${styles.header}${heroOverlay ? ` ${styles.headerHeroOverlay}` : ''}`}
    >
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/" className={styles.logoLink} aria-label="Tailored Psychology - Home">
            <img src="/logo-icon.png" alt="Tailored Psychology" className={styles.logoImage} />
          </Link>
        </div>

        <nav className={styles.navigation}>
          {!isAuthenticated ? (
            // Public navigation
            <div className={styles.publicNav}>
              <Link to="/about">About</Link>
              <Link to="/get-matched">Find your match</Link>
              <Link to="/services">Services</Link>
              <Link to="/resources">Resource library</Link>
              <Link to="/contact">Contact</Link>
              <Link 
                to="/login" 
                className={styles.loginButton}
                onClick={handleLoginClick}
              >
                Sign in
              </Link>
              <Link to="/register" className={styles.registerButton}>Start booking</Link>
            </div>
          ) : (
            // Authenticated navigation
            <div className={styles.authNav}>
              <span className={styles.welcomeText}>
                Welcome, {userName}
              </span>
              <div className={styles.userMenu}>
                <Link to={`/${userRole}/dashboard`}>
                  Dashboard
                </Link>
                {userRole === 'patient' && (
                  <>
                    <Link to="/patient/appointments">
                      Care schedule
                    </Link>
                    <Link to="/recordings">
                      Recordings
                    </Link>
                    <Link to="/patient/resources">
                      Resources
                    </Link>
                    <Link to="/patient/account">
                      Account
                    </Link>
                  </>
                )}
                {userRole === 'psychologist' && (
                  <>
                    <Link to="/psychologist/schedule">
                      Care schedule
                    </Link>
                    <Link to="/psychologist/profile">
                      Profile
                    </Link>
                    <Link to="/psychologist/patients">
                      Client roster
                    </Link>
                    <Link to="/recordings">
                      Recordings
                    </Link>
                    <Link to="/manager/resources">
                      Resource library
                    </Link>
                  </>
                )}
                {userRole === 'practice_manager' && (
                  <>
                    <Link to="/manager/dashboard">
                      Dashboard
                    </Link>
                    <Link to="/manager/staff">
                      Team
                    </Link>
                    <Link to="/manager/patients">
                      Patients
                    </Link>
                    <Link to="/manager/appointments">
                      Care schedule
                    </Link>
                    <Link to="/recordings">
                      Recordings
                    </Link>
                    <Link to="/manager/billing">
                      Billing
                    </Link>
                    <Link to="/manager/resources">
                      Resource library
                    </Link>
                  </>
                )}
                {userRole === 'admin' && (
                  <>
                    <Link to="/admin/users">
                      People
                    </Link>
                    <Link to="/admin/appointments">
                      Care schedule
                    </Link>
                    <Link to="/recordings">
                      Recordings
                    </Link>
                    <Link to="/admin/patients">
                      Patients
                    </Link>
                    <Link to="/admin/staff">
                      Staff
                    </Link>
                    <Link to="/admin/billing">
                      Billing
                    </Link>
                    <Link to="/admin/data-deletion">
                      Data Deletion
                    </Link>
                    <Link to="/admin/analytics">
                      Analytics
                    </Link>
                    <Link to="/admin/resources">
                      Resources
                    </Link>
                    <Link to="/admin/audit-logs">
                      Audit trail
                    </Link>
                    <Link to="/admin/settings">
                      Settings
                    </Link>
                  </>
                )}
                <button 
                  onClick={handleLogout}
                  className={styles.logoutButton}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
