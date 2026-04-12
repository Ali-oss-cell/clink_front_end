import { Layout } from '../components/common/Layout/Layout';
import { RecordingsListPanel } from '../components/recordings/RecordingsListPanel';
import { authService } from '../services/api/auth';

export const RecordingsPage: React.FC = () => {
  const user = authService.getStoredUser();

  return (
    <Layout user={user} isAuthenticated={true} patientShell={user?.role === 'patient'}>
      <RecordingsListPanel layout="full" />
    </Layout>
  );
};

