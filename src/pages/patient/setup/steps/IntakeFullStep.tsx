import { useMemo, useState, type FC, type FormEvent } from 'react';
import type { SetupStepComponentProps } from './setupStepTypes';
import styles from './SetupStep.module.scss';

interface IntakeFullForm {
  previous_therapy: boolean;
  previous_therapy_details: string;
  current_medications: boolean;
  medication_list: string;
  other_health_professionals: boolean;
  other_health_details: string;
  medical_conditions: boolean;
  medical_conditions_details: string;
}

const EMPTY: IntakeFullForm = {
  previous_therapy: false,
  previous_therapy_details: '',
  current_medications: false,
  medication_list: '',
  other_health_professionals: false,
  other_health_details: '',
  medical_conditions: false,
  medical_conditions_details: '',
};

export const IntakeFullStep: FC<SetupStepComponentProps> = ({
  state,
  onAdvance,
  onDraft,
  saving,
  error,
}) => {
  const initial = useMemo<IntakeFullForm>(() => {
    const draft = (state.draft?.intake_full as Partial<IntakeFullForm> | undefined) || {};
    return { ...EMPTY, ...draft };
  }, [state.draft]);

  const [form, setForm] = useState<IntakeFullForm>(initial);

  const update = <K extends keyof IntakeFullForm>(k: K, v: IntakeFullForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggle = (k: keyof IntakeFullForm) =>
    setForm((f) => ({ ...f, [k]: !(f[k] as boolean) } as IntakeFullForm));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void onAdvance({ ...form });
  };

  const handleSkip = () => {
    void onAdvance({ ...form });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <p className={styles.formFull}>
        These questions help your psychologist prepare. You can skip and come
        back — this step doesn't block your first booking.
      </p>

      <label className={`${styles.formFull} ${styles.checkboxRow}`}>
        <input
          type="checkbox"
          className={styles.checkboxInput}
          checked={form.previous_therapy}
          onChange={() => {
            toggle('previous_therapy');
            void onDraft({ ...form, previous_therapy: !form.previous_therapy });
          }}
        />
        <span className={styles.checkboxText}>I have seen a psychologist / counsellor before.</span>
      </label>
      {form.previous_therapy && (
        <div className={`${styles.formFull} ${styles.row}`}>
          <label className={styles.label} htmlFor="setup-prev-details">
            Brief details (optional)
          </label>
          <textarea
            id="setup-prev-details"
            className={styles.textarea}
            value={form.previous_therapy_details}
            onChange={(e) => update('previous_therapy_details', e.target.value)}
            onBlur={() => void onDraft({ ...form })}
          />
        </div>
      )}

      <label className={`${styles.formFull} ${styles.checkboxRow}`}>
        <input
          type="checkbox"
          className={styles.checkboxInput}
          checked={form.current_medications}
          onChange={() => {
            toggle('current_medications');
            void onDraft({ ...form, current_medications: !form.current_medications });
          }}
        />
        <span className={styles.checkboxText}>I am taking prescription medication.</span>
      </label>
      {form.current_medications && (
        <div className={`${styles.formFull} ${styles.row}`}>
          <label className={styles.label} htmlFor="setup-meds">
            Medication list
          </label>
          <textarea
            id="setup-meds"
            className={styles.textarea}
            value={form.medication_list}
            onChange={(e) => update('medication_list', e.target.value)}
            onBlur={() => void onDraft({ ...form })}
            placeholder="Name, dose, frequency"
          />
        </div>
      )}

      <label className={`${styles.formFull} ${styles.checkboxRow}`}>
        <input
          type="checkbox"
          className={styles.checkboxInput}
          checked={form.other_health_professionals}
          onChange={() => {
            toggle('other_health_professionals');
            void onDraft({ ...form, other_health_professionals: !form.other_health_professionals });
          }}
        />
        <span className={styles.checkboxText}>
          I'm currently seeing other health professionals (e.g. psychiatrist, dietitian).
        </span>
      </label>
      {form.other_health_professionals && (
        <div className={`${styles.formFull} ${styles.row}`}>
          <label className={styles.label} htmlFor="setup-other-hp">
            Who, and for what?
          </label>
          <textarea
            id="setup-other-hp"
            className={styles.textarea}
            value={form.other_health_details}
            onChange={(e) => update('other_health_details', e.target.value)}
            onBlur={() => void onDraft({ ...form })}
          />
        </div>
      )}

      <label className={`${styles.formFull} ${styles.checkboxRow}`}>
        <input
          type="checkbox"
          className={styles.checkboxInput}
          checked={form.medical_conditions}
          onChange={() => {
            toggle('medical_conditions');
            void onDraft({ ...form, medical_conditions: !form.medical_conditions });
          }}
        />
        <span className={styles.checkboxText}>
          I have ongoing medical or neurological conditions relevant to therapy.
        </span>
      </label>
      {form.medical_conditions && (
        <div className={`${styles.formFull} ${styles.row}`}>
          <label className={styles.label} htmlFor="setup-med-cond">
            Details (optional)
          </label>
          <textarea
            id="setup-med-cond"
            className={styles.textarea}
            value={form.medical_conditions_details}
            onChange={(e) => update('medical_conditions_details', e.target.value)}
            onBlur={() => void onDraft({ ...form })}
          />
        </div>
      )}

      {error && <p className={`${styles.formFull} ${styles.error}`}>{error}</p>}

      <div
        className={styles.formFull}
        style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}
      >
        <button
          type="button"
          className="patient-cta-secondary"
          onClick={handleSkip}
          disabled={saving}
        >
          Skip for now
        </button>
        <button
          type="submit"
          className="patient-cta-primary"
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save & continue'}
        </button>
      </div>
    </form>
  );
};

export default IntakeFullStep;
