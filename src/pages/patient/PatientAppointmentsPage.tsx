import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { appointmentsService } from '../../services/api/appointments';
import type { PatientAppointment } from '../../services/api/appointments';
import styles from './PatientAppointments.module.scss';

// Using PatientAppointment interface from appointments service

export const PatientAppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointment | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

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

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await appointmentsService.getPatientAppointments({
          status: filter === 'all' ? undefined : filter,
          page: 1,
          page_size: 50
        });
        
        setAppointments(response.results || []);
      } catch (err: any) {
        console.error('Failed to load appointments:', err);
        // If 404, the endpoint might not exist yet - show empty state
        if (err.response?.status === 404) {
          setAppointments([]);
          setError(null); // Don't show error, just empty state
        } else {
          setError('Failed to load appointments. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [filter]);

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  const handleBookNew = () => {
    navigate('/appointments/book-appointment');
  };

  const handleViewDetails = (appointment: PatientAppointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCancelAppointment = (appointment: PatientAppointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleRescheduleAppointment = (appointment: PatientAppointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const confirmCancel = async () => {
    if (selectedAppointment) {
      try {
        await appointmentsService.cancelAppointment(selectedAppointment.id);
        
        // Update local state
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === selectedAppointment.id 
              ? { ...apt, status: 'cancelled' as const, can_cancel: false, can_reschedule: false }
              : apt
          )
        );
        
        setShowCancelModal(false);
        setSelectedAppointment(null);
        alert('Appointment cancelled successfully.');
      } catch (err) {
        console.error('Failed to cancel appointment:', err);
        alert('Failed to cancel appointment. Please try again.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return styles.statusUpcoming;
      case 'completed': return styles.statusCompleted;
      case 'cancelled': return styles.statusCancelled;
      case 'rescheduled': return styles.statusRescheduled;
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return '📅';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      case 'rescheduled': return '🔄';
      default: return '📅';
    }
  };

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.patientLayout}>
        <div className={styles.dashboardContainer}>
          <div className="container">
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading your appointments...</p>
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
            <div className={styles.errorState}>
              <h3>⚠️ Unable to Load Appointments</h3>
              <p>{error}</p>
              <button 
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                🔄 Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} isAuthenticated={true} className={styles.patientLayout}>
      <div className={styles.dashboardContainer}>
        <div className="container">
          <div className={styles.dashboardHeader}>
            <h1 className={styles.welcomeTitle}>Your Appointments</h1>
            <p className={styles.welcomeSubtitle}>
              Manage your therapy sessions and view your appointment history.
            </p>
          </div>

          {/* Action Bar */}
          <div className={styles.actionBar}>
            <div className={styles.filterTabs}>
              <button 
                className={`${styles.filterTab} ${filter === 'all' ? styles.filterTabActive : ''}`}
                onClick={() => setFilter('all')}
              >
                All Appointments
              </button>
              <button 
                className={`${styles.filterTab} ${filter === 'upcoming' ? styles.filterTabActive : ''}`}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </button>
              <button 
                className={`${styles.filterTab} ${filter === 'completed' ? styles.filterTabActive : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
              <button 
                className={`${styles.filterTab} ${filter === 'cancelled' ? styles.filterTabActive : ''}`}
                onClick={() => setFilter('cancelled')}
              >
                Cancelled
              </button>
            </div>
            <button className={styles.primaryButton} onClick={handleBookNew}>
              📅 Book New Appointment
            </button>
          </div>

          {/* Appointments List */}
          <div className={styles.appointmentsList}>
            {filteredAppointments.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📅</div>
                <h3>No appointments found</h3>
                <p>
                  {filter === 'all' 
                    ? "You don't have any appointments yet." 
                    : `No ${filter} appointments found.`
                  }
                </p>
                <button className={styles.primaryButton} onClick={handleBookNew}>
                  Book Your First Appointment
                </button>
              </div>
            ) : (
              filteredAppointments.map((appointment) => (
                <div key={appointment.id} className={styles.appointmentCard}>
                  <div className={styles.appointmentHeader}>
                    <div className={styles.appointmentInfo}>
                      <div className={styles.psychologistInfo}>
                        <img 
                          src={appointment.psychologist.profile_image_url || '/default-psychologist.jpg'} 
                          alt={appointment.psychologist.name}
                          className={styles.psychologistAvatar}
                        />
                        <div>
                          <h3 className={styles.psychologistName}>{appointment.psychologist.name}</h3>
                          <p className={styles.psychologistTitle}>{appointment.psychologist.title}</p>
                        </div>
                      </div>
                      <div className={styles.appointmentDateTime}>
                        <div className={styles.appointmentDate}>
                          <span className={styles.dateLabel}>Date:</span>
                          <span className={styles.dateValue}>{appointment.formatted_date}</span>
                        </div>
                        <div className={styles.appointmentTime}>
                          <span className={styles.timeLabel}>Time:</span>
                          <span className={styles.timeValue}>{appointment.formatted_time}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.appointmentStatus}>
                      <span className={`${styles.statusBadge} ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)} {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.appointmentDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Type:</span>
                      <span className={styles.detailValue}>
                        {appointment.session_type === 'in_person' ? '🏢 In-Person' : '💻 Telehealth'}
                      </span>
                    </div>
                    {appointment.location && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Location:</span>
                        <span className={styles.detailValue}>{appointment.location}</span>
                      </div>
                    )}
                    {appointment.meeting_link && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Meeting Link:</span>
                        <a href={appointment.meeting_link} className={styles.meetingLink} target="_blank" rel="noopener noreferrer">
                          Join Meeting
                        </a>
                      </div>
                    )}
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Duration:</span>
                      <span className={styles.detailValue}>{appointment.duration_minutes} minutes</span>
                    </div>
                    {appointment.notes && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Notes:</span>
                        <span className={styles.detailValue}>{appointment.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.appointmentActions}>
                    <button 
                      className={styles.secondaryButton}
                      onClick={() => handleViewDetails(appointment)}
                    >
                      View Details
                    </button>
                    {appointment.can_reschedule && (
                      <button 
                        className={styles.secondaryButton}
                        onClick={() => handleRescheduleAppointment(appointment)}
                      >
                        Reschedule
                      </button>
                    )}
                    {appointment.can_cancel && (
                      <button 
                        className={styles.dangerButton}
                        onClick={() => handleCancelAppointment(appointment)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedAppointment && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Cancel Appointment</h3>
            <p>Are you sure you want to cancel your appointment with {selectedAppointment.psychologist.name} on {selectedAppointment.formatted_date} at {selectedAppointment.formatted_time}?</p>
            <div className={styles.modalActions}>
              <button 
                className={styles.secondaryButton}
                onClick={() => setShowCancelModal(false)}
              >
                Keep Appointment
              </button>
              <button 
                className={styles.dangerButton}
                onClick={confirmCancel}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Reschedule Appointment</h3>
            <p>Redirecting to appointment booking to reschedule your session with {selectedAppointment.psychologist.name}...</p>
            <div className={styles.modalActions}>
              <button 
                className={styles.secondaryButton}
                onClick={() => setShowRescheduleModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.primaryButton}
                onClick={() => {
                  navigate('/appointments/book-appointment');
                  setShowRescheduleModal(false);
                }}
              >
                Go to Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
