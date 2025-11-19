import { Layout } from '../../components/common/Layout/Layout';
import { Register } from '../../components/auth/Register/Register';
import registerImage from '../../assets/imges/ben-kolde-6lzIdGOoqfg-unsplash.jpg';
import styles from './AuthPages.module.scss';

export const RegisterPage: React.FC = () => {
  return (
    <Layout className={styles.authLayout} showFooter={false}>
      <div className={styles.registerPageContainer}>
        <div className={styles.registerImageSection} style={{ backgroundImage: `url(${registerImage})` }}>
          <div className={styles.imageOverlay}>
            <div className={styles.imageContent}>
              <h2 className={styles.imageTitle}>Join MindWell Clinic</h2>
              <p className={styles.imageSubtitle}>
                Start your journey to better mental health. Register today and connect with our professional psychologists.
              </p>
            </div>
          </div>
        </div>
        <div className={styles.registerFormSection}>
          <div className={styles.registrationForm}>
            <Register />
          </div>
        </div>
      </div>
    </Layout>
  );
};
