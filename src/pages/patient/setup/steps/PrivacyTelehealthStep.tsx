import { useMemo, useState, type FC, type FormEvent } from 'react';
import type { SetupStepComponentProps } from './setupStepTypes';
import styles from './SetupStep.module.scss';

interface PrivacyTelehealthForm {
  privacy_policy_accepted: boolean;
  consent_to_telehealth: boolean;
  telehealth_emergency_protocol_acknowledged: boolean;
  telehealth_tech_requirements_acknowledged: boolean;
}

const EMPTY: PrivacyTelehealthForm = {
  privacy_policy_accepted: false,
  consent_to_telehealth: false,
  telehealth_emergency_protocol_acknowledged: false,
  telehealth_tech_requirements_acknowledged: false,
};

export const PrivacyTelehealthStep: FC<SetupStepComponentProps> = ({
  state,
  onAdvance,
  onDraft,
  saving,
  error,
}) => {
  const initial = useMemo<PrivacyTelehealthForm>(() => {
    const draft =
      (state.draft?.privacy_telehealth as Partial<PrivacyTelehealthForm> | undefined) ||
      {};
    // Prefill from readiness where possible (e.g. consent already given).
    const already = {
      consent_to_telehealth: state.readiness.telehealth_consent_complete,
    };
    return { ...EMPTY, ...already, ...draft };
  }, [state.draft, state.readiness.telehealth_consent_complete]);

  const [form, setForm] = useState<PrivacyTelehealthForm>(initial);
  const toggle = (k: keyof PrivacyTelehealthForm) =>
    setForm((f) => ({ ...f, [k]: !f[k] }));

  const canSubmit =
    form.privacy_policy_accepted &&
    form.consent_to_telehealth &&
    form.telehealth_emergency_protocol_acknowledged &&
    form.telehealth_tech_requirements_acknowledged;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    void onAdvance({ ...form });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label className={`${styles.formFull} ${styles.checkboxRow}`}>
        <input
          type="checkbox"
          className={styles.checkboxInput}
          checked={form.privacy_policy_accepted}
          onChange={() => {
            toggle('privacy_policy_accepted');
            void onDraft({ ...form, privacy_policy_accepted: !form.privacy_policy_accepted });
          }}
        />
        <span className={styles.checkboxText}>
          I have read and accept the{' '}
          <a href="/privacy-policy" target="_blank" rel="noreferrer">
            Privacy Policy
          </a>{' '}
          (Privacy Act 1988 — APP 1).
        </span>
      </label>

      <label className={`${styles.formFull} ${styles.checkboxRow}`}>
        <input
          type="checkbox"
          className={styles.checkboxInput}
          checked={form.consent_to_telehealth}
          onChange={() => {
            toggle('consent_to_telehealth');
            void onDraft({ ...form, consent_to_telehealth: !form.consent_to_telehealth });
          }}
        />
        <span className={styles.checkboxText}>
          I consent to receiving psychological services via telehealth
          (video/phone), and understand a backup call number will be used
          if my connection drops.
        </span>
      </label>

      <label className={`${styles.formFull} ${styles.checkboxRow}`}>
        <input
          type="checkbox"
          className={styles.checkboxInput}
          checked={form.telehealth_emergency_protocol_acknowledged}
          onChange={() => {
            toggle('telehealth_emergency_protocol_acknowledged');
            void onDraft({
              ...form,
              telehealth_emergency_protocol_acknowledged:
                !form.telehealth_emergency_protocol_acknowledged,
            });
          }}
        />
        <span className={styles.checkboxText}>
          I understand the emergency procedures for telehealth sessions
          (including calling 000 for life-threatening situations).
        </span>
      </label>

      <label className={`${styles.formFull} ${styles.checkboxRow}`}>
        <input
          type="checkbox"
          className={styles.checkboxInput}
          checked={form.telehealth_tech_requirements_acknowledged}
          onChange={() => {
            toggle('telehealth_tech_requirements_acknowledged');
            void onDraft({
              ...form,
              telehealth_tech_requirements_acknowledged:
                !form.telehealth_tech_requirements_acknowledged,
            });
          }}
        />
        <span className={styles.checkboxText}>
          I meet the telehealth technical requirements (stable internet,
          private space, camera + microphone).
        </span>
      </label>

      {error && <p className={`${styles.formFull} ${styles.error}`}>{error}</p>}

      <div
        className={styles.formFull}
        style={{ display: 'flex', justifyContent: 'flex-end' }}
      >
        <button
          type="submit"
          className="patient-cta-primary"
          disabled={!canSubmit || saving}
        >
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </div>
    </form>
  );
};

export default PrivacyTelehealthStep;
