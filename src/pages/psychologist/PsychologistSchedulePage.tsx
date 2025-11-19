import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { appointmentsService } from '../../services/api/appointments';
import { videoCallService } from '../../services/api/videoCall';
import { SessionTimer } from '../../components/patient/SessionTimer';
import {
  CalendarIcon,
  CheckCircleIcon,
  ErrorCircleIcon,
  WarningIcon,
  ClipboardIcon,
  UsersIcon,
  VideoIcon,
  ClockIcon,
  EditIcon,
  BuildingIcon,
  NotesIcon,
  LocationIcon,
  LinkIcon,
  CloseIcon
} from '../../utils/icons';
import styles from './PsychologistPages.module.scss';

interface Appointment {
  id: number;
  patient_name: string;
  patient_id: number;
  service_name: string;
  appointment_date: string;
  formatted_date: string;
  formatted_time: string;
  duration_minutes: number;
  session_type: 'telehealth' | 'in_person';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  location: string | null;
  meeting_link: string | null;
  // Timer fields
  session_start_time?: string;
  session_end_time?: string;
  time_until_start_seconds?: number | null;
  time_remaining_seconds?: number | null;
  session_status?: 'upcoming' | 'starting_soon' | 'in_progress' | 'ended' | 'unknown';
  can_join_session?: boolean;
}

