import { useState, useEffect } from 'react';
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
  CloseIcon
} from '../../utils/icons';
import styles from './PsychologistPages.module.scss';

export const PsychologistNotesPage: React.FC = () => {
  const [notes, setNotes] = useState<ProgressNote[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<ProgressNote | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);

  const user = authService.getStoredUser();

  useEffect(() => {
    fetchNotes();
    fetchPatients();
  }, [selectedPatient]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = selectedPatient ? { patient_id: selectedPatient } : {};
      const response = await progressNotesService.listNotes(params);
      setNotes(response.results || []);
    } catch (err: any) {
      console.error('Failed to load notes:', err);
      setError(err.message || 'Failed to load progress notes');
      setNotes([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await progressNotesService.getPatients();
      setPatients(response.results || []);
    } catch (err) {
      console.error('Failed to load patients:', err);
      setPatients([]); // Set empty array on error
    }
  };

  const handleCreateNote = () => {
    setSelectedNoteId(null);
    setShowNoteForm(true);
  };

  const handleEditNote = (noteId: number) => {
    setSelectedNoteId(noteId);
    setShowNoteForm(true);
  };

  const handleViewNote = (note: ProgressNote) => {
    setSelectedNote(note);
  };

  const handleCloseNote = () => {
    setSelectedNote(null);
  };

  const handleSaveNote = (note: ProgressNote) => {
    setShowNoteForm(false);
    setSelectedNoteId(null);
    fetchNotes(); // Refresh the list
  };

  const handleCancelNote = () => {
    setShowNoteForm(false);
    setSelectedNoteId(null);
  };

  const handleDeleteClick = (noteId: number) => {
    setNoteToDelete(noteId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;

    try {
      await progressNotesService.deleteNote(noteToDelete);
      setNotes(notes.filter(n => n.id !== noteToDelete));
      setShowDeleteConfirm(false);
      setNoteToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete note:', err);
      alert('Failed to delete note: ' + (err.message || 'Unknown error'));
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setNoteToDelete(null);
  };

  const filteredNotes = notes.filter(note => {
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
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Layout user={user} isAuthenticated={true} className={styles.psychologistLayout}>
      <div className={styles.notesContainer}>
        <div className="container">
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerText}>
                <h1 className={styles.pageTitle}>
                  <span className={styles.titleIcon}><NotesIcon size="lg" /></span>
                  Progress Notes
                </h1>
                <p className={styles.pageSubtitle}>
                  Manage SOAP notes and track patient progress
                </p>
              </div>
              <button
                className={styles.primaryButton}
                onClick={handleCreateNote}
              >
                + New Note
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className={styles.searchFilterSection}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}><SearchIcon size="md" /></span>
              <input
                type="text"
                placeholder="Search by patient name or note content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filterGroup}>
              <label htmlFor="patient-filter">Patient:</label>
              <select
                id="patient-filter"
                value={selectedPatient || ''}
                onChange={(e) => setSelectedPatient(e.target.value ? parseInt(e.target.value) : null)}
                className={styles.filterSelect}
              >
                <option value="">All Patients</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes List */}
          {loading ? (
            <div className={styles.loadingState}>
              <p>Loading notes...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <h3><WarningIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Error Loading Notes</h3>
              <p>{error}</p>
              <p style={{ fontSize: '0.9rem', color: '#7a7b7a', marginTop: '1rem' }}>
                Make sure your Django backend is running on port 8000
              </p>
              <button className={styles.retryButton} onClick={fetchNotes}>
                Retry
              </button>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><NotesIcon size="2xl" /></div>
              <h3>No Progress Notes Found</h3>
              <p>
                {searchQuery || selectedPatient
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start by creating your first progress note.'}
              </p>
              <button className={styles.primaryButton} onClick={handleCreateNote}>
                + Create First Note
              </button>
            </div>
          ) : (
            <div className={styles.notesList}>
              {filteredNotes.map((note) => (
                <div key={note.id} className={styles.noteCard}>
                  <div className={styles.noteHeader}>
                    <div className={styles.noteInfo}>
                      <h3 className={styles.noteTitle}>
                        Session #{note.session_number} - {note.patient_name}
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
                        <span className={styles.soapLabel}><NotesIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> S:</span>
                        <span className={styles.soapText}>
                          {note.subjective.substring(0, 100)}
                          {note.subjective.length > 100 ? '...' : ''}
                        </span>
                      </div>
                      <div className={styles.soapItem}>
                        <span className={styles.soapLabel}><EyeIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> O:</span>
                        <span className={styles.soapText}>
                          {note.objective.substring(0, 100)}
                          {note.objective.length > 100 ? '...' : ''}
                        </span>
                      </div>
                      <div className={styles.soapItem}>
                        <span className={styles.soapLabel}><SearchIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> A:</span>
                        <span className={styles.soapText}>
                          {note.assessment.substring(0, 100)}
                          {note.assessment.length > 100 ? '...' : ''}
                        </span>
                      </div>
                      <div className={styles.soapItem}>
                        <span className={styles.soapLabel}><ClipboardIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} /> P:</span>
                        <span className={styles.soapText}>
                          {note.plan.substring(0, 100)}
                          {note.plan.length > 100 ? '...' : ''}
                        </span>
                      </div>
                    </div>

                    <div className={styles.noteFooter}>
                      <span className={styles.noteDuration}>
                        Duration: {note.session_duration} min
                      </span>
                      <span className={styles.noteDate}>
                        Created: {formatDate(note.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.noteActions}>
                    <button
                      className={styles.viewButton}
                      onClick={() => handleViewNote(note)}
                    >
                      View Full
                    </button>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditNote(note.id)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteClick(note.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Note Modal */}
      {showNoteForm && (
        <div className={styles.modalOverlay} onClick={handleCancelNote}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={handleCancelNote}
              aria-label="Close"
            >
              <CloseIcon size="md" />
            </button>
            <SOAPNoteForm
              noteId={selectedNoteId || undefined}
              onSave={handleSaveNote}
              onCancel={handleCancelNote}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* View Note Modal */}
      {selectedNote && (
        <div className={styles.modalOverlay} onClick={handleCloseNote}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Session #{selectedNote.session_number} - {selectedNote.patient_name}</h3>
              <button className={styles.modalClose} onClick={handleCloseNote}>
                <CloseIcon size="md" />
              </button>
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
                  Progress Rating: <strong>{selectedNote.progress_rating}/10</strong>
                </div>
              </div>

              <div className={styles.soapFull}>
                <div className={styles.soapFullSection}>
                  <h4><NotesIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Subjective</h4>
                  <p>{selectedNote.subjective}</p>
                </div>

                <div className={styles.soapFullSection}>
                  <h4><EyeIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Objective</h4>
                  <p>{selectedNote.objective}</p>
                </div>

                <div className={styles.soapFullSection}>
                  <h4><SearchIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Assessment</h4>
                  <p>{selectedNote.assessment}</p>
                </div>

                <div className={styles.soapFullSection}>
                  <h4><ClipboardIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Plan</h4>
                  <p>{selectedNote.plan}</p>
                </div>
              </div>

              <div className={styles.noteDetailFooter}>
                <span>Created by: {selectedNote.psychologist_name}</span>
                <span>Created: {formatDate(selectedNote.created_at)}</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.secondaryButton} onClick={handleCloseNote}>
                Close
              </button>
              <button
                className={styles.primaryButton}
                onClick={() => {
                  handleCloseNote();
                  handleEditNote(selectedNote.id);
                }}
              >
                Edit Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay} onClick={handleCancelDelete}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3><WarningIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Delete Progress Note?</h3>
            <p>Are you sure you want to delete this progress note? This action cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button className={styles.secondaryButton} onClick={handleCancelDelete}>
                Cancel
              </button>
              <button className={styles.dangerButton} onClick={handleConfirmDelete}>
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

