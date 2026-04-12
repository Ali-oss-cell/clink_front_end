import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { SOAPNoteForm } from '../../components/psychologist/SOAPNoteForm';
import { progressNotesService, type ProgressNote } from '../../services/api/progressNotes';
import { authService } from '../../services/api/auth';
import { Button } from '../../components/ui/button';
import {
  CloseIcon,
  WarningIcon,
  CalendarIcon,
  ChartIcon,
  EmailIcon,
  MobileIcon,
} from '../../utils/icons';
import styles from './PsychologistPages.module.scss';
import shell from '../patient/PatientShellChrome.module.scss';

type PatientDetail = {
  patient: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    date_of_birth: string | null;
    age?: number;
    address: {
      line_1: string | null;
      suburb: string | null;
      state: string | null;
      postcode: string | null;
    };
    medicare_number?: string | null;
    is_verified: boolean;
    created_at: string;
  };
  profile: {
    preferred_name?: string | null;
    gender_identity?: string | null;
    pronouns?: string | null;
    emergency_contact?: {
      name?: string | null;
      relationship?: string | null;
      phone?: string | null;
    };
    referral_info?: {
      source?: string | null;
      has_gp_referral?: boolean;
      gp_name?: string | null;
    };
    intake_completed?: boolean;
    presenting_concerns?: string | null;
    therapy_goals?: string | null;
  } | null;
  statistics: {
    total_appointments: number;
    completed_appointments: number;
    cancelled_appointments: number;
    progress_notes_count: number;
    last_appointment_date: string | null;
  };
  next_appointment: {
    id: number;
    appointment_date: string;
    psychologist_name: string;
    service_name: string | null;
    status: string;
    duration_minutes: number;
  } | null;
  appointment_history: {
    id: number;
    appointment_date: string;
    psychologist_name: string;
    service_name: string;
    status: string;
    duration_minutes: number;
    notes: string;
  }[];
  recent_progress: {
    id: number;
    session_date: string;
    session_number: number;
    psychologist_name: string;
    progress_rating: number | null;
    subjective: string;
    created_at: string;
  }[];
};

