import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { SOAPNoteForm } from '../../components/psychologist/SOAPNoteForm';
import { progressNotesService, type Patient as ApiPatient } from '../../services/api/progressNotes';
import { authService } from '../../services/api/auth';
import type { ProgressNote } from '../../types/progressNote';
import {
  UsersIcon,
  ChartIcon,
  CheckCircleIcon,
  CalendarIcon,
  SearchIcon,
  WarningIcon,
  EmailIcon,
  MobileIcon,
  CloseIcon
} from '../../utils/icons';
import styles from './PsychologistPages.module.scss';

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  avatarInitials: string;
  status: 'active' | 'inactive' | 'completed';
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  lastSessionDate: string;
  nextSessionDate: string | null;
  therapyFocus: string;
  diagnosis?: string;
  notes: string;
  registeredDate: string;
}

export const PsychologistPatientsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'completed'>('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'sessions'>('overview');
  const [patientNotes, setPatientNotes] = useState<ProgressNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ProgressNote | null>(null);
  const [showNoteDetail, setShowNoteDetail] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = authService.getStoredUser();

  // Helper function to map API patient to UI patient
  const mapApiPatientToPatient = (apiPatient: ApiPatient): Patient => {
    const nameParts = apiPatient.name.split(' ');
    const initials = nameParts.length >= 2 
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : apiPatient.name.substring(0, 2).toUpperCase();
    
    const calculateAge = (dob?: string): number => {
      if (!dob) return 0;
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    return {
      id: apiPatient.id,
      name: apiPatient.name,
      email: apiPatient.email,
      phone: apiPatient.phone_number,
      dateOfBirth: apiPatient.date_of_birth || '',
      age: calculateAge(apiPatient.date_of_birth),
      gender: 'Unknown', // API doesn't provide this
      avatarInitials: initials,
      status: apiPatient.last_appointment ? 'active' : 'inactive' as 'active' | 'inactive' | 'completed',
      totalSessions: apiPatient.total_sessions,
      completedSessions: apiPatient.total_sessions,
      upcomingSessions: 0, // API doesn't provide this
      lastSessionDate: apiPatient.last_appointment || new Date().toISOString().split('T')[0],
      nextSessionDate: null, // API doesn't provide this
      therapyFocus: apiPatient.current_goals || 'General Therapy',
      diagnosis: undefined,
      notes: '',
      registeredDate: '' // API doesn't provide this
    };
  };

  // Fetch patients from API
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await progressNotesService.getPatients();
      // Map API patients to UI format
      const mappedPatients = response.results.map(mapApiPatientToPatient);
      setPatients(mappedPatients);
    } catch (err: any) {
      console.error('Failed to load patients:', err);
      setError(err.message || 'Failed to load patients');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toString().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const activePatients = patients.filter(p => p.status === 'active').length;
  const totalPatients = patients.length;
  const completedTherapies = patients.filter(p => p.status === 'completed').length;
  const totalSessionsThisMonth = patients.reduce((sum, p) => sum + p.completedSessions, 0);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'completed':
        return styles.statusCompleted;
      case 'inactive':
        return styles.statusInactive;
      default:
        return '';
    }
  };

  // Fetch notes when patient is selected and notes tab is active
  useEffect(() => {
    if (selectedPatient && activeTab === 'notes') {
      fetchPatientNotes(selectedPatient.id); // Now numeric ID
    }
  }, [selectedPatient, activeTab]);

  const fetchPatientNotes = async (patientId: number) => {
    try {
      setLoadingNotes(true);
      // API expects numeric ID (now we have it directly)
      const notes = await progressNotesService.getNotesByPatient(patientId);
      setPatientNotes(notes);
    } catch (err) {
      console.error('Failed to load patient notes:', err);
      setPatientNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
    setActiveTab('overview');
  };

  const handleWriteNoteForPatient = () => {
    setShowNoteForm(true);
  };

  const handleNoteFormClose = () => {
    setShowNoteForm(false);
    setSelectedNote(null); // Clear selected note after form closes
    if (selectedPatient) {
      fetchPatientNotes(selectedPatient.id);
    }
  };

  const formatNoteDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Layout user={user} isAuthenticated={true} className={styles.psychologistLayout}>
      <div className={styles.patientsContainer}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerText}>
                <h1 className={styles.pageTitle}>
                  <span className={styles.titleIcon}><UsersIcon size="lg" /></span>
                  My Patients
                </h1>
                <p className={styles.pageSubtitle}>
                  Manage your patient list and track therapy progress
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><UsersIcon size="xl" /></div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{activePatients}</div>
                <div className={styles.statLabel}>Active Patients</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><ChartIcon size="xl" /></div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{totalPatients}</div>
                <div className={styles.statLabel}>Total Patients</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><CheckCircleIcon size="xl" /></div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{completedTherapies}</div>
                <div className={styles.statLabel}>Completed</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><CalendarIcon size="xl" /></div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{totalSessionsThisMonth}</div>
                <div className={styles.statLabel}>Sessions This Month</div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className={styles.searchFilterSection}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}><SearchIcon size="md" /></span>
              <input
                type="text"
                placeholder="Search by name, email, or patient ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filterTabs}>
              <button
                className={statusFilter === 'all' ? styles.active : ''}
                onClick={() => setStatusFilter('all')}
              >
                All Patients
              </button>
              <button
                className={statusFilter === 'active' ? styles.active : ''}
                onClick={() => setStatusFilter('active')}
              >
                Active
              </button>
              <button
                className={statusFilter === 'inactive' ? styles.active : ''}
                onClick={() => setStatusFilter('inactive')}
              >
                Inactive
              </button>
              <button
                className={statusFilter === 'completed' ? styles.active : ''}
                onClick={() => setStatusFilter('completed')}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Patients List */}
          {loading ? (
            <div className={styles.loadingState}>
              <p>Loading patients...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <h3><WarningIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Error Loading Patients</h3>
              <p>{error}</p>
              <button className={styles.retryButton} onClick={fetchPatients}>
                Retry
              </button>
            </div>
          ) : (
          <div className={styles.patientsList}>
            {filteredPatients.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><SearchIcon size="2xl" /></div>
                <h3>No patients found</h3>
                <p>Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <div key={patient.id} className={styles.patientCard}>
                  <div className={styles.patientCardHeader}>
                    <div className={styles.patientInfo}>
                      <div className={styles.patientAvatar}>
                        {patient.avatarInitials}
                      </div>
                      <div className={styles.patientDetails}>
                        <h3 className={styles.patientName}>{patient.name}</h3>
                        <p className={styles.patientMeta}>
                          {patient.age} years • {patient.gender} • ID: {patient.id}
                        </p>
                      </div>
                    </div>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(patient.status)}`}>
                      {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                    </span>
                  </div>

                  <div className={styles.patientCardBody}>
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}><EmailIcon size="sm" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Email:</span>
                        <span className={styles.infoValue}>{patient.email}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}><MobileIcon size="sm" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Phone:</span>
                        <span className={styles.infoValue}>{patient.phone}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}><ChartIcon size="sm" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Focus:</span>
                        <span className={styles.infoValue}>{patient.therapyFocus}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}><CalendarIcon size="sm" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Registered:</span>
                        <span className={styles.infoValue}>{formatDate(patient.registeredDate)}</span>
                      </div>
                    </div>

                    <div className={styles.sessionStats}>
                      <div className={styles.sessionStat}>
                        <span className={styles.sessionStatValue}>{patient.completedSessions}</span>
                        <span className={styles.sessionStatLabel}>Completed</span>
                      </div>
                      <div className={styles.sessionStat}>
                        <span className={styles.sessionStatValue}>{patient.upcomingSessions}</span>
                        <span className={styles.sessionStatLabel}>Upcoming</span>
                      </div>
                      <div className={styles.sessionStat}>
                        <span className={styles.sessionStatValue}>{patient.totalSessions}</span>
                        <span className={styles.sessionStatLabel}>Total</span>
                      </div>
                    </div>

                    <div className={styles.dateInfo}>
                      <div className={styles.dateItem}>
                        <span className={styles.dateLabel}>Last Session:</span>
                        <span className={styles.dateValue}>{formatDate(patient.lastSessionDate)}</span>
                      </div>
                      {patient.nextSessionDate && (
                        <div className={styles.dateItem}>
                          <span className={styles.dateLabel}>Next Session:</span>
                          <span className={styles.dateValue}>{formatDate(patient.nextSessionDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.patientCardActions}>
                    <button 
                      className={styles.primaryButton}
                      onClick={() => handleViewDetails(patient)}
                    >
                      View Details
                    </button>
                    <button className={styles.secondaryButton}>
                      View Sessions
                    </button>
                    <button className={styles.secondaryButton}>
                      Schedule
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          )}
        </div>
      </div>

      {/* Patient Details Modal */}
      {showDetailsModal && selectedPatient && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Patient Details - {selectedPatient.name}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowDetailsModal(false)}
              >
                <CloseIcon size="md" />
              </button>
            </div>

            {/* Tabs */}
            <div className={styles.tabsContainer}>
              <button
                className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'notes' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                Progress Notes
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'sessions' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('sessions')}
              >
                Sessions
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <>
                  <div className={styles.patientDetailSection}>
                    <div className={styles.patientAvatar} style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 1rem' }}>
                      {selectedPatient.avatarInitials}
                    </div>
                    <h2 style={{ textAlign: 'center', margin: '0 0 0.5rem 0' }}>{selectedPatient.name}</h2>
                    <p style={{ textAlign: 'center', color: '#4a4b4a', marginBottom: '2rem' }}>
                      {selectedPatient.age} years • {selectedPatient.gender}
                    </p>
                  </div>

                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <strong>Email:</strong>
                      <span>{selectedPatient.email}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Phone:</strong>
                      <span>{selectedPatient.phone}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Date of Birth:</strong>
                      <span>{formatDate(selectedPatient.dateOfBirth)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Patient ID:</strong>
                      <span>{selectedPatient.id}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Registered:</strong>
                      <span>{formatDate(selectedPatient.registeredDate)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Status:</strong>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(selectedPatient.status)}`}>
                        {selectedPatient.status.charAt(0).toUpperCase() + selectedPatient.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {selectedPatient.diagnosis && (
                    <div className={styles.notesSection}>
                      <strong className={styles.notesLabel}>Diagnosis:</strong>
                      <p className={styles.notesText}>{selectedPatient.diagnosis}</p>
                    </div>
                  )}

                  <div className={styles.notesSection}>
                    <strong className={styles.notesLabel}>Therapy Focus:</strong>
                    <p className={styles.notesText}>{selectedPatient.therapyFocus}</p>
                  </div>

                  <div className={styles.notesSection}>
                    <strong className={styles.notesLabel}>Clinical Notes:</strong>
                    <p className={styles.notesText}>{selectedPatient.notes}</p>
                  </div>
                </>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div className={styles.notesTabContent}>
                  <div className={styles.notesTabHeader}>
                    <h4>Progress Notes History</h4>
                    <button 
                      className={styles.primaryButton}
                      onClick={handleWriteNoteForPatient}
                    >
                      + Write Note
                    </button>
                  </div>

                  {loadingNotes ? (
                    <div className={styles.loadingState}>
                      <p>Loading notes...</p>
                    </div>
                  ) : patientNotes.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>No progress notes for this patient yet.</p>
                      <button 
                        className={styles.primaryButton}
                        onClick={handleWriteNoteForPatient}
                      >
                        Write First Note
                      </button>
                    </div>
                  ) : (
                    <div className={styles.patientNotesList}>
                      {patientNotes.map((note) => (
                        <div 
                          key={note.id} 
                          className={styles.patientNoteCard}
                          onClick={() => {
                            setSelectedNote(note);
                            setShowNoteDetail(true);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className={styles.patientNoteHeader}>
                            <span className={styles.patientNoteSession}>
                              Session #{note.session_number}
                            </span>
                            <span className={styles.patientNoteRating}>
                              {note.progress_rating}/10
                            </span>
                          </div>
                          <div className={styles.patientNoteDate}>
                            {formatNoteDate(note.session_date)}
                          </div>
                          <div className={styles.patientNotePreview}>
                            <p><strong>S:</strong> {note.subjective.substring(0, 100)}...</p>
                            <p><strong>A:</strong> {note.assessment.substring(0, 100)}...</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sessions Tab */}
              {activeTab === 'sessions' && (
                <div className={styles.sessionsTabContent}>
                  <h4>Session History</h4>
                  <div className={styles.placeholder}>
                    <p>Completed: {selectedPatient.completedSessions}</p>
                    <p>Upcoming: {selectedPatient.upcomingSessions}</p>
                    <p>Total: {selectedPatient.totalSessions}</p>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.secondaryButton}
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Form Modal */}
      {showNoteForm && selectedPatient && (
        <div className={styles.modalOverlay} onClick={handleNoteFormClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={handleNoteFormClose}>
              <CloseIcon size="md" />
            </button>
            <SOAPNoteForm
              patientId={selectedPatient.id}
              noteId={selectedNote?.id}
              onSave={handleNoteFormClose}
              onCancel={handleNoteFormClose}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* Note Detail Modal */}
      {showNoteDetail && selectedNote && (
        <div className={styles.modalOverlay} onClick={() => setShowNoteDetail(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className={styles.modalHeader}>
              <h3>Progress Note - Session #{selectedNote.session_number}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowNoteDetail(false)}
              >
                <CloseIcon size="md" />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.noteDetailMeta}>
                <p><strong>Patient:</strong> {selectedNote.patient_name}</p>
                <p><strong>Date:</strong> {formatNoteDate(selectedNote.session_date)}</p>
                <p><strong>Session Number:</strong> {selectedNote.session_number}</p>
                <p><strong>Duration:</strong> {selectedNote.session_duration} minutes</p>
                <p><strong>Progress Rating:</strong> {selectedNote.progress_rating}/10</p>
              </div>
              <div className={styles.soapFull}>
                <div className={styles.soapFullSection}>
                  <h4>Subjective (S)</h4>
                  <p>{selectedNote.subjective}</p>
                </div>
                <div className={styles.soapFullSection}>
                  <h4>Objective (O)</h4>
                  <p>{selectedNote.objective}</p>
                </div>
                <div className={styles.soapFullSection}>
                  <h4>Assessment (A)</h4>
                  <p>{selectedNote.assessment}</p>
                </div>
                <div className={styles.soapFullSection}>
                  <h4>Plan (P)</h4>
                  <p>{selectedNote.plan}</p>
                </div>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button 
                className={styles.secondaryButton}
                onClick={() => {
                  setShowNoteDetail(false);
                  // Keep selectedNote for editing, form will use noteId
                  setShowNoteForm(true);
                }}
              >
                Edit Note
              </button>
              <button 
                className={styles.secondaryButton}
                onClick={() => setShowNoteDetail(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

