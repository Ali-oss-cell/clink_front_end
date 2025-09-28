import { Layout } from '../../components/common/Layout/Layout';
import { Login } from '../../components/auth/Login/Login';
import styles from './AuthPages.module.scss';

interface LoginPageProps {
  onAuthUpdate?: () => boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthUpdate }) => {
  return (
    <Layout className={styles.authLayout} showFooter={false}>
      <div className={styles.authContainer}>
        <Login onLoginSuccess={onAuthUpdate} />
      </div>
    </Layout>
  );
};
