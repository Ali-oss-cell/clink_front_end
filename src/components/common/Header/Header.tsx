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
              <Link to="/about" className={styles.navLink}>About</Link>
              <Link to="/services" className={styles.navLink}>Services</Link>
              <Link to="/resources" className={styles.navLink}>Resources</Link>
              <Link to="/contact" className={styles.navLink}>Contact</Link>
              <Link to="/login" className={styles.loginButton}>Login</Link>
              <Link to="/register" className={styles.registerButton}>Book Appointment</Link>
            </div>
          ) : (
            // Authenticated navigation
            <div className={styles.authNav}>
              <span className={styles.welcomeText}>
                Welcome, {userName}
              </span>
              <div className={styles.userMenu}>
                <Link 
                  to={`/${userRole}/dashboard`} 
                  className={styles.navLink}
                >
                  Dashboard
                </Link>
                {userRole === 'patient' && (
                  <>
                    <Link to="/patient/appointments" className={styles.navLink}>
                      My Appointments
                    </Link>
                    <Link to="/patient/account" className={styles.navLink}>
                      My Account
                    </Link>
                  </>
                )}
                {userRole === 'psychologist' && (
                  <>
                    <Link to="/psychologist/schedule" className={styles.navLink}>
                      Schedule
                    </Link>
                    <Link to="/psychologist/profile" className={styles.navLink}>
                      Profile
                    </Link>
                    <Link to="/psychologist/patients" className={styles.navLink}>
                      Patients
                    </Link>
                  </>
                )}
                {userRole === 'practice_manager' && (
                  <>
                    <Link to="/manager/users" className={styles.navLink}>
                      User Management
                    </Link>
                    <Link to="/manager/billing" className={styles.navLink}>
                      Billing
                    </Link>
                  </>
                )}
                {userRole === 'admin' && (
                  <>
                    <Link to="/admin/users" className={styles.navLink}>
                      Users
                    </Link>
                    <Link to="/admin/appointments" className={styles.navLink}>
                      Appointments
                    </Link>
                    <Link to="/admin/patients" className={styles.navLink}>
                      Patients
                    </Link>
                    <Link to="/admin/staff" className={styles.navLink}>
                      Staff
                    </Link>
                    <Link to="/admin/billing" className={styles.navLink}>
                      Billing
                    </Link>
                    <Link to="/admin/settings" className={styles.navLink}>
                      Settings
                    </Link>
                    <Link to="/admin/analytics" className={styles.navLink}>
                      Analytics
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
