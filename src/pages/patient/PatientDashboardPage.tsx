import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { OnboardingProgress } from '../../components/patient/OnboardingProgress/OnboardingProgress';
import { dashboardService } from '../../services/api/dashboard';
import type { PatientDashboard } from '../../services/api/dashboard';
import { authService } from '../../services/api/auth';
import { videoCallService } from '../../services/api/videoCall';
import { appointmentsService } from '../../services/api/appointments';
import type { PatientAppointment } from '../../services/api/appointments';
import styles from './PatientPages.module.scss';

export const PatientDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<PatientDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoCallAppointments, setVideoCallAppointments] = useState<PatientAppointment[]>([]);
  
  // Get user data from auth service
  const user = authService.getStoredUser() || {
    id: 1,
    email: 'john@example.com',
    username: 'john.smith',
    first_name: 'John',
    last_name: 'Smith',
    full_name: 'John Smith',
    role: 'patient' as const,
    phone_number: '+61412345678',
    date_of_birth: '1990-01-15',
    age: 34,
    is_verified: true,
    created_at: '2024-01-01'
  };

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getPatientDashboard();
        setDashboardData(data);
      } catch (err: any) {
        console.error('Failed to load dashboard:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Load appointments for video call card
  useEffect(() => {
    const loadVideoCallAppointments = async () => {
      try {
        const response = await appointmentsService.getPatientAppointments({
          status: 'upcoming',
          page: 1,
          page_size: 10
        });
        
        // Filter for telehealth appointments that can be joined
        const eligibleAppointments = response.results.filter((apt: PatientAppointment) => {
          return videoCallService.isVideoCallAvailable(apt) && videoCallService.canJoinNow(apt);
        });
        
        setVideoCallAppointments(eligibleAppointments);
      } catch (err: any) {
        console.error('Failed to load video call appointments:', err);
        // Don't show error, just leave empty
        setVideoCallAppointments([]);
      }
    };

    loadVideoCallAppointments();
  }, []);

  const handleContinueIntake = () => {
    navigate('/patient/intake-form');
  };

  const handleBookAppointment = () => {
    navigate('/appointments/book-appointment');
  };

  const handleJoinVideoCall = (appointmentId: number | string) => {
    navigate(`/video-session/${appointmentId}`);
  };

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.patientLayout}>
        <div className={styles.dashboardContainer}>
          <div className="container">
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.patientLayout}>
        <div className={styles.dashboardContainer}>
          <div className="container">
            <div className={styles.errorContainer}>
              <h2>⚠️ Error Loading Dashboard</h2>
              <p>{error}</p>
              <button 
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      user={user} 
      isAuthenticated={true}
      className={styles.patientLayout}
    >
      <div className={styles.dashboardContainer}>
        <div className="container">
          <div className={styles.dashboardHeader}>
            <h1 className={styles.welcomeTitle}>Welcome back, {user.first_name}!</h1>
            <p className={styles.welcomeSubtitle}>
              Here's an overview of your mental health journey with us.
            </p>
          </div>

          <OnboardingProgress user={user} />

          <div className={styles.dashboardGrid}>
            {/* Video Sessions Card - Prominent */}
            <div className={`${styles.dashboardCard} ${styles.videoSessionsCard}`}>
              <h3>🎥 Video Sessions</h3>
              <div className={styles.cardContent}>
                {videoCallAppointments.length > 0 ? (
                  <div className={styles.videoSessionsList}>
                    {videoCallAppointments.map((appointment) => (
                      <div key={appointment.id} className={styles.videoSessionItem}>
                        <div className={styles.videoSessionInfo}>
                          <div className={styles.videoSessionHeader}>
                            <span className={styles.videoSessionPsychologist}>
                              {appointment.psychologist.name}
                            </span>
                            <span className={styles.videoSessionTime}>
                              {videoCallService.getTimeUntilAppointment(appointment)}
                            </span>
                          </div>
                          <div className={styles.videoSessionDetails}>
                            <span>{appointment.formatted_date}</span>
                            <span>•</span>
                            <span>{appointment.formatted_time}</span>
                            <span>•</span>
                            <span>{appointment.duration_minutes} min</span>
                          </div>
                        </div>
                        <button
                          className={`${styles.actionButton} ${styles.videoJoinButton}`}
                          onClick={() => handleJoinVideoCall(appointment.id)}
                        >
                          🎥 Join Now
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.placeholder}>
                    <p>No active video sessions available</p>
                    <p className={styles.placeholderSubtext}>
                      Video sessions will appear here when you have upcoming telehealth appointments
                    </p>
                    <button 
                      className={styles.actionButton}
                      onClick={() => navigate('/patient/appointments')}
                    >
                      View All Appointments
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Next Appointment Card */}
            <div className={styles.dashboardCard}>
              <h3>📅 Next Appointment</h3>
              <div className={styles.cardContent}>
                {dashboardData?.next_appointment && Object.keys(dashboardData.next_appointment).length > 0 ? (
                  <div className={styles.appointmentInfo}>
                    <p><strong>Appointment scheduled</strong></p>
                    <p>Check your appointments for details</p>
                    
                    {/* Video Call Button - Show if it's a telehealth appointment */}
                    {dashboardData.next_appointment.id && 
                     videoCallService.canJoinNow(dashboardData.next_appointment) && (
                      <div className={styles.videoCallSection}>
                        <div className={styles.videoCallInfo}>
                          <span className={styles.videoBadge}>🎥 Telehealth</span>
                          <span className={styles.timeUntil}>
                            {videoCallService.getTimeUntilAppointment(dashboardData.next_appointment)}
                          </span>
                        </div>
                        <button
                          className={`${styles.actionButton} ${styles.videoButton}`}
                          onClick={() => handleJoinVideoCall(dashboardData.next_appointment!.id)}
                        >
                          🎥 Join Video Session
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.placeholder}>
                    <p>No upcoming appointments</p>
                    <button 
                      className={styles.actionButton}
                      onClick={handleBookAppointment}
                    >
                      Book New Appointment
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Total Sessions Card */}
            <div className={styles.dashboardCard}>
              <h3>📊 Total Sessions</h3>
              <div className={styles.cardContent}>
                <div className={styles.statNumber}>
                  {dashboardData?.total_sessions || 0}
                </div>
                <p>Completed therapy sessions</p>
              </div>
            </div>

            {/* Intake Form Card */}
            <div className={styles.dashboardCard}>
              <h3>📋 Intake Form</h3>
              <div className={styles.cardContent}>
                {dashboardData?.intake_completed ? (
                  <div className={styles.completedStatus}>
                    <div className={styles.statusText}>
                      <p className={styles.statusTitle}>Completed</p>
                      <p className={styles.statusDescription}>Your intake form is complete</p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.placeholder}>
                    <p>Complete your intake form to get started</p>
                    <button 
                      className={styles.actionButton}
                      onClick={handleContinueIntake}
                    >
                      Continue Intake
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Outstanding Invoices Card */}
            <div className={styles.dashboardCard}>
              <h3>💰 Outstanding Invoices</h3>
              <div className={styles.cardContent}>
                <div className={styles.statNumber}>
                  {dashboardData?.outstanding_invoices || 0}
                </div>
                <p>Pending payments</p>
                <button 
                  className={styles.actionButton}
                  onClick={() => navigate('/patient/invoices')}
                >
                  View Invoices
                </button>
              </div>
            </div>

            {/* Recent Progress Card */}
            <div className={styles.dashboardCard}>
              <h3>📈 Recent Progress</h3>
              <div className={styles.cardContent}>
                {dashboardData?.recent_progress && dashboardData.recent_progress.length > 0 ? (
                  <div className={styles.progressList}>
                    {dashboardData.recent_progress.map((progress: any, index: number) => (
                      <div key={progress.id || index} className={styles.progressItem}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <strong>Session #{progress.session_number || index + 1}</strong>
                          {progress.progress_rating && (
                            <span>⭐ {progress.progress_rating}/10</span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>
                          {progress.psychologist_name && `Dr. ${progress.psychologist_name} • `}
                          {progress.session_date && new Date(progress.session_date).toLocaleDateString('en-AU', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.placeholder}>
                    <p>Your progress will appear here after sessions</p>
                  </div>
                )}
              </div>
            </div>

            {/* Resources Card */}
            <div className={styles.dashboardCard}>
              <h3>💬 Resources</h3>
              <div className={styles.cardContent}>
                <div className={styles.placeholder}>
                  <p>Mental health resources and tools</p>
                  <button className={styles.actionButton}>View Resources</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
