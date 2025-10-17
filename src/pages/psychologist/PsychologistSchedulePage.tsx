import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
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
}

interface CalendarDay {
  date: string;
  appointments: Appointment[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

export const PsychologistSchedulePage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'today'>('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');

  const user = authService.getStoredUser() || {
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

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now - replace with real API call
      const mockAppointments: Appointment[] = [
        {
          id: 1,
          patient_name: 'John Smith',
          patient_id: 101,
          service_name: 'Individual Therapy Session',
          appointment_date: new Date().toISOString(),
          formatted_date: new Date().toLocaleDateString('en-AU'),
          formatted_time: '10:00 AM',
          duration_minutes: 50,
          session_type: 'telehealth',
          status: 'confirmed',
          notes: null,
          location: null,
          meeting_link: 'https://zoom.us/j/123456789'
        },
        {
          id: 2,
          patient_name: 'Emma Wilson',
          patient_id: 102,
          service_name: 'Couples Therapy Session',
          appointment_date: new Date(Date.now() + 86400000).toISOString(),
          formatted_date: new Date(Date.now() + 86400000).toLocaleDateString('en-AU'),
          formatted_time: '2:00 PM',
          duration_minutes: 60,
          session_type: 'in_person',
          status: 'scheduled',
          notes: null,
          location: 'MindWell Clinic - Room 3',
          meeting_link: null
        },
        {
          id: 3,
          patient_name: 'Michael Chen',
          patient_id: 103,
          service_name: 'Individual Therapy Session',
          appointment_date: new Date(Date.now() - 86400000).toISOString(),
          formatted_date: new Date(Date.now() - 86400000).toLocaleDateString('en-AU'),
          formatted_time: '3:30 PM',
          duration_minutes: 50,
          session_type: 'telehealth',
          status: 'completed',
          notes: 'Patient showed improvement in anxiety management',
          location: null,
          meeting_link: 'https://zoom.us/j/987654321'
        }
      ];

      setAppointments(mockAppointments);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    // TODO: Implement complete session API call
    const updatedAppointments = appointments.map(apt =>
      apt.id === appointmentId ? { ...apt, status: 'completed' as const } : apt
    );
    setAppointments(updatedAppointments);
    alert('Session marked as completed!');
  };

  const handleAddNotes = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes || '');
    setShowNotesModal(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedAppointment) return;

    // TODO: Implement save notes API call
    const updatedAppointments = appointments.map(apt =>
      apt.id === selectedAppointment.id ? { ...apt, notes } : apt
    );
    setAppointments(updatedAppointments);
    setShowNotesModal(false);
    setSelectedAppointment(null);
    setNotes('');
    alert('Notes saved successfully!');
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
        return '📅';
      case 'completed':
        return '✅';
      case 'cancelled':
        return '❌';
      case 'no_show':
        return '⚠️';
      default:
        return '📅';
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
              <h2>⚠️ Unable to Load Schedule</h2>
              <p>{error}</p>
              <button className={styles.retryButton} onClick={fetchAppointments}>
                🔄 Retry
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
                  <span className={styles.titleIcon}>📅</span>
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
                    <span>📋</span>
                    <span className={styles.buttonText}>List View</span>
                  </button>
                  <button
                    className={viewMode === 'calendar' ? styles.active : ''}
                    onClick={() => setViewMode('calendar')}
                  >
                    <span>📅</span>
                    <span className={styles.buttonText}>Calendar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{todayAppointments.length}</div>
                <div className={styles.statLabel}>Today's Sessions</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⏰</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {filteredAppointments.filter(a => a.status === 'confirmed' || a.status === 'scheduled').length}
                </div>
                <div className={styles.statLabel}>Upcoming</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {appointments.filter(a => a.status === 'completed').length}
                </div>
                <div className={styles.statLabel}>Completed</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
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
                  <div className={styles.emptyIcon}>📅</div>
                  <h3>No Appointments Found</h3>
                  <p>You don't have any {filterStatus === 'all' ? '' : filterStatus} appointments.</p>
                </div>
              ) : (
                filteredAppointments.map(appointment => (
                  <div key={appointment.id} className={styles.appointmentCard}>
                    <div className={styles.appointmentHeader}>
                      <div className={styles.appointmentInfo}>
                        <div className={styles.patientInfo}>
                          <div className={styles.patientAvatar}>
                            {appointment.patient_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className={styles.patientName}>{appointment.patient_name}</h3>
                            <p className={styles.serviceName}>{appointment.service_name}</p>
                          </div>
                        </div>
                        <div className={styles.appointmentDateTime}>
                          <div className={styles.appointmentDate}>
                            <span className={styles.dateLabel}>📅</span>
                            <span className={styles.dateValue}>{appointment.formatted_date}</span>
                          </div>
                          <div className={styles.appointmentTime}>
                            <span className={styles.timeLabel}>🕐</span>
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
                        <div className={styles.notesSection}>
                          <span className={styles.notesLabel}>📝 Session Notes:</span>
                          <p className={styles.notesText}>{appointment.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className={styles.appointmentActions}>
                      <button
                        className={styles.secondaryButton}
                        onClick={() => handleAddNotes(appointment)}
                      >
                        {appointment.notes ? '📝 Edit Notes' : '📝 Add Notes'}
                      </button>
                      {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                        <button
                          className={styles.successButton}
                          onClick={() => handleCompleteSession(appointment.id)}
                        >
                          ✅ Complete Session
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Calendar View - Coming soon */}
          {viewMode === 'calendar' && (
            <div className={styles.calendarPlaceholder}>
              <div className={styles.placeholderContent}>
                <h3>📅 Calendar View</h3>
                <p>Calendar view is coming soon!</p>
                <p>For now, please use the list view to manage your appointments.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes Modal */}
      {showNotesModal && selectedAppointment && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Session Notes - {selectedAppointment.patient_name}</h3>
            <p className={styles.modalSubtext}>
              {selectedAppointment.formatted_date} at {selectedAppointment.formatted_time}
            </p>
            <textarea
              className={styles.notesTextarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter session notes here..."
              rows={8}
            />
            <div className={styles.modalActions}>
              <button
                className={styles.secondaryButton}
                onClick={() => {
                  setShowNotesModal(false);
                  setSelectedAppointment(null);
                  setNotes('');
                }}
              >
                Cancel
              </button>
              <button
                className={styles.primaryButton}
                onClick={handleSaveNotes}
              >
                💾 Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

