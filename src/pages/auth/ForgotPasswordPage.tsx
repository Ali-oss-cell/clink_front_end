import { Layout } from '../../components/common/Layout/Layout';
import { ForgotPassword } from '../../components/auth/ForgotPassword/ForgotPassword';
import loginImage from '../../assets/imges/optimized/login-therapy.webp';
import styles from './AuthPages.module.scss';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <Layout className={styles.authLayout} showFooter={false} overlayPublicHeader>
      <div className={styles.loginPageContainer}>
        <div
          className={styles.loginImageSection}
          style={{ backgroundImage: `url(${loginImage})` }}
        >
          <div className={styles.imageOverlay}>
            <div className={styles.imageContent}>
              <h2 className={styles.imageTitle}>Forgot your password?</h2>
              <p className={styles.imageSubtitle}>
                We will email you a secure link to set a new password.
              </p>
            </div>
          </div>
        </div>
        <div className={styles.loginFormSection}>
          <div className={styles.authContainer}>
            <ForgotPassword />
          </div>
        </div>
      </div>
    </Layout>
  );
};
