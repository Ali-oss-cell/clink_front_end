import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../services/api/auth';
import styles from './Header.module.scss';

interface HeaderProps {
  isAuthenticated?: boolean;
  userRole?: 'patient' | 'psychologist' | 'practice_manager' | 'admin';
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isAuthenticated = false,
  userRole,
  userName
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      // Redirect to homepage after logout
      navigate('/');
      // Reload the page to reset the app state
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect even if logout API fails
      navigate('/');
      window.location.reload();
    }
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
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/" className={styles.logoLink}>
            <span className={styles.logoText}>MindWell Clinic</span>
          </Link>
        </div>

        <nav className={styles.navigation}>
          {!isAuthenticated ? (
            // Public navigation
            <div className={styles.publicNav}>
              <Link to="/about">About</Link>
              <Link to="/services">Services</Link>
              <Link to="/resources">Resources</Link>
              <Link to="/contact">Contact</Link>
              <Link 
                to="/login" 
                className={styles.loginButton}
                onClick={handleLoginClick}
              >
                Login
              </Link>
              <Link to="/register" className={styles.registerButton}>Book Appointment</Link>
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
                      My Appointments
                    </Link>
                    <Link to="/patient/resources">
                      Resources
                    </Link>
                    <Link to="/patient/account">
                      My Account
                    </Link>
                  </>
                )}
                {userRole === 'psychologist' && (
                  <>
                    <Link to="/psychologist/schedule">
                      Schedule
                    </Link>
                    <Link to="/psychologist/profile">
                      Profile
                    </Link>
                    <Link to="/psychologist/patients">
                      Patients
                    </Link>
                    <Link to="/manager/resources">
                      Resources
                    </Link>
                  </>
                )}
                {userRole === 'practice_manager' && (
                  <>
                    <Link to="/manager/dashboard">
                      Dashboard
                    </Link>
                    <Link to="/manager/staff">
                      Staff
                    </Link>
                    <Link to="/manager/patients">
                      Patients
                    </Link>
                    <Link to="/manager/appointments">
                      Appointments
                    </Link>
                    <Link to="/manager/billing">
                      Billing
                    </Link>
                    <Link to="/manager/resources">
                      Resources
                    </Link>
                  </>
                )}
                {userRole === 'admin' && (
                  <>
                    <Link to="/admin/users">
                      Users
                    </Link>
                    <Link to="/admin/appointments">
                      Appointments
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
                      Audit Logs
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
