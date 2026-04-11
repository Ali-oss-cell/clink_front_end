import { Layout } from '../../components/common/Layout/Layout';
import { ResetPassword } from '../../components/auth/ResetPassword/ResetPassword';
import loginImage from '../../assets/imges/optimized/login-therapy.webp';
import styles from './AuthPages.module.scss';

export const ResetPasswordPage: React.FC = () => {
  return (
    <Layout className={styles.authLayout} showFooter={false} overlayPublicHeader>
      <div className={styles.loginPageContainer}>
        <div
          className={styles.loginImageSection}
          style={{ backgroundImage: `url(${loginImage})` }}
        >
          <div className={styles.imageOverlay}>
            <div className={styles.imageContent}>
              <h2 className={styles.imageTitle}>Set a new password</h2>
              <p className={styles.imageSubtitle}>
                Choose a password only you know. You will use it to sign in from now on.
              </p>
            </div>
          </div>
        </div>
        <div className={styles.loginFormSection}>
          <div className={styles.authContainer}>
            <ResetPassword />
          </div>
        </div>
      </div>
    </Layout>
  );
};
