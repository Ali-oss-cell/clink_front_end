import { Layout } from '../../components/common/Layout/Layout';
import styles from './PsychologistPages.module.scss';

export const PsychologistDashboardPage: React.FC = () => {
  // TODO: Get user data from Redux store
  const mockUser = {
    id: 1,
    first_name: 'Dr. Sarah',
    full_name: 'Dr. Sarah Johnson',
    role: 'psychologist' as const,
    email: 'sarah@mindwellclinic.com.au',
    last_name: 'Johnson',
    username: 'dr.sarah.johnson',
    phone_number: '+61 3 1234 5678',
    date_of_birth: '1985-03-15',
    age: 39,
    is_verified: true,
    created_at: '2024-01-01'
  };


  return (
    <Layout 
      user={mockUser} 
      isAuthenticated={true}
      className={styles.psychologistLayout}
    >
      <div className={styles.dashboardContainer}>
        <div className="container">
          <div className={styles.dashboardHeader}>
            <h1 className={styles.welcomeTitle}>Good morning, {mockUser.first_name}!</h1>
            <p className={styles.welcomeSubtitle}>
              Here's your schedule and patient overview for today.
            </p>
          </div>


          <div className={styles.dashboardGrid}>
            <div className={styles.dashboardCard}>
              <h3>📅 Today's Schedule</h3>
              <div className={styles.placeholder}>
                <p>No appointments scheduled for today</p>
              </div>
            </div>

            <div className={styles.dashboardCard}>
              <h3>👥 Active Patients</h3>
              <div className={styles.placeholder}>
                <p>Patient list will appear here</p>
                <button className={styles.actionButton}>View All Patients</button>
              </div>
            </div>

            <div className={styles.dashboardCard}>
              <h3>📝 Pending Notes</h3>
              <div className={styles.placeholder}>
                <p>No pending progress notes</p>
              </div>
            </div>

            <div className={styles.dashboardCard}>
              <h3>📊 This Week's Stats</h3>
              <div className={styles.placeholder}>
                <p>Weekly statistics will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
