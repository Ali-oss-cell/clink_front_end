import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { appointmentsService } from '../../services/api/appointments';
import type { PatientAppointment } from '../../services/api/appointments';
import { videoCallService } from '../../services/api/videoCall';
import { SessionTimer } from '../../components/patient/SessionTimer';
import { AppointmentRecordingIndicator } from '../../components/recordings';
import { usePatientAppointments } from '../../hooks/usePatientAppointments';
import { 
  CalendarIcon,
  CalendarPlusIcon,
  VideoIcon,
  ClipboardIcon,
  EditIcon,
  CloseIcon,
  WarningIcon,
  BuildingIcon,
  ClockIcon,
  LocationIcon,
  LinkIcon,
  NotesIcon
} from '../../utils/icons';
import { Button } from '../../components/ui/button';
import { formatSessionDurationMinutes } from '../../utils/formatSessionDuration';
import { PatientShellPage, patientShellPageStyles } from '../../components/patient/PatientShellPage/PatientShellPage';
import patientPageStyles from './PatientPages.module.scss';
import styles from './PatientAppointments.module.scss';

// Using PatientAppointment interface from appointments service

export const PatientAppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointment | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  // ✅ Use the custom hook to prevent loops
  const {
    appointments,
    loading,
    error,
    count,
    currentPage,
    hasNext,
    hasPrevious,
    refetch,
    nextPage,
    previousPage,
  } = usePatientAppointments({
    status: filter,
    pageSize: 50, // Show more appointments per page
    autoFetch: true,
  });

  // Auto-refresh appointments every 30 seconds to update timer values
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refetch]); // ✅ Include refetch in dependencies

  // Helper function to format date
  const formatAppointmentDate = (appointment: PatientAppointment): string => {
    if (appointment.formatted_date) {
      return appointment.formatted_date;
    }
    if (appointment.appointment_date) {
      try {
        const date = new Date(appointment.appointment_date);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-AU', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
      } catch (e) {
        console.error('Error formatting date:', e);
      }
    }
    return 'Date not available';
  };

  // Helper function to format time
  const formatAppointmentTime = (appointment: PatientAppointment): string => {
    if (appointment.formatted_time) {
      return appointment.formatted_time;
    }
    if (appointment.appointment_date) {
      try {
        const date = new Date(appointment.appointment_date);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('en-AU', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        }
      } catch (e) {
        console.error('Error formatting time:', e);
      }
    }
    return 'Time not available';
  };

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

  const handleJoinVideoCall = (appointmentId: number | string) => {
    navigate(`/video-session/${appointmentId}`);
  };

  const confirmCancel = async () => {
    if (selectedAppointment) {
      try {
        await appointmentsService.cancelAppointment(selectedAppointment.id);
        
        // Refresh appointments to get updated data
        refetch();
        
        setShowCancelModal(false);
        setSelectedAppointment(null);
        setNotice({ type: 'success', message: 'Appointment cancelled successfully.' });
      } catch (err) {
        console.error('Failed to cancel appointment:', err);
        setNotice({ type: 'error', message: 'Failed to cancel appointment. Please try again.' });
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

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} patientShell className={patientPageStyles.patientLayout}>
        <PatientShellPage>
          <div className={styles.shellLoading}>
            <div className={styles.shellSpinner} />
            <p>Loading your appointments…</p>
          </div>
        </PatientShellPage>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout user={user} isAuthenticated={true} patientShell className={patientPageStyles.patientLayout}>
        <PatientShellPage>
          <div className={styles.shellError}>
            <h3>
              <WarningIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Unable to load
              appointments
            </h3>
            <p>{error.message || 'Failed to load appointments. Please try again.'}</p>
            <button type="button" className={patientShellPageStyles.btnPrimary} onClick={() => refetch()}>
              <EditIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Retry
            </button>
          </div>
        </PatientShellPage>
      </Layout>
    );
  }

  return (
    <Layout user={user} isAuthenticated={true} patientShell className={patientPageStyles.patientLayout}>
      <PatientShellPage>
        <div className={styles.pageStack}>
        <header className={patientShellPageStyles.pageHeader}>
          <h1 className={patientShellPageStyles.pageTitle}>Your appointments</h1>
          <p className={patientShellPageStyles.pageSubtitle}>
            Manage your therapy sessions and view your history ({count} total).
          </p>
        </header>
        {notice && (
          <div className={`${styles.noticeBanner} ${notice.type === 'success' ? styles.noticeSuccess : styles.noticeError}`}>
            {notice.message}
          </div>
        )}

          {/* Action Bar */}
          <div className={styles.actionBar}>
            <div className={styles.filterTabs}>
              <Button 
                className={`${styles.filterTab} ${filter === 'all' ? styles.filterTabActive : ''}`}
                onClick={() => setFilter('all')}
              >
                All Appointments
              </Button>
              <Button 
                className={`${styles.filterTab} ${filter === 'upcoming' ? styles.filterTabActive : ''}`}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </Button>
              <Button 
                className={`${styles.filterTab} ${filter === 'completed' ? styles.filterTabActive : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </Button>
              <Button 
                className={`${styles.filterTab} ${filter === 'cancelled' ? styles.filterTabActive : ''}`}
                onClick={() => setFilter('cancelled')}
              >
                Cancelled
              </Button>
            </div>
            <Button className={styles.primaryButton} onClick={handleBookNew}>
              <CalendarPlusIcon size="sm" style={{ marginRight: '8px' }} /> 
              Book New Appointment
            </Button>
          </div>

          {/* Appointments List */}
          <div className={styles.appointmentsList}>
            {appointments.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><CalendarIcon size="2xl" /></div>
                <h3>No appointments found</h3>
                <p>
                  {filter === 'all' 
                    ? "You don't have any appointments yet." 
                    : `No ${filter} appointments found.`
                  }
                </p>
                <Button className={styles.primaryButton} onClick={handleBookNew}>
                  Book Your First Appointment
                </Button>
              </div>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment.id} className={styles.appointmentCard}>
                  {/* Status Badge - Top Right */}
                  <div className={styles.cardStatusBadge}>
                    <span className={`${styles.statusBadge} ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>

                  {/* Main Content */}
                  <div className={styles.cardContent}>
                    {/* Psychologist Info Section */}
                    <div className={styles.psychologistSection}>
                      <img 
                        src={appointment.psychologist.profile_image_url || '/default-psychologist.jpg'} 
                        alt={appointment.psychologist.name}
                        className={styles.psychologistAvatar}
                      />
                      <div className={styles.psychologistDetails}>
                        <h3 className={styles.psychologistName}>{appointment.psychologist.name}</h3>
                        <p className={styles.psychologistTitle}>{appointment.psychologist.title}</p>
                      </div>
                    </div>

                    {/* Date & Time Section */}
                    <div className={styles.dateTimeSection}>
                      <div className={styles.dateTimeItem}>
                        <span className={styles.dateTimeIcon}><CalendarIcon size="sm" /></span>
                        <div className={styles.dateTimeContent}>
                          <span className={styles.dateTimeLabel}>Date</span>
                          <span className={styles.dateTimeValue}>{formatAppointmentDate(appointment)}</span>
                        </div>
                      </div>
                      <div className={styles.dateTimeItem}>
                        <span className={styles.dateTimeIcon}><ClockIcon size="sm" /></span>
                        <div className={styles.dateTimeContent}>
                          <span className={styles.dateTimeLabel}>Time</span>
                          <span className={styles.dateTimeValue}>{formatAppointmentTime(appointment)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className={styles.detailsGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailIcon}>
                          {appointment.session_type === 'in_person' ? <BuildingIcon size="sm" /> : <VideoIcon size="sm" />}
                        </span>
                        <div className={styles.detailContent}>
                          <span className={styles.detailLabel}>Type</span>
                          <span className={styles.detailValue}>
                            {appointment.session_type === 'in_person' ? 'In-Person' : 'Telehealth'}
                          </span>
                        </div>
                      </div>
                      
                      <div className={styles.detailItem}>
                        <span className={styles.detailIcon}><ClockIcon size="sm" /></span>
                        <div className={styles.detailContent}>
                          <span className={styles.detailLabel}>Duration</span>
                          <span className={styles.detailValue}>
                            {formatSessionDurationMinutes(appointment.duration_minutes)}
                          </span>
                        </div>
                      </div>
                      
                      {appointment.location && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailIcon}><LocationIcon size="sm" /></span>
                          <div className={styles.detailContent}>
                            <span className={styles.detailLabel}>Location</span>
                            <span className={styles.detailValue}>{appointment.location}</span>
                          </div>
                        </div>
                      )}
                      
                      {appointment.meeting_link && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailIcon}><LinkIcon size="sm" /></span>
                          <div className={styles.detailContent}>
                            <span className={styles.detailLabel}>Meeting Link</span>
                            <a 
                              href={appointment.meeting_link} 
                              className={styles.meetingLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              Join Meeting →
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notes Section */}
                    {appointment.notes && (
                      <div className={styles.notesSection}>
                        <span className={styles.notesLabel}><NotesIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Notes</span>
                        <p className={styles.notesText}>{appointment.notes}</p>
                      </div>
                    )}

                    {/* Recording Indicator */}
                    <AppointmentRecordingIndicator
                      appointmentId={appointment.id}
                      appointmentStatus={appointment.status}
                    />
                  </div>

                  {/* Session Timer */}
                  {(appointment.session_status || appointment.time_until_start_seconds !== null || appointment.time_remaining_seconds !== null) && (
                    <div className={styles.timerSection}>
                      <SessionTimer 
                        appointment={appointment}
                        onJoinSession={() => handleJoinVideoCall(appointment.id)}
                      />
                    </div>
                  )}

                  {/* Actions Section */}
                  <div className={styles.appointmentActions}>
                    {/* Video Call Button */}
                    {videoCallService.isVideoCallAvailable(appointment) && (
                      <Button 
                        className={`${styles.videoCallButton} ${
                          (appointment.can_join_session === false || 
                           (appointment.can_join_session === undefined && !videoCallService.canJoinNow(appointment))) 
                          ? styles.disabledButton : ''
                        }`}
                        onClick={() => {
                          const canJoin = appointment.can_join_session !== undefined 
                            ? appointment.can_join_session 
                            : videoCallService.canJoinNow(appointment);
                          if (canJoin) {
                            handleJoinVideoCall(appointment.id);
                          }
                        }}
                        disabled={
                          appointment.can_join_session === false || 
                          (appointment.can_join_session === undefined && !videoCallService.canJoinNow(appointment))
                        }
                        title={
                          appointment.can_join_session === false 
                            ? 'Video call is not available at this time' 
                            : appointment.can_join_session === undefined && !videoCallService.canJoinNow(appointment)
                            ? 'Video call will be available 15 minutes before the appointment'
                            : 'Join video session'
                        }
                      >
                        <VideoIcon size="sm" style={{ marginRight: '6px' }} />
                        {
                          appointment.can_join_session === true || 
                          (appointment.can_join_session === undefined && videoCallService.canJoinNow(appointment))
                          ? 'Join Video Session' 
                          : 'Video Call (Not Available Yet)'
                        }
                      </Button>
                    )}
                    
                    <Button 
                      className={styles.secondaryButton}
                      onClick={() => handleViewDetails(appointment)}
                    >
                      <ClipboardIcon size="sm" style={{ marginRight: '6px' }} />
                      View Details
                    </Button>
                    
                    {appointment.can_reschedule && (
                      <Button 
                        className={styles.secondaryButton}
                        onClick={() => handleRescheduleAppointment(appointment)}
                      >
                        <EditIcon size="sm" style={{ marginRight: '6px' }} />
                        Reschedule
                      </Button>
                    )}
                    
                    {appointment.can_cancel && (
                      <Button 
                        className={styles.dangerButton}
                        onClick={() => handleCancelAppointment(appointment)}
                      >
                        <CloseIcon size="sm" style={{ marginRight: '6px' }} />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {(hasNext || hasPrevious) && (
            <div className={styles.paginationControls}>
              <Button 
                className={styles.paginationButton}
                onClick={previousPage}
                disabled={!hasPrevious}
              >
                Previous
              </Button>
              <span className={styles.paginationInfo}>
                Page {currentPage} of {Math.ceil(count / 50)}
              </span>
              <Button 
                className={styles.paginationButton}
                onClick={nextPage}
                disabled={!hasNext}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </PatientShellPage>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedAppointment && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Cancel Appointment</h3>
            <p>Are you sure you want to cancel your appointment with {selectedAppointment.psychologist.name} on {selectedAppointment.formatted_date} at {selectedAppointment.formatted_time}?</p>
            <div className={styles.modalActions}>
              <Button 
                className={styles.secondaryButton}
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedAppointment(null);
                }}
              >
                Keep Appointment
              </Button>
              <Button 
                className={styles.dangerButton}
                onClick={confirmCancel}
              >
                Yes, Cancel
              </Button>
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
              <Button 
                className={styles.secondaryButton}
                onClick={() => setShowRescheduleModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className={styles.primaryButton}
                onClick={() => {
                  navigate('/appointments/book-appointment');
                  setShowRescheduleModal(false);
                }}
              >
                Go to Booking
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
