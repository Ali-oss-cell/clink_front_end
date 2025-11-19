import { useState, useEffect } from 'react';
import { progressNotesService, type Patient } from '../../../services/api/progressNotes';
import type { ProgressNote, CreateNoteRequest } from '../../../types/progressNote';
import {
  EditIcon,
  NotesIcon,
  WarningIcon,
  EyeIcon,
  SearchIcon,
  ClipboardIcon
} from '../../../utils/icons';
import styles from './SOAPNoteForm.module.scss';

interface SOAPNoteFormProps {
  patientId?: number;
  sessionDate?: string;
  noteId?: number; // For editing existing note
  onSave?: (note: ProgressNote) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const SOAPNoteForm: React.FC<SOAPNoteFormProps> = ({
  patientId,
  sessionDate,
  noteId,
  onSave,
  onCancel,
  isModal = true
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingNote, setLoadingNote] = useState(false);

  const [formData, setFormData] = useState<CreateNoteRequest>({
    patient: patientId || 0,
    session_date: sessionDate || new Date().toISOString().slice(0, 16),
    session_number: 1,
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    session_duration: 50,
    progress_rating: 5
  });

  // Load patients list for dropdown
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await progressNotesService.getPatients();
        setPatients(response.results || []);
      } catch (err) {
        console.error('Failed to load patients:', err);
        setError('Failed to load patients list');
        setPatients([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Load existing note if editing
  useEffect(() => {
    if (noteId) {
      const fetchNote = async () => {
        try {
          setLoadingNote(true);
          const note = await progressNotesService.getNote(noteId);
          setFormData({
            patient: note.patient,
            session_date: note.session_date.slice(0, 16),
            session_number: note.session_number,
            subjective: note.subjective,
            objective: note.objective,
            assessment: note.assessment,
            plan: note.plan,
            session_duration: note.session_duration,
            progress_rating: note.progress_rating
          });
        } catch (err) {
          console.error('Failed to load note:', err);
          setError('Failed to load note for editing');
        } finally {
          setLoadingNote(false);
        }
      };

      fetchNote();
    }
  }, [noteId]);

  const handleChange = (
    field: keyof CreateNoteRequest,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.patient) {
      setError('Please select a patient');
      return false;
    }
    if (formData.subjective.length < 50) {
      setError('Subjective section must be at least 50 characters');
      return false;
    }
    if (formData.objective.length < 50) {
      setError('Objective section must be at least 50 characters');
      return false;
    }
    if (formData.assessment.length < 50) {
      setError('Assessment section must be at least 50 characters');
      return false;
    }
    if (formData.plan.length < 50) {
      setError('Plan section must be at least 50 characters');
      return false;
    }
    if (formData.progress_rating < 1 || formData.progress_rating > 10) {
      setError('Progress rating must be between 1 and 10');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      let savedNote: ProgressNote;

      if (noteId) {
        // Update existing note
        savedNote = await progressNotesService.updateNote(noteId, formData);
      } else {
        // Create new note
        savedNote = await progressNotesService.createNote(formData);
      }

      if (onSave) {
        onSave(savedNote);
      }
    } catch (err: any) {
      console.error('Failed to save note:', err);
      setError(err.message || 'Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  if (loadingNote) {
    return (
      <div className={styles.loadingState}>
        <p>Loading note...</p>
      </div>
    );
  }

  const containerClass = isModal ? styles.modalContainer : styles.pageContainer;

  return (
    <div className={containerClass}>
      <div className={styles.formHeader}>
        <h2>
          {noteId ? (
            <>
              <EditIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Edit SOAP Note
            </>
          ) : (
            <>
              <NotesIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Write SOAP Note
            </>
          )}
        </h2>
        <p className={styles.subtitle}>
          Complete all four sections of the SOAP format (minimum 50 characters each)
        </p>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <span className={styles.errorIcon}><WarningIcon size="md" /></span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.soapForm}>
        {/* Patient Selection & Session Info */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="patient" className={styles.label}>
              Patient <span className={styles.required}>*</span>
            </label>
            <select
              id="patient"
              value={formData.patient}
              onChange={(e) => handleChange('patient', parseInt(e.target.value))}
              disabled={!!patientId || loading}
              className={styles.select}
              required
            >
              <option value="">Select a patient</option>
              {loading ? (
                <option value="" disabled>Loading patients...</option>
              ) : patients && patients.length > 0 ? (
                patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name || `Patient #${patient.id}`}
                  </option>
                ))
              ) : (
                <option value="" disabled>No patients available</option>
              )}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="session_date" className={styles.label}>
              Session Date & Time <span className={styles.required}>*</span>
            </label>
            <input
              type="datetime-local"
              id="session_date"
              value={formData.session_date}
              onChange={(e) => handleChange('session_date', e.target.value)}
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="session_number" className={styles.label}>
              Session Number <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              id="session_number"
              value={formData.session_number}
              onChange={(e) => handleChange('session_number', parseInt(e.target.value))}
              min="1"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="session_duration" className={styles.label}>
              Duration (minutes) <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              id="session_duration"
              value={formData.session_duration}
              onChange={(e) => handleChange('session_duration', parseInt(e.target.value))}
              min="15"
              max="180"
              className={styles.input}
              required
            />
          </div>
        </div>

        {/* SOAP Sections */}
        <div className={styles.soapSection}>
          <div className={styles.soapHeader}>
            <span className={styles.soapIcon}><NotesIcon size="md" /></span>
            <div>
              <label htmlFor="subjective" className={styles.soapLabel}>
                Subjective <span className={styles.required}>*</span>
              </label>
              <p className={styles.soapHint}>
                What did the patient report? Their feelings, thoughts, and symptoms.
              </p>
            </div>
            <span className={styles.charCount}>
              {formData.subjective.length} characters (min: 50)
            </span>
          </div>
          <textarea
            id="subjective"
            value={formData.subjective}
            onChange={(e) => handleChange('subjective', e.target.value)}
            className={styles.textarea}
            rows={4}
            placeholder="Example: Patient reported feeling anxious about work and social situations. Mentioned difficulty sleeping and increased worry. Has been using breathing exercises learned in previous session..."
            required
          />
        </div>

        <div className={styles.soapSection}>
          <div className={styles.soapHeader}>
            <span className={styles.soapIcon}><EyeIcon size="md" /></span>
            <div>
              <label htmlFor="objective" className={styles.soapLabel}>
                Objective <span className={styles.required}>*</span>
              </label>
              <p className={styles.soapHint}>
                What did you observe? Patient's behavior, affect, and mood during the session.
              </p>
            </div>
            <span className={styles.charCount}>
              {formData.objective.length} characters (min: 50)
            </span>
          </div>
          <textarea
            id="objective"
            value={formData.objective}
            onChange={(e) => handleChange('objective', e.target.value)}
            className={styles.textarea}
            rows={4}
            placeholder="Example: Patient appeared tense, fidgeting with hands. Made good eye contact throughout session. Speech was clear and coherent. Affect was anxious but improved during session..."
            required
          />
        </div>

        <div className={styles.soapSection}>
          <div className={styles.soapHeader}>
            <span className={styles.soapIcon}><SearchIcon size="md" /></span>
            <div>
              <label htmlFor="assessment" className={styles.soapLabel}>
                Assessment <span className={styles.required}>*</span>
              </label>
              <p className={styles.soapHint}>
                Your professional interpretation, clinical impression, and diagnosis.
              </p>
            </div>
            <span className={styles.charCount}>
              {formData.assessment.length} characters (min: 50)
            </span>
          </div>
          <textarea
            id="assessment"
            value={formData.assessment}
            onChange={(e) => handleChange('assessment', e.target.value)}
            className={styles.textarea}
            rows={4}
            placeholder="Example: Patient presents with symptoms consistent with generalized anxiety disorder. Showing progress with CBT techniques but still experiencing work-related stress. Demonstrates good insight..."
            required
          />
        </div>

        <div className={styles.soapSection}>
          <div className={styles.soapHeader}>
            <span className={styles.soapIcon}><ClipboardIcon size="md" /></span>
            <div>
              <label htmlFor="plan" className={styles.soapLabel}>
                Plan <span className={styles.required}>*</span>
              </label>
              <p className={styles.soapHint}>
                Treatment plan, interventions used, homework assigned, and next steps.
              </p>
            </div>
            <span className={styles.charCount}>
              {formData.plan.length} characters (min: 50)
            </span>
          </div>
          <textarea
            id="plan"
            value={formData.plan}
            onChange={(e) => handleChange('plan', e.target.value)}
            className={styles.textarea}
            rows={4}
            placeholder="Example: Continue weekly CBT sessions. Focus on relaxation strategies and cognitive restructuring. Assign homework: practice breathing exercises 3x daily, journal worry thoughts. Schedule follow-up in 1 week..."
            required
          />
        </div>

        {/* Progress Rating */}
        <div className={styles.ratingSection}>
          <label htmlFor="progress_rating" className={styles.ratingLabel}>
            Progress Rating <span className={styles.required}>*</span>
          </label>
          <div className={styles.ratingContainer}>
            <input
              type="range"
              id="progress_rating"
              min="1"
              max="10"
              value={formData.progress_rating}
              onChange={(e) => handleChange('progress_rating', parseInt(e.target.value))}
              className={styles.ratingSlider}
            />
            <div className={styles.ratingValue}>{formData.progress_rating}/10</div>
          </div>
          <div className={styles.ratingLabels}>
            <span>1 - Poor Progress</span>
            <span>5 - Moderate Progress</span>
            <span>10 - Excellent Progress</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={handleCancel}
            className={styles.cancelButton}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : noteId ? 'Update Note' : '💾 Save & Complete'}
          </button>
        </div>
      </form>
    </div>
  );
};

