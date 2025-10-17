import { useState } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import styles from './PsychologistPages.module.scss';

interface Patient {
  id: string;
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

  const user = {
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

  // Mock patients data
  const mockPatients: Patient[] = [
    {
      id: 'pat-001',
      name: 'Alice Smith',
      email: 'alice.smith@example.com',
      phone: '+61 400 123 456',
      dateOfBirth: '1990-05-15',
      age: 34,
      gender: 'Female',
      avatarInitials: 'AS',
      status: 'active',
      totalSessions: 12,
      completedSessions: 8,
      upcomingSessions: 2,
      lastSessionDate: '2024-07-20',
      nextSessionDate: '2024-07-27',
      therapyFocus: 'Anxiety Management',
      diagnosis: 'Generalized Anxiety Disorder',
      notes: 'Making good progress with CBT techniques. Patient is receptive and engaged.',
      registeredDate: '2024-04-15'
    },
    {
      id: 'pat-002',
      name: 'Bob Johnson',
      email: 'bob.j@example.com',
      phone: '+61 400 234 567',
      dateOfBirth: '1985-08-22',
      age: 39,
      gender: 'Male',
      avatarInitials: 'BJ',
      status: 'active',
      totalSessions: 20,
      completedSessions: 18,
      upcomingSessions: 1,
      lastSessionDate: '2024-07-22',
      nextSessionDate: '2024-07-29',
      therapyFocus: 'Couples Therapy',
      notes: 'Working through communication issues. Both partners showing improvement.',
      registeredDate: '2024-02-10'
    },
    {
      id: 'pat-003',
      name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      phone: '+61 400 345 678',
      dateOfBirth: '1995-12-03',
      age: 28,
      gender: 'Male',
      avatarInitials: 'CB',
      status: 'active',
      totalSessions: 6,
      completedSessions: 5,
      upcomingSessions: 1,
      lastSessionDate: '2024-07-18',
      nextSessionDate: '2024-07-28',
      therapyFocus: 'Depression & Stress Management',
      diagnosis: 'Major Depressive Disorder',
      notes: 'Responded well to initial sessions. Implementing coping strategies.',
      registeredDate: '2024-06-01'
    },
    {
      id: 'pat-004',
      name: 'Diana Prince',
      email: 'diana.p@example.com',
      phone: '+61 400 456 789',
      dateOfBirth: '1988-03-10',
      age: 36,
      gender: 'Female',
      avatarInitials: 'DP',
      status: 'completed',
      totalSessions: 16,
      completedSessions: 16,
      upcomingSessions: 0,
      lastSessionDate: '2024-06-15',
      nextSessionDate: null,
      therapyFocus: 'Trauma Recovery',
      diagnosis: 'PTSD',
      notes: 'Successfully completed treatment plan. Patient achieved therapy goals.',
      registeredDate: '2024-01-20'
    },
    {
      id: 'pat-005',
      name: 'Emma Watson',
      email: 'emma.w@example.com',
      phone: '+61 400 567 890',
      dateOfBirth: '1992-04-18',
      age: 32,
      gender: 'Female',
      avatarInitials: 'EW',
      status: 'inactive',
      totalSessions: 4,
      completedSessions: 4,
      upcomingSessions: 0,
      lastSessionDate: '2024-05-10',
      nextSessionDate: null,
      therapyFocus: 'Work-Life Balance',
      notes: 'Patient cancelled upcoming sessions. Follow-up required.',
      registeredDate: '2024-04-01'
    }
  ];

  // Filter patients
  const filteredPatients = mockPatients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const activePatients = mockPatients.filter(p => p.status === 'active').length;
  const totalPatients = mockPatients.length;
  const completedTherapies = mockPatients.filter(p => p.status === 'completed').length;
  const totalSessionsThisMonth = mockPatients.reduce((sum, p) => sum + p.completedSessions, 0);

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

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
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
                  <span className={styles.titleIcon}>👥</span>
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
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{activePatients}</div>
                <div className={styles.statLabel}>Active Patients</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{totalPatients}</div>
                <div className={styles.statLabel}>Total Patients</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{completedTherapies}</div>
                <div className={styles.statLabel}>Completed</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{totalSessionsThisMonth}</div>
                <div className={styles.statLabel}>Sessions This Month</div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className={styles.searchFilterSection}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>🔍</span>
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
          <div className={styles.patientsList}>
            {filteredPatients.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔍</div>
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
                        <span className={styles.infoLabel}>📧 Email:</span>
                        <span className={styles.infoValue}>{patient.email}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>📱 Phone:</span>
                        <span className={styles.infoValue}>{patient.phone}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>🎯 Focus:</span>
                        <span className={styles.infoValue}>{patient.therapyFocus}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>📅 Registered:</span>
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
        </div>
      </div>

      {/* Patient Details Modal */}
      {showDetailsModal && selectedPatient && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Patient Details</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowDetailsModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.patientDetailSection}>
                <div className={styles.patientAvatar} style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 1rem' }}>
                  {selectedPatient.avatarInitials}
                </div>
                <h2 style={{ textAlign: 'center', margin: '0 0 0.5rem 0' }}>{selectedPatient.name}</h2>
                <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>
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
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.secondaryButton}
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
              <button className={styles.primaryButton}>
                View Full History
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

