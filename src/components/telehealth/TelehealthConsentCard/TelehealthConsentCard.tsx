import { useEffect, useState } from 'react';
import { TelehealthService, type TelehealthConsentResponse } from '../../../services/api/telehealth';
import { TELEHEALTH_REQUIREMENTS_URL } from '../../../constants/urls';
import styles from './TelehealthConsentCard.module.scss';

interface TelehealthConsentCardProps {
  onUpdated?: (data: TelehealthConsentResponse) => void;
}

const initialFormState = {
  consent_to_telehealth: false,
  telehealth_emergency_protocol_acknowledged: false,
  telehealth_emergency_contact: '',
  telehealth_emergency_plan: '',
  telehealth_tech_requirements_acknowledged: false,
  telehealth_recording_consent: false,
};

export const TelehealthConsentCard: React.FC<TelehealthConsentCardProps> = ({ onUpdated }) => {
  const [consent, setConsent] = useState<TelehealthConsentResponse | null>(null);
  const [form, setForm] = useState(initialFormState);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadConsent();
  }, []);

  const loadConsent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await TelehealthService.getConsent();
      setConsent(response);
      setForm({
        consent_to_telehealth: response.consent_to_telehealth,
        telehealth_emergency_protocol_acknowledged: response.telehealth_emergency_protocol_acknowledged,
        telehealth_emergency_contact: response.telehealth_emergency_contact || '',
        telehealth_emergency_plan: response.telehealth_emergency_plan || '',
        telehealth_tech_requirements_acknowledged: response.telehealth_tech_requirements_acknowledged,
        telehealth_recording_consent: response.telehealth_recording_consent,
      });
    } catch (err: any) {
      setError(err.message || 'Unable to load telehealth consent at this time.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      const response = await TelehealthService.submitConsent(form);
      setConsent(response);
      setSuccessMessage('Telehealth consent saved successfully.');
      setShowForm(false);
      onUpdated?.(response);
    } catch (err: any) {
      setError(err.message || 'Failed to save telehealth consent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatus = () => {
    const statusActive = consent?.consent_to_telehealth;
    return (
      <div className={styles.summaryItem}>
        <span>Status</span>
        <strong className={`${styles.statusBadge} ${statusActive ? styles.active : styles.pending}`}>
          {statusActive ? 'Active' : 'Pending'}
        </strong>
      </div>
    );
  };

  if (loading) {
    return <div className={styles.loading}>Loading telehealth consent…</div>;
  }

  return (
    <section className={styles.telehealthCard}>
      <div className={styles.header}>
        <div>
          <h3>Telehealth Consent & Emergency Plan</h3>
          <p>All video appointments require an up-to-date telehealth consent and emergency plan.</p>
        </div>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {successMessage && <div className={styles.successAlert}>{successMessage}</div>}

      <div className={styles.summaryGrid}>
        {renderStatus()}
        <div className={styles.summaryItem}>
          <span>Consent Version</span>
          <strong>{consent?.telehealth_consent_version || 'N/A'}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span>Last Updated</span>
          <strong>
            {consent?.telehealth_consent_date
              ? new Date(consent.telehealth_consent_date).toLocaleDateString()
              : consent?.updated_at
              ? new Date(consent.updated_at).toLocaleDateString()
              : 'N/A'}
          </strong>
        </div>
        <div className={styles.summaryItem}>
          <span>Recording Consent</span>
          <strong>{consent?.telehealth_recording_consent ? 'Allowed' : 'Not allowed'}</strong>
        </div>
      </div>

      {consent?.telehealth_emergency_contact && (
        <div className={styles.emergencyCard}>
          <h4>Emergency Contact & Plan</h4>
          <p>
            <strong>Contact:</strong> {consent.telehealth_emergency_contact}
          </p>
          <p>
            <strong>Plan:</strong> {consent.telehealth_emergency_plan || 'Not provided'}
          </p>
        </div>
      )}

      <div className={styles.actions}>
        <button className={`${styles.button} ${styles.primaryButton}`} onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? 'Close Form' : consent?.consent_to_telehealth ? 'Update Consent' : 'Complete Consent'}
        </button>
        <a
          className={`${styles.button} ${styles.secondaryButton}`}
          href={TELEHEALTH_REQUIREMENTS_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Telehealth Requirements
        </a>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <div className={styles.checkboxRow}>
              <input
                type="checkbox"
                id="consent_to_telehealth"
                checked={form.consent_to_telehealth}
                onChange={(e) => handleChange('consent_to_telehealth', e.target.checked)}
                required
              />
              <label htmlFor="consent_to_telehealth">I consent to telehealth sessions.</label>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="telehealth_emergency_contact">Emergency contact (name & phone)</label>
            <input
              id="telehealth_emergency_contact"
              type="text"
              value={form.telehealth_emergency_contact}
              onChange={(e) => handleChange('telehealth_emergency_contact', e.target.value)}
              placeholder="e.g., Alex Smith – 04XX XXX XXX"
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="telehealth_emergency_plan">Emergency plan</label>
            <textarea
              id="telehealth_emergency_plan"
              value={form.telehealth_emergency_plan}
              onChange={(e) => handleChange('telehealth_emergency_plan', e.target.value)}
              placeholder="Describe your preferred plan if connection drops or in case of an emergency during session."
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.checkboxRow}>
              <input
                type="checkbox"
                id="telehealth_emergency_protocol_acknowledged"
                checked={form.telehealth_emergency_protocol_acknowledged}
                onChange={(e) => handleChange('telehealth_emergency_protocol_acknowledged', e.target.checked)}
                required
              />
              <label htmlFor="telehealth_emergency_protocol_acknowledged">
                I understand the emergency procedures, including how reconnection attempts and escalation work.
              </label>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.checkboxRow}>
              <input
                type="checkbox"
                id="telehealth_tech_requirements_acknowledged"
                checked={form.telehealth_tech_requirements_acknowledged}
                onChange={(e) => handleChange('telehealth_tech_requirements_acknowledged', e.target.checked)}
                required
              />
              <label htmlFor="telehealth_tech_requirements_acknowledged">
                I meet the{' '}
                <a
                  className={styles.requirementsLink}
                  href={TELEHEALTH_REQUIREMENTS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  telehealth technical requirements
                </a>
                .
              </label>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.checkboxRow}>
              <input
                type="checkbox"
                id="telehealth_recording_consent"
                checked={form.telehealth_recording_consent}
                onChange={(e) => handleChange('telehealth_recording_consent', e.target.checked)}
              />
              <label htmlFor="telehealth_recording_consent">
                I allow session recording when clinically required (optional, can be withdrawn anytime).
              </label>
            </div>
          </div>

          <button type="submit" className={`${styles.button} ${styles.primaryButton}`} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Telehealth Consent'}
          </button>
        </form>
      )}
    </section>
  );
};

