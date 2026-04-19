import { useMemo, useState, type FC, type FormEvent } from 'react';
import type { SetupStepComponentProps } from './setupStepTypes';
import styles from './SetupStep.module.scss';

interface ContactForm {
  preferred_name: string;
  pronouns: string;
  home_phone: string;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;
}

const EMPTY: ContactForm = {
  preferred_name: '',
  pronouns: '',
  home_phone: '',
  emergency_contact_name: '',
  emergency_contact_relationship: '',
  emergency_contact_phone: '',
};

export const ContactStep: FC<SetupStepComponentProps> = ({
  state,
  onAdvance,
  onDraft,
  saving,
  error,
}) => {
  const initial = useMemo<ContactForm>(() => {
    const draft = (state.draft?.contact as Partial<ContactForm> | undefined) || {};
    return { ...EMPTY, ...draft };
  }, [state.draft]);

  const [form, setForm] = useState<ContactForm>(initial);

  const update = <K extends keyof ContactForm>(key: K, value: ContactForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canSubmit =
    form.emergency_contact_name.trim().length > 1 &&
    form.emergency_contact_relationship.trim().length > 1 &&
    form.emergency_contact_phone.trim().length > 4;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    void onAdvance({ ...form });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <label className={styles.label} htmlFor="setup-preferred_name">
          Preferred name
        </label>
        <input
          id="setup-preferred_name"
          className={styles.input}
          value={form.preferred_name}
          onChange={(e) => update('preferred_name', e.target.value)}
          onBlur={() => void onDraft({ ...form })}
        />
        <span className={styles.hint}>How should your psychologist greet you?</span>
      </div>
      <div className={styles.row}>
        <label className={styles.label} htmlFor="setup-pronouns">
          Pronouns
        </label>
        <input
          id="setup-pronouns"
          className={styles.input}
          value={form.pronouns}
          placeholder="she/her, he/him, they/them…"
          onChange={(e) => update('pronouns', e.target.value)}
          onBlur={() => void onDraft({ ...form })}
        />
      </div>
      <div className={styles.row}>
        <label className={styles.label} htmlFor="setup-home_phone">
          Home phone (optional)
        </label>
        <input
          id="setup-home_phone"
          className={styles.input}
          value={form.home_phone}
          placeholder="+61 2 9000 0000"
          onChange={(e) => update('home_phone', e.target.value)}
          onBlur={() => void onDraft({ ...form })}
        />
      </div>

      <h3 className={styles.formFull} style={{ margin: 0 }}>
        Emergency contact
      </h3>
      <div className={styles.row}>
        <label className={styles.label} htmlFor="setup-ec_name">
          Full name
        </label>
        <input
          id="setup-ec_name"
          className={styles.input}
          required
          value={form.emergency_contact_name}
          onChange={(e) => update('emergency_contact_name', e.target.value)}
          onBlur={() => void onDraft({ ...form })}
        />
      </div>
      <div className={styles.row}>
        <label className={styles.label} htmlFor="setup-ec_rel">
          Relationship
        </label>
        <input
          id="setup-ec_rel"
          className={styles.input}
          required
          placeholder="Partner, parent, friend…"
          value={form.emergency_contact_relationship}
          onChange={(e) =>
            update('emergency_contact_relationship', e.target.value)
          }
          onBlur={() => void onDraft({ ...form })}
        />
      </div>
      <div className={styles.row}>
        <label className={styles.label} htmlFor="setup-ec_phone">
          Phone
        </label>
        <input
          id="setup-ec_phone"
          type="tel"
          inputMode="tel"
          className={styles.input}
          required
          placeholder="+61 412 345 678"
          value={form.emergency_contact_phone}
          onChange={(e) => update('emergency_contact_phone', e.target.value)}
          onBlur={() => void onDraft({ ...form })}
        />
      </div>

      {error && <p className={`${styles.formFull} ${styles.error}`}>{error}</p>}

      <div className={styles.formFull} style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
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

export default ContactStep;
