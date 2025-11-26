import { useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { Login } from '../../components/auth/Login/Login';
import { authService } from '../../services/api/auth';
import loginImage from '../../assets/imges/ben-kolde-6lzIdGOoqfg-unsplash.jpg';
import styles from './AuthPages.module.scss';

interface LoginPageProps {
  onAuthUpdate?: () => boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthUpdate }) => {
  // Clear any stale auth data when accessing login page
  useEffect(() => {
    // Check if there's stale/invalid auth data
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    // If we have tokens but user is trying to access login, clear stale data
    // This handles the case where localStorage has old/invalid tokens
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        // If user data is invalid or missing required fields, clear it
        if (!parsedUser || !parsedUser.role || !parsedUser.email) {
          console.log('Clearing invalid auth data');
          authService.logout();
        }
      } catch (error) {
        // If user data can't be parsed, clear it
        console.log('Clearing corrupted auth data');
        authService.logout();
      }
    }
  }, []);

  return (
    <Layout className={styles.authLayout} showFooter={false}>
      <div className={styles.loginPageContainer}>
        <div className={styles.loginImageSection} style={{ backgroundImage: `url(${loginImage})` }}>
          <div className={styles.imageOverlay}>
            <div className={styles.imageContent}>
              <h2 className={styles.imageTitle}>Welcome to Tailored Psychology</h2>
              <p className={styles.imageSubtitle}>
                Professional psychology services for your mental health and wellbeing
              </p>
            </div>
          </div>
        </div>
        <div className={styles.loginFormSection}>
          <div className={styles.authContainer}>
            <Login onLoginSuccess={onAuthUpdate} />
          </div>
        </div>
      </div>
    </Layout>
  );
};
