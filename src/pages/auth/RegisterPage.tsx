import { Layout } from '../../components/common/Layout/Layout';
import { Register } from '../../components/auth/Register/Register';
import registerImage from '../../assets/imges/optimized/auth-wellness.webp';
import styles from './AuthPages.module.scss';

interface RegisterPageProps {
  onRegisterSuccess?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
  return (
    <Layout className={styles.authLayout} showFooter={false} overlayPublicHeader>
      <div className={styles.registerPageContainer}>
        <div className={styles.registerImageSection} style={{ backgroundImage: `url(${registerImage})` }}>
          <div className={styles.imageOverlay}>
            <div className={styles.imageContent}>
              <h2 className={styles.imageTitle}>Join Tailored Psychology</h2>
              <p className={styles.imageSubtitle}>
                Start your journey to better mental health. Register today and connect with our professional psychologists.
              </p>
            </div>
          </div>
        </div>
        <div className={styles.registerFormSection}>
          <div className={styles.registrationForm}>
            <Register onRegisterSuccess={onRegisterSuccess} />
          </div>
        </div>
      </div>
    </Layout>
  );
};
