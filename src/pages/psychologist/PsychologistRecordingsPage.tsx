import { Layout } from '../../components/common/Layout/Layout';
import { RecordingsListPanel } from '../../components/recordings/RecordingsListPanel';
import { authService } from '../../services/api/auth';
import styles from './PsychologistPages.module.scss';
import shell from '../patient/PatientShellChrome.module.scss';

export const PsychologistRecordingsPage: React.FC = () => {
  const user = authService.getStoredUser();

  return (
    <Layout user={user} isAuthenticated className={styles.psychologistLayout}>
      <div className={styles.notesContainer}>
        <div className={shell.wrap}>
          <header className={shell.pageHeader}>
            <h1 className={shell.welcomeTitle}>Video session recordings</h1>
            <p className={shell.welcomeSubtitle}>
              Telehealth recordings for your caseload. Stream securely through the clinic proxy or download when
              processing is complete.
            </p>
          </header>
          <RecordingsListPanel
            layout="compact"
            emptyMessage="No recordings are linked to your appointments yet. After a consented telehealth session completes, the recording will appear here."
            className={styles.psychologistRecordingsEmbed}
          />
        </div>
      </div>
    </Layout>
  );
};
