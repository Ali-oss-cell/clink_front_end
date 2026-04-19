import { useMemo, useState, type FC, type FormEvent } from 'react';
import type { SetupStepComponentProps } from './setupStepTypes';
import styles from './SetupStep.module.scss';

interface IntakeMinForm {
  presenting_concerns: string;
  therapy_goals: string;
  consent_to_treatment: boolean;
}

const EMPTY: IntakeMinForm = {
  presenting_concerns: '',
  therapy_goals: '',
  consent_to_treatment: false,
};

export const IntakeMinStep: FC<SetupStepComponentProps> = ({
  state,
  onAdvance,
  onDraft,
  saving,
  error,
}) => {
  const initial = useMemo<IntakeMinForm>(() => {
    const draft = (state.draft?.intake_min as Partial<IntakeMinForm> | undefined) || {};
    return { ...EMPTY, ...draft };
  }, [state.draft]);
  const [form, setForm] = useState<IntakeMinForm>(initial);

  const canSubmit =
    form.presenting_concerns.trim().length > 3 &&
    form.therapy_goals.trim().length > 3 &&
    form.consent_to_treatment;

  const update = <K extends keyof IntakeMinForm>(k: K, v: IntakeMinForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    void onAdvance({ ...form });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={`${styles.formFull} ${styles.row}`}>
        <label className={styles.label} htmlFor="setup-presenting">
          What brings you in right now?
        </label>
        <textarea
          id="setup-presenting"
          className={styles.textarea}
          required
          value={form.presenting_concerns}
          onChange={(e) => update('presenting_concerns', e.target.value)}
          onBlur={() => void onDraft({ ...form })}
          placeholder="A short summary is enough — you can share more in session."
        />
        <span className={styles.hint}>
          One or two sentences is perfect. Example: "Ongoing anxiety affecting sleep and work."
        </span>
      </div>

      <div className={`${styles.formFull} ${styles.row}`}>
        <label className={styles.label} htmlFor="setup-goals">
          What would success look like for you?
        </label>
        <textarea
          id="setup-goals"
          className={styles.textarea}
          required
          value={form.therapy_goals}
          onChange={(e) => update('therapy_goals', e.target.value)}
          onBlur={() => void onDraft({ ...form })}
          placeholder="e.g. Sleep better, feel less stuck, rebuild confidence."
        />
      </div>

      <label className={`${styles.formFull} ${styles.checkboxRow}`}>
        <input
          type="checkbox"
          className={styles.checkboxInput}
          checked={form.consent_to_treatment}
          onChange={() => {
            const next = !form.consent_to_treatment;
            update('consent_to_treatment', next);
            void onDraft({ ...form, consent_to_treatment: next });
          }}
        />
        <span className={styles.checkboxText}>
          I consent to psychological treatment and understand I can withdraw
          consent at any time.
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
          {saving ? 'Saving…' : 'Save & continue'}
        </button>
      </div>
    </form>
  );
};

export default IntakeMinStep;
