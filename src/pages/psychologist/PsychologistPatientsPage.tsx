import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { progressNotesService, type Patient as ApiPatient } from '../../services/api/progressNotes';
import { authService } from '../../services/api/auth';
import {
  UsersIcon,
  ChartIcon,
  CheckCircleIcon,
  CalendarIcon,
  SearchIcon,
  WarningIcon,
  EmailIcon,
  MobileIcon,
} from '../../utils/icons';
import styles from './PsychologistPages.module.scss';
import shell from '../patient/PatientShellChrome.module.scss';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

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
  registeredDate: string;
}

function mapApiPatientToPatient(apiPatient: ApiPatient): Patient {
  const p = apiPatient as ApiPatient & Record<string, unknown>;
  const nameParts = apiPatient.name.split(' ');
  const initials =
    nameParts.length >= 2
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

  const dob = apiPatient.date_of_birth || '';
  const statusRaw = (p.status as string) || 'inactive';
  const status: 'active' | 'inactive' | 'completed' =
    statusRaw === 'active' || statusRaw === 'completed' || statusRaw === 'inactive' ? statusRaw : 'inactive';

  const totalSessions =
    typeof apiPatient.total_sessions === 'number'
      ? apiPatient.total_sessions
      : typeof p.totalSessions === 'number'
        ? (p.totalSessions as number)
        : 0;
  const completedSessions =
    typeof p.completed_sessions === 'number'
      ? (p.completed_sessions as number)
      : typeof p.completedSessions === 'number'
        ? (p.completedSessions as number)
        : 0;
  const upcomingSessions =
    typeof p.upcoming_sessions === 'number'
      ? (p.upcoming_sessions as number)
      : typeof p.upcomingSessions === 'number'
        ? (p.upcomingSessions as number)
        : 0;

  const lastSessionDate =
    (p.last_session_date as string) ||
    (p.lastSessionDate as string) ||
    (p.last_appointment as string) ||
    (p.lastAppointment as string) ||
    '';
  const nextRaw = (p.next_appointment as string) || (p.nextAppointment as string) || null;

  const therapyFocus =
    (p.therapy_goals as string) ||
    (p.therapyFocus as string) ||
    apiPatient.current_goals ||
    '—';

  const registeredDate =
    (p.registered_date as string) || (p.registeredDate as string) || '';

  const gender =
    (p.gender_identity as string) || (p.gender as string) || (apiPatient as { gender?: string }).gender || '—';

  return {
    id: apiPatient.id,
    name: apiPatient.name,
    email: apiPatient.email,
    phone: apiPatient.phone_number,
    dateOfBirth: dob,
    age: calculateAge(dob || undefined),
    gender,
    avatarInitials: initials,
    status,
    totalSessions,
    completedSessions,
    upcomingSessions,
    lastSessionDate,
    nextSessionDate: nextRaw,
    therapyFocus,
    registeredDate,
  };
}

export const PsychologistPatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'completed'>('all');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = authService.getStoredUser();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await progressNotesService.getPatients();
      const mappedPatients = response.results.map(mapApiPatientToPatient);
      setPatients(mappedPatients);
    } catch (err: unknown) {
      console.error('Failed to load patients:', err);
      const msg = err instanceof Error ? err.message : 'Failed to load patients';
      setError(msg);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toString().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activePatients = patients.filter((p) => p.status === 'active').length;
  const totalPatients = patients.length;
  const completedTherapies = patients.filter((p) => p.status === 'completed').length;
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const goToProfile = (patientId: number) => {
    navigate(`/psychologist/patients/${patientId}`);
  };

  return (
    <Layout user={user} isAuthenticated className={styles.psychologistLayout}>
      <div className={styles.patientsContainer}>
        <div className={shell.wrap}>
          <header className={shell.pageHeader}>
            <h1 className={shell.welcomeTitle}>My patients</h1>
            <p className={shell.welcomeSubtitle}>
              Patients linked through your appointments or progress notes. Open a profile for full details and PDF
              export.
            </p>
          </header>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <UsersIcon size="xl" />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{activePatients}</div>
                <div className={styles.statLabel}>Active Patients</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <ChartIcon size="xl" />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{totalPatients}</div>
                <div className={styles.statLabel}>Total Patients</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <CheckCircleIcon size="xl" />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{completedTherapies}</div>
                <div className={styles.statLabel}>Completed</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <CalendarIcon size="xl" />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{totalSessionsThisMonth}</div>
                <div className={styles.statLabel}>Completed sessions (sum)</div>
              </div>
            </div>
          </div>

          <div className={styles.searchFilterSection}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>
                <SearchIcon size="md" />
              </span>
              <Input
                type="text"
                placeholder="Search by name, email, or patient ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filterTabs}>
              <Button
                type="button"
                className={statusFilter === 'all' ? styles.active : ''}
                onClick={() => setStatusFilter('all')}
              >
                All Patients
              </Button>
              <Button
                type="button"
                className={statusFilter === 'active' ? styles.active : ''}
                onClick={() => setStatusFilter('active')}
              >
                Active
              </Button>
              <Button
                type="button"
                className={statusFilter === 'inactive' ? styles.active : ''}
                onClick={() => setStatusFilter('inactive')}
              >
                Inactive
              </Button>
              <Button
                type="button"
                className={statusFilter === 'completed' ? styles.active : ''}
                onClick={() => setStatusFilter('completed')}
              >
                Completed
              </Button>
            </div>
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <p>Loading patients...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <h3>
                <WarningIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Error Loading Patients
              </h3>
              <p>{error}</p>
              <Button className={styles.retryButton} onClick={fetchPatients}>
                Retry
              </Button>
            </div>
          ) : (
            <div className={styles.patientsList}>
              {filteredPatients.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <SearchIcon size="2xl" />
                  </div>
                  <h3>No patients found</h3>
                  <p>Try adjusting your search or filter criteria.</p>
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <div key={patient.id} className={styles.patientCard}>
                    <div
                      className={styles.patientCardHeader}
                      onClick={() => goToProfile(patient.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          goToProfile(patient.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles.patientInfo}>
                        <div className={styles.patientAvatar}>{patient.avatarInitials}</div>
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
                          <span className={styles.infoLabel}>
                            <EmailIcon size="sm" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Email:
                          </span>
                          <span className={styles.infoValue}>{patient.email}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>
                            <MobileIcon size="sm" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Phone:
                          </span>
                          <span className={styles.infoValue}>{patient.phone}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>
                            <ChartIcon size="sm" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Focus:
                          </span>
                          <span className={styles.infoValue}>{patient.therapyFocus}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>
                            <CalendarIcon size="sm" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Registered:
                          </span>
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
                          <span className={styles.sessionStatLabel}>Notes</span>
                        </div>
                      </div>

                      <div className={styles.dateInfo}>
                        <div className={styles.dateItem}>
                          <span className={styles.dateLabel}>Last session / note:</span>
                          <span className={styles.dateValue}>{formatDate(patient.lastSessionDate)}</span>
                        </div>
                        {patient.nextSessionDate && (
                          <div className={styles.dateItem}>
                            <span className={styles.dateLabel}>Next session:</span>
                            <span className={styles.dateValue}>{formatDate(patient.nextSessionDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.patientCardActions}>
                      <Button type="button" className={styles.primaryButton} onClick={() => goToProfile(patient.id)}>
                        Open profile
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
