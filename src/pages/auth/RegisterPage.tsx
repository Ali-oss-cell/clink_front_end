import { Layout } from '../../components/common/Layout/Layout';
import { Register } from '../../components/auth/Register/Register';
import { RegistrationSidebar } from '../../components/auth/Register/RegistrationSidebar';
import styles from './AuthPages.module.scss';

export const RegisterPage: React.FC = () => {
  return (
    <Layout className={styles.authLayout} showFooter={false}>
      <div className={styles.registrationContainer}>
        <div className={styles.registrationForm}>
          <Register />
        </div>
        <div className={styles.registrationSidebar}>
          <RegistrationSidebar />
        </div>
      </div>
    </Layout>
  );
};
