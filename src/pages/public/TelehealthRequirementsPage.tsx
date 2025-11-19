import { Layout } from '../../components/common/Layout/Layout';
import styles from './TelehealthRequirementsPage.module.scss';

export const TelehealthRequirementsPage: React.FC = () => {
  return (
    <Layout>
      <section className={styles.requirementsPage}>
        <div className="container">
          <header className={styles.pageHeader}>
            <p className={styles.eyebrow}>Telehealth</p>
            <h1>Technical Requirements & Emergency Procedures</h1>
            <p className={styles.subtitle}>
              Please review the checklist below before joining your secure video appointment. This ensures continuity of
              care and keeps you safe should an emergency arise during the session.
            </p>
          </header>

          <div className={styles.section}>
            <h2>Technical Requirements</h2>
            <ul>
              <li>Stable internet connection (minimum 5 Mbps up/down)</li>
              <li>Device with camera and microphone (desktop, laptop, or tablet preferred)</li>
              <li>Private, quiet space free from interruptions</li>
              <li>Headphones recommended for confidentiality</li>
              <li>Backup power or fully charged battery</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>Before Each Session</h2>
            <ol>
              <li>Test your camera and microphone.</li>
              <li>Close unnecessary applications to preserve bandwidth.</li>
              <li>Ensure good lighting so your clinician can see you clearly.</li>
              <li>Keep your phone nearby (set to silent) for emergencies or reconnection.</li>
            </ol>
          </div>

          <div className={styles.section}>
            <h2>Emergency Plan</h2>
            <ul>
              <li>Provide a current emergency contact and physical location before the session.</li>
              <li>If connection drops, your clinician will attempt to reconnect for up to 10 minutes.</li>
              <li>If we cannot reach you, we will contact you by phone.</li>
              <li>If there’s concern for safety, we may contact your emergency contact or emergency services.</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>Recording</h2>
            <p>
              Sessions are <strong>not recorded</strong> unless you explicitly consent. You can withdraw recording
              consent at any time. If recording is enabled, you will receive a prompt before each session.
            </p>
          </div>

          <div className={styles.section}>
            <h2>Consent</h2>
            <p>
              Telehealth consent includes acknowledging the technical requirements, emergency procedures, and optional
              recording consent. You can update your telehealth preferences in the patient portal under{' '}
              <strong>Settings → Telehealth Consent</strong>.
            </p>
          </div>

          <footer className={styles.footer}>
            <p>Last updated: 19 November 2025</p>
          </footer>
        </div>
      </section>
    </Layout>
  );
};

