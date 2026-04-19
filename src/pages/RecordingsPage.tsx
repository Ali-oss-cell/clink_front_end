import { Layout } from '../components/common/Layout/Layout';
import { RecordingsListPanel } from '../components/recordings/RecordingsListPanel';
import { PatientShellPage } from '../components/patient/PatientShellPage/PatientShellPage';
import { authService } from '../services/api/auth';

export const RecordingsPage: React.FC = () => {
  const user = authService.getStoredUser();
  const isPatient = user?.role === 'patient';

  return (
    <Layout user={user} isAuthenticated={true} patientShell={isPatient}>
      {isPatient ? (
        <PatientShellPage>
          <RecordingsListPanel layout="full" />
        </PatientShellPage>
      ) : (
        <RecordingsListPanel layout="full" />
      )}
    </Layout>
  );
};

