import { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { SOAPNoteForm } from '../../components/psychologist/SOAPNoteForm';
import { progressNotesService, type Patient } from '../../services/api/progressNotes';
import { authService } from '../../services/api/auth';
import type { ProgressNote } from '../../types/progressNote';
import {
  NotesIcon,
  SearchIcon,
  WarningIcon,
  EyeIcon,
  ClipboardIcon,
  CloseIcon,
  DownloadIcon,
} from '../../utils/icons';
import styles from './PsychologistPages.module.scss';
import shell from '../patient/PatientShellChrome.module.scss';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

function patientInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || '—';
}

export const PsychologistNotesPage: React.FC = () => {
  const [notes, setNotes] = useState<ProgressNote[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [patientDirectoryQuery, setPatientDirectoryQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPhase, setDrawerPhase] = useState<'pick' | 'compose'>('pick');
  const [drawerPatientId, setDrawerPatientId] = useState<number | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

  const [selectedNote, setSelectedNote] = useState<ProgressNote | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
  const [pdfLoadingNoteId, setPdfLoadingNoteId] = useState<number | null>(null);

  const user = authService.getStoredUser();

  const fetchPatients = useCallback(async () => {
    try {
      const response = await progressNotesService.getPatients();
      setPatients(response.results || []);
    } catch (err) {
      console.error('Failed to load patients:', err);
      setPatients([]);
    }
  }, []);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = selectedPatient ? { patient_id: selectedPatient } : {};
      const response = await progressNotesService.listNotes(params);
      setNotes(response.results || []);
    } catch (err: unknown) {
      console.error('Failed to load notes:', err);
      const msg = err instanceof Error ? err.message : 'Failed to load progress notes';
      setError(msg);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPatient]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const patientsInDirectory = useMemo(() => {
    const q = patientDirectoryQuery.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const email = (p.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [patients, patientDirectoryQuery]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerPhase('pick');
    setDrawerPatientId(null);
    setSelectedNoteId(null);
  };

  const handleCreateNote = () => {
    setSelectedNoteId(null);
    if (selectedPatient) {
      setDrawerPatientId(selectedPatient);
      setDrawerPhase('compose');
    } else {
      setDrawerPatientId(null);
      setDrawerPhase('pick');
    }
    setDrawerOpen(true);
  };

  const handleEditNote = (noteId: number) => {
    setSelectedNoteId(noteId);
    setDrawerPatientId(null);
    setDrawerPhase('compose');
    setDrawerOpen(true);
  };

  const handleViewNote = (note: ProgressNote) => {
    setSelectedNote(note);
  };

  const handleCloseNote = () => {
    setSelectedNote(null);
  };

  const handleSaveNote = (_note: ProgressNote) => {
    closeDrawer();
    fetchNotes();
  };

  const handleDeleteClick = (noteId: number) => {
    setNoteToDelete(noteId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;

    try {
      await progressNotesService.deleteNote(noteToDelete);
      setNotes(notes.filter((n) => n.id !== noteToDelete));
      setShowDeleteConfirm(false);
      setNoteToDelete(null);
    } catch (err: unknown) {
      console.error('Failed to delete note:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to delete note: ${msg}`);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setNoteToDelete(null);
  };

  const handleDownloadPdf = async (noteId: number) => {
    try {
      setPdfLoadingNoteId(noteId);
      await progressNotesService.downloadNotePdf(noteId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to download PDF';
      alert(message);
    } finally {
      setPdfLoadingNoteId(null);
    }
  };

  const filteredNotes = notes.filter((note) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.patient_name.toLowerCase().includes(query) ||
      note.subjective.toLowerCase().includes(query) ||
      note.assessment.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const selectedPatientName = selectedPatient
    ? patients.find((p) => p.id === selectedPatient)?.name
    : null;

  const formComposerKey = `${selectedNoteId ?? 'new'}-${drawerPatientId ?? 0}-${drawerPhase}`;

  return (
    <Layout user={user} isAuthenticated className={styles.psychologistLayout}>
      <div className={styles.notesContainer}>
        <div className={shell.wrap}>
          <header className={shell.pageHeader}>
            <div className={styles.shellHeaderRow}>
              <div>
                <h1 className={shell.welcomeTitle}>Progress notes</h1>
                <p className={shell.welcomeSubtitle}>
                  Pick a patient in the directory, then review or add SOAP notes. Session transcripts and AI assists
                  appear on the patient profile under Sessions &amp; AI.
                </p>
              </div>
              <Button type="button" className={styles.primaryButton} onClick={handleCreateNote}>
                + New note
              </Button>
            </div>
          </header>

          <div className={styles.notesWorkspace}>
            <aside className={styles.notesPatientDirectory} aria-label="Patient directory">
              <p className={styles.notesPatientDirectoryTitle}>Your patients</p>
              <button
                type="button"
                className={`${styles.notesPatientRow} ${selectedPatient === null ? styles.notesPatientRowActive : ''}`}
                onClick={() => setSelectedPatient(null)}
              >
                <span className={styles.notesPatientRowInitials}>All</span>
                <div className={styles.notesPatientRowMeta}>
                  <div className={styles.notesPatientRowName}>Full caseload</div>
                  <div className={styles.notesPatientRowEmail}>All notes</div>
                </div>
              </button>
              <div className={styles.notesPatientDirectorySearch}>
                <div className={styles.notesPatientDirectoryField}>
                  <SearchIcon size="sm" aria-hidden />
                  <input
                    type="search"
                    value={patientDirectoryQuery}
                    onChange={(e) => setPatientDirectoryQuery(e.target.value)}
                    placeholder="Filter by name or email…"
                    aria-label="Filter patients"
                  />
                </div>
              </div>
              <ul className={styles.notesPatientDirectoryList}>
                {patientsInDirectory.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className={`${styles.notesPatientRow} ${selectedPatient === p.id ? styles.notesPatientRowActive : ''}`}
                      onClick={() => setSelectedPatient(p.id)}
                    >
                      <span className={styles.notesPatientRowInitials}>{patientInitials(p.name)}</span>
                      <div className={styles.notesPatientRowMeta}>
                        <div className={styles.notesPatientRowName}>{p.name}</div>
                        <div className={styles.notesPatientRowEmail}>{p.email || '—'}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            <div className={styles.notesMainColumn}>
              <div className={styles.searchFilterSection} style={{ marginTop: 0 }}>
                <div className={styles.searchField}>
                  <span className={styles.searchIconWrap} aria-hidden>
                    <SearchIcon size="md" />
                  </span>
                  <Input
                    type="search"
                    placeholder="Search loaded notes by patient or SOAP text…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInputInner}
                    aria-label="Search notes"
                  />
                </div>
                {selectedPatientName && (
                  <p className={shell.welcomeSubtitle} style={{ margin: '0.25rem 0 0' }}>
                    Showing notes for <strong>{selectedPatientName}</strong>
                  </p>
                )}
              </div>

              {loading ? (
                <div className={styles.loadingState}>
                  <p>Loading notes...</p>
                </div>
              ) : error ? (
                <div className={styles.errorState}>
                  <h3>
                    <WarningIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Error loading
                    notes
                  </h3>
                  <p>{error}</p>
                  <Button type="button" className={styles.retryButton} onClick={fetchNotes}>
                    Retry
                  </Button>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <NotesIcon size="2xl" />
                  </div>
                  <h3>No progress notes found</h3>
                  <p>
                    {searchQuery || selectedPatient
                      ? 'Try adjusting search or choose another patient in the directory.'
                      : 'Create a note to start documenting sessions.'}
                  </p>
                  <Button type="button" className={styles.primaryButton} onClick={handleCreateNote}>
                    + Create note
                  </Button>
                </div>
              ) : (
                <div className={styles.notesList} style={{ paddingTop: '0.5rem' }}>
                  {filteredNotes.map((note) => (
                    <div key={note.id} className={styles.noteCard}>
                      <div className={styles.noteHeader}>
                        <div className={styles.noteInfo}>
                          <h3 className={styles.noteTitle}>
                            Session #{note.session_number} — {note.patient_name}
                          </h3>
                          <div className={styles.noteMeta}>
                            {formatDate(note.session_date)} • {formatTime(note.session_date)}
                          </div>
                        </div>
                        <div className={styles.noteRating}>
                          <span className={styles.ratingLabel}>Rating:</span>
                          <span className={styles.ratingValue}>{note.progress_rating}/10</span>
                        </div>
                      </div>

                      <div className={styles.noteContent}>
                        <div className={styles.soapPreview}>
                          <div className={styles.soapItem}>
                            <span className={styles.soapLabel}>
                              <NotesIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> S:
                            </span>
                            <span className={styles.soapText}>
                              {note.subjective.substring(0, 100)}
                              {note.subjective.length > 100 ? '...' : ''}
                            </span>
                          </div>
                          <div className={styles.soapItem}>
                            <span className={styles.soapLabel}>
                              <EyeIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> O:
                            </span>
                            <span className={styles.soapText}>
                              {note.objective.substring(0, 100)}
                              {note.objective.length > 100 ? '...' : ''}
                            </span>
                          </div>
                          <div className={styles.soapItem}>
                            <span className={styles.soapLabel}>
                              <SearchIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> A:
                            </span>
                            <span className={styles.soapText}>
                              {note.assessment.substring(0, 100)}
                              {note.assessment.length > 100 ? '...' : ''}
                            </span>
                          </div>
                          <div className={styles.soapItem}>
                            <span className={styles.soapLabel}>
                              <ClipboardIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> P:
                            </span>
                            <span className={styles.soapText}>
                              {note.plan.substring(0, 100)}
                              {note.plan.length > 100 ? '...' : ''}
                            </span>
                          </div>
                        </div>

                        <div className={styles.noteFooter}>
                          <span className={styles.noteDuration}>Duration: {note.session_duration} min</span>
                          <span className={styles.noteDate}>Created: {formatDate(note.created_at)}</span>
                        </div>
                      </div>

                      <div className={styles.noteActions}>
                        <Button type="button" className={styles.viewButton} onClick={() => handleViewNote(note)}>
                          View full
                        </Button>
                        <Button
                          type="button"
                          className={styles.secondaryButton}
                          disabled={pdfLoadingNoteId === note.id}
                          onClick={() => handleDownloadPdf(note.id)}
                        >
                          <DownloadIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                          {pdfLoadingNoteId === note.id ? 'Downloading…' : 'Download PDF'}
                        </Button>
                        <Button type="button" className={styles.editButton} onClick={() => handleEditNote(note.id)}>
                          Edit
                        </Button>
                        <Button type="button" className={styles.deleteButton} onClick={() => handleDeleteClick(note.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <>
          <div
            className={styles.notesDrawerBackdrop}
            onClick={closeDrawer}
            onKeyDown={(e) => e.key === 'Escape' && closeDrawer()}
            role="presentation"
            aria-hidden
          />
          <aside
            className={styles.notesComposerDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notes-drawer-title"
          >
            <div className={styles.notesDrawerTopBar}>
              <div>
                <h2 id="notes-drawer-title" className={styles.notesDrawerTitle}>
                  {drawerPhase === 'pick'
                    ? 'Who is this note for?'
                    : selectedNoteId
                      ? 'Edit progress note'
                      : 'New progress note'}
                </h2>
                <p className={styles.notesDrawerSub}>
                  {drawerPhase === 'pick'
                    ? 'Choose a patient to open the SOAP composer. You can change the patient later from their profile.'
                    : 'Draft stays in this panel until you save. AI-generated drafts from video sessions will surface separately on the patient profile.'}
                </p>
              </div>
              <Button type="button" className={styles.secondaryButton} onClick={closeDrawer}>
                <CloseIcon size="sm" style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Close
              </Button>
            </div>
            <div className={styles.notesDrawerBody}>
              {drawerPhase === 'pick' ? (
                <>
                  <div className={styles.notesPatientDirectoryField} style={{ marginBottom: '1rem' }}>
                    <SearchIcon size="sm" aria-hidden />
                    <input
                      type="search"
                      value={patientDirectoryQuery}
                      onChange={(e) => setPatientDirectoryQuery(e.target.value)}
                      placeholder="Search patients…"
                      aria-label="Search patients for new note"
                    />
                  </div>
                  <ul className={styles.notesPickPatientList}>
                    {patientsInDirectory.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          className={styles.notesPickPatientRow}
                          onClick={() => {
                            setDrawerPatientId(p.id);
                            setDrawerPhase('compose');
                          }}
                        >
                          <strong>{p.name}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--cs-on-surface-variant, #5c5c5c)', marginTop: 4 }}>
                            {p.email || 'No email on file'}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <SOAPNoteForm
                  key={formComposerKey}
                  noteId={selectedNoteId || undefined}
                  patientId={drawerPatientId || undefined}
                  onSave={handleSaveNote}
                  onCancel={closeDrawer}
                  isModal={false}
                />
              )}
            </div>
          </aside>
        </>
      )}

      {selectedNote && (
        <div className={styles.modalOverlay} onClick={handleCloseNote}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                Session #{selectedNote.session_number} — {selectedNote.patient_name}
              </h3>
              <Button type="button" className={styles.modalClose} onClick={handleCloseNote}>
                <CloseIcon size="md" />
              </Button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.noteDetailHeader}>
                <div className={styles.noteDetailMeta}>
                  <span>{formatDate(selectedNote.session_date)}</span>
                  <span>•</span>
                  <span>{formatTime(selectedNote.session_date)}</span>
                  <span>•</span>
                  <span>{selectedNote.session_duration} minutes</span>
                </div>
                <div className={styles.noteDetailRating}>
                  Progress rating: <strong>{selectedNote.progress_rating}/10</strong>
                </div>
              </div>

              <div className={styles.soapFull}>
                <div className={styles.soapFullSection}>
                  <h4>
                    <NotesIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Subjective
                  </h4>
                  <p>{selectedNote.subjective}</p>
                </div>

                <div className={styles.soapFullSection}>
                  <h4>
                    <EyeIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Objective
                  </h4>
                  <p>{selectedNote.objective}</p>
                </div>

                <div className={styles.soapFullSection}>
                  <h4>
                    <SearchIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Assessment
                  </h4>
                  <p>{selectedNote.assessment}</p>
                </div>

                <div className={styles.soapFullSection}>
                  <h4>
                    <ClipboardIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Plan
                  </h4>
                  <p>{selectedNote.plan}</p>
                </div>
              </div>

              <div className={styles.noteDetailFooter}>
                <span>Created by: {selectedNote.psychologist_name}</span>
                <span>Created: {formatDate(selectedNote.created_at)}</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button type="button" className={styles.secondaryButton} onClick={handleCloseNote}>
                Close
              </Button>
              <Button
                type="button"
                className={styles.secondaryButton}
                disabled={pdfLoadingNoteId === selectedNote.id}
                onClick={() => handleDownloadPdf(selectedNote.id)}
              >
                <DownloadIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                {pdfLoadingNoteId === selectedNote.id ? 'Downloading…' : 'Download PDF'}
              </Button>
              <Button
                type="button"
                className={styles.primaryButton}
                onClick={() => {
                  handleCloseNote();
                  handleEditNote(selectedNote.id);
                }}
              >
                Edit note
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className={styles.modalOverlay} onClick={handleCancelDelete}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>
              <WarningIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Delete progress note?
            </h3>
            <p>Are you sure you want to delete this progress note? This action cannot be undone.</p>
            <div className={styles.confirmActions}>
              <Button type="button" className={styles.secondaryButton} onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button type="button" className={styles.dangerButton} onClick={handleConfirmDelete}>
                Delete note
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