interface CalendarDay {
  date: string;
  appointments: Appointment[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

export const PsychologistSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'today'>('upcoming');
  const [showDayModal, setShowDayModal] = useState(false);
  const [dayModalDate, setDayModalDate] = useState<string | null>(null);
  const [dayModalAppointments, setDayModalAppointments] = useState<Appointment[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [newAppointmentDate, setNewAppointmentDate] = useState('');

  const user = authService.getStoredUser();

  const handleJoinVideoCall = (appointmentId: number | string) => {
    navigate(`/video-session/${appointmentId}`);
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params based on view mode and filter status
      const params: any = {};
      
      // If in calendar view, fetch for the selected month
      if (viewMode === 'calendar') {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        params.month = `${year}-${month}`;
      } else {
        // List view - use filter status
        if (filterStatus === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          params.start_date = today.toISOString().split('T')[0];
          params.end_date = tomorrow.toISOString().split('T')[0];
        } else if (filterStatus === 'upcoming') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          params.start_date = today.toISOString().split('T')[0];
        }
      }

      // Fetch appointments from API
      const response = await appointmentsService.getPsychologistSchedule(params);
      
      // Map API response to local Appointment interface
      const mappedAppointments: Appointment[] = response.results.map((apt) => ({
        id: apt.id,
        patient_name: apt.patient_name,
        patient_id: apt.patient_id,
        service_name: apt.service_name,
        appointment_date: apt.appointment_date,
        formatted_date: apt.formatted_date,
        formatted_time: apt.formatted_time,
        duration_minutes: apt.duration_minutes,
        session_type: apt.session_type,
        status: apt.status,
        notes: apt.notes,
        location: apt.location,
        meeting_link: apt.meeting_link,
        // Timer fields
        session_start_time: apt.session_start_time,
        session_end_time: apt.session_end_time,
        time_until_start_seconds: apt.time_until_start_seconds,
        time_remaining_seconds: apt.time_remaining_seconds,
        session_status: apt.session_status,
        can_join_session: apt.can_join_session
      }));

      setAppointments(mappedAppointments);
    } catch (err: any) {
      console.error('Failed to load appointments:', err);
      setError(err.message || 'Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus, selectedDate, viewMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh appointments every 30 seconds to update timer values
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAppointments();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, selectedDate, viewMode]);

  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (filterStatus === 'today') {
      return aptDate >= today && aptDate < tomorrow && apt.status !== 'completed' && apt.status !== 'cancelled';
    } else if (filterStatus === 'upcoming') {
      return aptDate >= today && apt.status !== 'completed' && apt.status !== 'cancelled';
    }
    return true;
  });

  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  const handleCompleteSession = async (appointmentId: number) => {
    try {
      // Call API to complete session
      await appointmentsService.completeSession(appointmentId);
      
      // Refresh appointments list
      await fetchAppointments();
      
      alert('Session marked as completed!');
    } catch (error: any) {
      console.error('Failed to complete session:', error);
      alert(error.message || 'Failed to complete session. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return styles.statusUpcoming;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      case 'no_show':
        return styles.statusNoShow;
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return <CalendarIcon size="sm" />;
      case 'completed':
        return <CheckCircleIcon size="sm" />;
      case 'cancelled':
        return <ErrorCircleIcon size="sm" />;
      case 'no_show':
        return <WarningIcon size="sm" />;
      default:
        return <CalendarIcon size="sm" />;
    }
  };

  // Generate calendar days for the current month
  const generateCalendarDays = (currentDate: Date, appointments: Appointment[]): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and calculate starting position
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.getTime() === today.getTime();
      
      // Filter appointments for this day
      const dayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === date.getTime();
      });
      
      days.push({
        date: date.toISOString(),
        appointments: dayAppointments,
        isToday,
        isCurrentMonth
      });
    }
    
    return days;
  };

  const openDayModal = (day: CalendarDay) => {
    setDayModalDate(day.date);
    setDayModalAppointments(day.appointments);
    setShowDayModal(true);
  };

  const closeDayModal = () => {
    setShowDayModal(false);
    setDayModalDate(null);
    setDayModalAppointments([]);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointmentId) return;
    
    try {
      await appointmentsService.appointmentAction(selectedAppointmentId, 'cancel', {
        reason: cancelReason || 'Cancelled by psychologist'
      });
      
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedAppointmentId(null);
      await fetchAppointments();
      closeDayModal();
      alert('Appointment cancelled successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to cancel appointment');
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointmentId || !newAppointmentDate) return;
    
    try {
      await appointmentsService.appointmentAction(selectedAppointmentId, 'reschedule', {
        new_date: newAppointmentDate,
        reason: 'Rescheduled by psychologist'
      });
      
      setShowRescheduleModal(false);
      setNewAppointmentDate('');
      setSelectedAppointmentId(null);
      await fetchAppointments();
      closeDayModal();
      alert('Appointment rescheduled successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to reschedule appointment');
    }
  };

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.psychologistLayout}>
        <div className={styles.dashboardContainer}>
          <div className="container">
            <div className={styles.loadingState}>
              <p>Loading schedule...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.psychologistLayout}>
        <div className={styles.dashboardContainer}>
          <div className="container">
            <div className={styles.errorState}>
              <h2><WarningIcon size="lg" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Unable to Load Schedule</h2>
              <p>{error}</p>
              <button className={styles.retryButton} onClick={fetchAppointments}>
                <EditIcon size="sm" style={{ marginRight: '6px' }} />
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} isAuthenticated={true} className={styles.psychologistLayout}>
      <div className={styles.scheduleContainer}>
        <div className="container">
          {/* Page Header with Gradient */}
          <div className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerText}>
                <h1 className={styles.pageTitle}>
                  <span className={styles.titleIcon}><CalendarIcon size="lg" /></span>
                  My Schedule
                </h1>
                <p className={styles.pageSubtitle}>
                  Manage your appointments and sessions
                </p>
              </div>
              <div className={styles.headerActions}>
                <div className={styles.viewToggle}>
                  <button
                    className={viewMode === 'list' ? styles.active : ''}
                    onClick={() => setViewMode('list')}
                  >
                    <span><ClipboardIcon size="sm" /></span>
                    <span className={styles.buttonText}>List View</span>
                  </button>
                  <button
                    className={viewMode === 'calendar' ? styles.active : ''}
                    onClick={() => setViewMode('calendar')}
                  >
                    <span><CalendarIcon size="sm" /></span>
                    <span className={styles.buttonText}>Calendar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><CalendarIcon size="xl" /></div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{todayAppointments.length}</div>
                <div className={styles.statLabel}>Today's Sessions</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><ClockIcon size="xl" /></div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {filteredAppointments.filter(a => a.status === 'confirmed' || a.status === 'scheduled').length}
                </div>
                <div className={styles.statLabel}>Upcoming</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><CheckCircleIcon size="xl" /></div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {appointments.filter(a => a.status === 'completed').length}
                </div>
                <div className={styles.statLabel}>Completed</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><UsersIcon size="xl" /></div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {new Set(appointments.map(a => a.patient_id)).size}
                </div>
                <div className={styles.statLabel}>Active Patients</div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className={styles.filterTabs}>
            <button
              className={filterStatus === 'today' ? styles.active : ''}
              onClick={() => setFilterStatus('today')}
            >
              Today
            </button>
            <button
              className={filterStatus === 'upcoming' ? styles.active : ''}
              onClick={() => setFilterStatus('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={filterStatus === 'all' ? styles.active : ''}
              onClick={() => setFilterStatus('all')}
            >
              All
            </button>
          </div>

          {/* Appointments List */}
          {viewMode === 'list' && (
            <div className={styles.appointmentsList}>
              {filteredAppointments.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}><CalendarIcon size="2xl" /></div>
                  <h3>No Appointments Found</h3>
                  <p>You don't have any {filterStatus === 'all' ? '' : filterStatus} appointments.</p>
                </div>
              ) : (
                filteredAppointments.map(appointment => (
                  <div key={appointment.id} className={styles.appointmentCard}>
                    {/* Status Badge - Top Right */}
                    <div className={styles.cardStatusBadge}>
                      <span className={`${styles.statusBadge} ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)} {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>

                    {/* Main Content */}
                    <div className={styles.cardContent}>
                      {/* Patient Info Section */}
                      <div className={styles.patientSection}>
                        <div className={styles.patientAvatar}>
                          {appointment.patient_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className={styles.patientDetails}>
                          <h3 className={styles.patientName}>{appointment.patient_name}</h3>
                          <p className={styles.serviceName}>{appointment.service_name}</p>
                        </div>
                      </div>

                      {/* Date & Time Section */}
                      <div className={styles.dateTimeSection}>
                        <div className={styles.dateTimeItem}>
                          <span className={styles.dateTimeIcon}><CalendarIcon size="sm" /></span>
                          <div className={styles.dateTimeContent}>
                            <span className={styles.dateTimeLabel}>Date</span>
                            <span className={styles.dateTimeValue}>{appointment.formatted_date}</span>
                          </div>
                        </div>
                        <div className={styles.dateTimeItem}>
                          <span className={styles.dateTimeIcon}><ClockIcon size="sm" /></span>
                          <div className={styles.dateTimeContent}>
                            <span className={styles.dateTimeLabel}>Time</span>
                            <span className={styles.dateTimeValue}>{appointment.formatted_time}</span>
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
                            <span className={styles.detailValue}>{appointment.duration_minutes} min</span>
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
                          <span className={styles.notesLabel}><NotesIcon size="sm" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Notes</span>
                          <p className={styles.notesText}>{appointment.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Session Timer */}
                    {(appointment.session_status || appointment.time_until_start_seconds !== null || appointment.time_remaining_seconds !== null) && (
                      <div className={styles.timerSection}>
                        <SessionTimer 
                          appointment={appointment as any}
                          onJoinSession={() => handleJoinVideoCall(appointment.id)}
                        />
                      </div>
                    )}

                    {/* Actions Section */}
                    <div className={styles.appointmentActions}>
                      {/* Video Call Button */}
                      {videoCallService.isVideoCallAvailable(appointment) && (
                        <button 
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
                        </button>
                      )}
                      {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                        <button
                          className={styles.successButton}
                          onClick={() => handleCompleteSession(appointment.id)}
                        >
                          <CheckCircleIcon size="sm" style={{ marginRight: '6px' }} />
                          Complete Session
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className={styles.calendarContainer}>
              <div className={styles.calendarHeader}>
                <button 
                  className={styles.calendarNavButton}
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                >
                  ← Previous
                </button>
                <h3 className={styles.calendarTitle}>
                  {selectedDate.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
                </h3>
                <button 
                  className={styles.calendarNavButton}
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                >
                  Next →
                </button>
              </div>
              
              <div className={styles.calendarGrid}>
                {/* Calendar Header */}
                <div className={styles.calendarWeekHeader}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className={styles.calendarDayHeader}>{day}</div>
                  ))}
                </div>
                
                {/* Calendar Days */}
                <div className={styles.calendarDays}>
                  {generateCalendarDays(selectedDate, appointments).map((day, index) => (
                    <div 
                      key={index} 
                      className={`${styles.calendarDay} ${
                        !day.isCurrentMonth ? styles.calendarDayOtherMonth : ''
                      } ${day.isToday ? styles.calendarDayToday : ''}`}
                      onClick={() => openDayModal(day)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles.calendarDayNumber}>{new Date(day.date).getDate()}</div>
                      {day.appointments.length > 0 && (
                        <div className={styles.calendarDayIndicators}>
                          {day.appointments.slice(0, 3).map(appointment => (
                            <div 
                              key={appointment.id} 
                              className={`${styles.appointmentDot} ${getStatusColor(appointment.status)}`}
                              title={`${appointment.formatted_time} - ${appointment.patient_name}`}
                            />
                          ))}
                          {day.appointments.length > 3 && (
                            <div className={styles.moreIndicator}>
                              +{day.appointments.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Day Modal */}
      {showDayModal && (
        <div className={styles.modalOverlay} onClick={closeDayModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div className={styles.modalHeader}>
              <h3>
                Appointments on {dayModalDate ? new Date(dayModalDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
              </h3>
              <button className={styles.closeButton} onClick={closeDayModal}><CloseIcon size="md" /></button>
            </div>
            <div className={styles.modalBody}>
              {dayModalAppointments.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}><CalendarIcon size="2xl" /></div>
                  <h3>No appointments for this day</h3>
                </div>
              ) : (
                <div className={styles.patientNotesList}>
                  {dayModalAppointments.map((apt) => (
                    <div key={apt.id} className={styles.patientNoteCard} style={{ cursor: 'default' }}>
                      <div className={styles.patientNoteHeader}>
                        <span className={styles.patientNoteSession}>{apt.formatted_time}</span>
                        <span className={`${styles.statusBadge} ${getStatusColor(apt.status)}`}>
                          {getStatusIcon(apt.status)} {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                        </span>
                      </div>
                      <div className={styles.patientNoteDate}>
                        {apt.service_name}
                      </div>
                      <div className={styles.patientNotePreview}>
                        <p><strong>Patient:</strong> {apt.patient_name}</p>
                        {apt.location && <p><strong>Location:</strong> {apt.location}</p>}
                        {apt.meeting_link && (
                          <p>
                            <strong>Meeting:</strong> <a href={apt.meeting_link} target="_blank" rel="noopener noreferrer">Join</a>
                          </p>
                        )}
                      </div>
                      {/* Session Timer */}
                      {(apt.session_status || apt.time_until_start_seconds !== null || apt.time_remaining_seconds !== null) && (
                        <SessionTimer 
                          appointment={apt as any}
                          onJoinSession={() => handleJoinVideoCall(apt.id)}
                        />
                      )}
                      {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                        <div className={styles.appointmentActions}>
                          {/* Video Call Button - Use can_join_session if available, otherwise fallback to old logic */}
                          {videoCallService.isVideoCallAvailable(apt) && (
                            <button 
                              className={`${styles.videoCallButton} ${
                                (apt.can_join_session === false || 
                                 (apt.can_join_session === undefined && !videoCallService.canJoinNow(apt))) 
                                ? styles.disabledButton : ''
                              }`}
                              onClick={() => {
                                const canJoin = apt.can_join_session !== undefined 
                                  ? apt.can_join_session 
                                  : videoCallService.canJoinNow(apt);
                                if (canJoin) {
                                  handleJoinVideoCall(apt.id);
                                }
                              }}
                              disabled={
                                apt.can_join_session === false || 
                                (apt.can_join_session === undefined && !videoCallService.canJoinNow(apt))
                              }
                              title={
                                apt.can_join_session === false 
                                  ? 'Video call is not available at this time' 
                                  : apt.can_join_session === undefined && !videoCallService.canJoinNow(apt)
                                  ? 'Video call will be available 15 minutes before the appointment'
                                  : 'Join video session'
                              }
                              style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}
                            >
                              <VideoIcon size="sm" style={{ marginRight: '6px' }} />
                              {
                                apt.can_join_session === true || 
                                (apt.can_join_session === undefined && videoCallService.canJoinNow(apt))
                                ? 'Join Video' 
                                : 'Video (Not Available)'
                              }
                            </button>
                          )}
                          <button
                            className={styles.secondaryButton}
                            onClick={() => {
                              setSelectedAppointmentId(apt.id);
                              setShowCancelModal(true);
                            }}
                            style={{ marginRight: '0.5rem', padding: '0.5rem 1rem' }}
                          >
                            Cancel
                          </button>
                          <button
                            className={styles.secondaryButton}
                            onClick={() => {
                              setSelectedAppointmentId(apt.id);
                              setNewAppointmentDate(new Date(apt.appointment_date).toISOString().slice(0, 16));
                              setShowRescheduleModal(true);
                            }}
                            style={{ padding: '0.5rem 1rem' }}
                          >
                            Reschedule
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.secondaryButton} onClick={closeDayModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCancelModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h3>Cancel Appointment</h3>
              <button className={styles.closeButton} onClick={() => setShowCancelModal(false)}><CloseIcon size="md" /></button>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to cancel this appointment?</p>
              <div className={styles.formGroup}>
                <label>Reason (optional):</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter cancellation reason..."
                  rows={3}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.secondaryButton} onClick={() => setShowCancelModal(false)}>
                Keep Appointment
              </button>
              <button className={styles.deleteButton} onClick={handleCancelAppointment}>
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRescheduleModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h3>Reschedule Appointment</h3>
              <button className={styles.closeButton} onClick={() => setShowRescheduleModal(false)}><CloseIcon size="md" /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>New Date & Time:</label>
                <input
                  type="datetime-local"
                  value={newAppointmentDate}
                  onChange={(e) => setNewAppointmentDate(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.secondaryButton} onClick={() => setShowRescheduleModal(false)}>
                Cancel
              </button>
              <button className={styles.primaryButton} onClick={handleRescheduleAppointment}>
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