export const PsychologistPatientProfilePage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const user = authService.getStoredUser();
  const idNum = patientId ? parseInt(patientId, 10) : NaN;

  const [detail, setDetail] = useState<PatientDetail | null>(null);
  const [notes, setNotes] = useState<ProgressNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'notes'>('overview');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ProgressNote | null>(null);

  const loadDetail = useCallback(async () => {
    if (!Number.isFinite(idNum)) {
      setError('Invalid patient ID.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await progressNotesService.getPatientDetails(idNum);
      setDetail(data as PatientDetail);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load patient.';
      setError(msg);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [idNum]);

  const loadNotes = useCallback(async () => {
    if (!Number.isFinite(idNum)) return;
    try {
      setNotesLoading(true);
      const list = await progressNotesService.getNotesByPatient(idNum);
      setNotes(list);
    } catch {
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  }, [idNum]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    if (activeTab === 'notes' && Number.isFinite(idNum)) {
      loadNotes();
    }
  }, [activeTab, idNum, loadNotes]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleDownloadPdf = async () => {
    if (!Number.isFinite(idNum)) return;
    try {
      setPdfLoading(true);
      await progressNotesService.downloadPatientRecordPdf(idNum);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Download failed.';
      setError(msg);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleNoteFormClose = () => {
    setShowNoteForm(false);
    setSelectedNote(null);
    loadNotes();
    loadDetail();
  };

  return (
    <Layout user={user} isAuthenticated className={styles.psychologistLayout}>
      <div className={styles.patientsContainer}>
        <div className={shell.wrap}>
          <div className={shell.pageHeader} style={{ alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <Link to="/psychologist/patients" className={styles.secondaryButton} style={{ display: 'inline-block', marginBottom: '0.75rem', textDecoration: 'none' }}>
                ← Back to patients
              </Link>
              <h1 className={shell.welcomeTitle}>
                {detail?.patient?.name ?? 'Patient profile'}
              </h1>
              <p className={shell.welcomeSubtitle}>
                Demographics, appointments, and progress notes for your caseload
              </p>
            </div>
            <Button
              type="button"
              className={styles.primaryButton}
              disabled={pdfLoading || !Number.isFinite(idNum) || !!error}
              onClick={handleDownloadPdf}
            >
              {pdfLoading ? 'Preparing PDF…' : 'Download full record (PDF)'}
            </Button>
          </div>

          {loading && <p>Loading…</p>}
          {error && !loading && (
            <div className={styles.errorState}>
              <h3>
                <WarningIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                {error}
              </h3>
              <Button className={styles.retryButton} onClick={loadDetail}>
                Retry
              </Button>
            </div>
          )}

          {detail && !loading && (
            <>
              <div className={styles.tabsContainer} style={{ marginTop: '1.5rem' }}>
                <Button
                  type="button"
                  className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </Button>
                <Button
                  type="button"
                  className={`${styles.tab} ${activeTab === 'appointments' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('appointments')}
                >
                  Appointments
                </Button>
                <Button
                  type="button"
                  className={`${styles.tab} ${activeTab === 'notes' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('notes')}
                >
                  Progress notes
                </Button>
              </div>

              {activeTab === 'overview' && (
                <div className={styles.modalBody} style={{ maxWidth: 'none', padding: '1.5rem 0' }}>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <strong>Email</strong>
                      <span>
                        <EmailIcon size="sm" style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        {detail.patient.email || '—'}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Phone</strong>
                      <span>
                        <MobileIcon size="sm" style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        {detail.patient.phone_number || '—'}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Date of birth</strong>
                      <span>{formatDate(detail.patient.date_of_birth ?? undefined)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Patient ID</strong>
                      <span>{detail.patient.id}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Address</strong>
                      <span>
                        {[detail.patient.address?.line_1, detail.patient.address?.suburb, detail.patient.address?.state, detail.patient.address?.postcode]
                          .filter(Boolean)
                          .join(', ') || '—'}
                      </span>
                    </div>
                    {detail.patient.medicare_number && (
                      <div className={styles.detailItem}>
                        <strong>Medicare</strong>
                        <span>{detail.patient.medicare_number}</span>
                      </div>
                    )}
                  </div>

                  {detail.profile && (
                    <div className={styles.notesSection} style={{ marginTop: '1.5rem' }}>
                      <strong className={styles.notesLabel}>Intake &amp; goals</strong>
                      {detail.profile.preferred_name && (
                        <p className={styles.notesText}>Preferred name: {detail.profile.preferred_name}</p>
                      )}
                      {detail.profile.gender_identity && (
                        <p className={styles.notesText}>Gender identity: {detail.profile.gender_identity}</p>
                      )}
                      {detail.profile.pronouns && (
                        <p className={styles.notesText}>Pronouns: {detail.profile.pronouns}</p>
                      )}
                      {detail.profile.presenting_concerns && (
                        <p className={styles.notesText}>Presenting concerns: {detail.profile.presenting_concerns}</p>
                      )}
                      {detail.profile.therapy_goals && (
                        <p className={styles.notesText}>Therapy goals: {detail.profile.therapy_goals}</p>
                      )}
                      {detail.profile.emergency_contact?.name && (
                        <p className={styles.notesText}>
                          Emergency: {detail.profile.emergency_contact.name}
                          {detail.profile.emergency_contact.relationship ? ` (${detail.profile.emergency_contact.relationship})` : ''}
                          {detail.profile.emergency_contact.phone ? ` — ${detail.profile.emergency_contact.phone}` : ''}
                        </p>
                      )}
                    </div>
                  )}

                  <div className={styles.statsGrid} style={{ marginTop: '1.5rem' }}>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>
                        <CalendarIcon size="xl" />
                      </div>
                      <div className={styles.statContent}>
                        <div className={styles.statValue}>{detail.statistics.total_appointments}</div>
                        <div className={styles.statLabel}>Appointments (with you)</div>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>
                        <ChartIcon size="xl" />
                      </div>
                      <div className={styles.statContent}>
                        <div className={styles.statValue}>{detail.statistics.progress_notes_count}</div>
                        <div className={styles.statLabel}>Your progress notes</div>
                      </div>
                    </div>
                  </div>

                  {detail.next_appointment && (
                    <div className={styles.notesSection} style={{ marginTop: '1rem' }}>
                      <strong className={styles.notesLabel}>Next appointment</strong>
                      <p className={styles.notesText}>
                        {formatDateTime(detail.next_appointment.appointment_date)} — {detail.next_appointment.service_name || 'Session'} (
                        {detail.next_appointment.status})
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'appointments' && (
                <div style={{ padding: '1.5rem 0' }}>
                  {detail.appointment_history.length === 0 ? (
                    <p>No appointments in your caseload for this patient.</p>
                  ) : (
                    <ul className={styles.patientNotesList} style={{ listStyle: 'none', padding: 0 }}>
                      {detail.appointment_history.map((apt) => (
                        <li key={apt.id} className={styles.patientNoteCard} style={{ marginBottom: '0.75rem' }}>
                          <div className={styles.patientNoteHeader}>
                            <span>{formatDateTime(apt.appointment_date)}</span>
                            <span className={styles.patientNoteRating}>{apt.status}</span>
                          </div>
                          <div className={styles.patientNoteDate}>{apt.service_name}</div>
                          {apt.notes ? <p className={styles.notesText}>{apt.notes}</p> : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className={styles.notesTabContent} style={{ padding: '1.5rem 0' }}>
                  <div className={styles.notesTabHeader}>
                    <h4>Progress notes</h4>
                    <Button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => {
                        setSelectedNote(null);
                        setShowNoteForm(true);
                      }}
                    >
                      + Write note
                    </Button>
                  </div>
                  {notesLoading ? (
                    <p>Loading notes…</p>
                  ) : notes.length === 0 ? (
                    <p>No progress notes yet. Add the first note for this patient.</p>
                  ) : (
                    <div className={styles.patientNotesList}>
                      {notes.map((note) => (
                        <div key={note.id} className={styles.patientNoteCard}>
                          <div className={styles.patientNoteHeader}>
                            <span className={styles.patientNoteSession}>Session #{note.session_number}</span>
                            <span className={styles.patientNoteRating}>{note.progress_rating}/10</span>
                          </div>
                          <div className={styles.patientNoteDate}>{formatDateTime(note.session_date)}</div>
                          <div className={styles.patientNotePreview}>
                            <p>
                              <strong>S:</strong> {note.subjective.slice(0, 120)}
                              {note.subjective.length > 120 ? '…' : ''}
                            </p>
                          </div>
                          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <Button
                              type="button"
                              className={styles.secondaryButton}
                              onClick={() => {
                                setSelectedNote(note);
                                setShowNoteForm(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              className={styles.secondaryButton}
                              onClick={() => progressNotesService.downloadNotePdf(note.id)}
                            >
                              PDF
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showNoteForm && Number.isFinite(idNum) && (
        <div className={styles.modalOverlay} onClick={handleNoteFormClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Button type="button" className={styles.modalClose} onClick={handleNoteFormClose}>
              <CloseIcon size="md" />
            </Button>
            <SOAPNoteForm
              patientId={idNum}
              noteId={selectedNote?.id}
              onSave={handleNoteFormClose}
              onCancel={handleNoteFormClose}
              isModal
            />
          </div>
        </div>
      )}
    </Layout>
  );
};
