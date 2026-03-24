import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import {
  MATCH_PREFERENCES_STORAGE_KEY,
  type MatchPreferences,
  type MatchSpecializationFilter,
  type MatchSessionTypeFilter,
  type MatchGenderFilter,
  type MatchAvailabilityFilter,
} from '../../constants/matchPreferences';
import styles from './GetMatchedPage.module.scss';

const TOTAL_STEPS = 5;

const FOCUS_OPTIONS: {
  value: MatchSpecializationFilter;
  label: string;
  description: string;
}[] = [
  { value: 'all', label: 'General wellbeing / not sure yet', description: 'We’ll show all available psychologists.' },
  { value: 'anxiety', label: 'Anxiety or stress', description: 'Worry, panic, stress, burnout.' },
  { value: 'depression', label: 'Low mood or depression', description: 'Motivation, sadness, fatigue.' },
  { value: 'trauma', label: 'Trauma or PTSD', description: 'Past difficult events, flashbacks, hypervigilance.' },
  { value: 'adhd', label: 'ADHD or attention', description: 'Focus, organisation, impulsivity.' },
  { value: 'relationship', label: 'Relationships or family', description: 'Couples, family, communication.' },
];

const SESSION_OPTIONS: { value: MatchSessionTypeFilter; label: string; description: string }[] = [
  { value: 'telehealth', label: 'Telehealth (online)', description: 'Video sessions from home.' },
  { value: 'in-person', label: 'In-person', description: 'Face-to-face at the clinic.' },
  { value: 'both', label: 'Either / no preference', description: 'Show psychologists who offer either option.' },
];

const GENDER_OPTIONS: { value: MatchGenderFilter; label: string }[] = [
  { value: 'any', label: 'No preference' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non-binary', label: 'Non-binary' },
];

const AVAILABILITY_OPTIONS: { value: MatchAvailabilityFilter; label: string; description: string }[] = [
  { value: 'any', label: 'Any time', description: 'No preference.' },
  { value: 'this-week', label: 'Soon (this week)', description: 'Prefer psychologists with earlier openings.' },
  { value: 'next-week', label: 'Next week is fine', description: 'Slightly more flexibility.' },
];

function buildPreferences(
  specialization: MatchSpecializationFilter,
  sessionType: MatchSessionTypeFilter,
  gender: MatchGenderFilter,
  availability: MatchAvailabilityFilter
): MatchPreferences {
  return { specialization, sessionType, gender, availability };
}

export const GetMatchedPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [specialization, setSpecialization] = useState<MatchSpecializationFilter>('all');
  const [sessionType, setSessionType] = useState<MatchSessionTypeFilter>('both');
  const [gender, setGender] = useState<MatchGenderFilter>('any');
  const [availability, setAvailability] = useState<MatchAvailabilityFilter>('any');

  const user = authService.getStoredUser();
  const isPatient = user?.role === 'patient';

  const progressPct = useMemo(() => (step / TOTAL_STEPS) * 100, [step]);

  const persistAndRoute = () => {
    const prefs = buildPreferences(specialization, sessionType, gender, availability);
    try {
      sessionStorage.setItem(MATCH_PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
    if (isPatient) {
      navigate('/appointments/book-appointment');
    }
  };

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <Layout>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroInner}>
              <h1 className={styles.heroTitle}>Get matched with a psychologist</h1>
              <p className={styles.heroSubtitle}>
                A few quick questions help narrow who may fit your goals and schedule (like other telehealth psychology
                platforms such as{' '}
                <a
                  href="https://www.mymirror.com.au/get-matched"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.heroLink}
                >
                  My Mirror
                </a>
                ). Your answers stay private and secure.
              </p>
              <div className={styles.progress}>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
                </div>
                <p className={styles.progressLabel}>
                  Step {step} of {TOTAL_STEPS}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.panel}>
          <div className={styles.card}>
            {step === 1 && (
              <>
                <h2 className={styles.stepTitle}>Let’s get started</h2>
                <p className={styles.stepHint}>
                  Tailored Psychology helps you connect with AHPRA-registered psychologists for telehealth and in-person
                  care. This short guide sets filters for when you choose your clinician — you can still change them
                  later.
                </p>
                <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className={styles.primaryBtn} onClick={goNext}>
                    Continue →
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className={styles.stepTitle}>What would you like support with?</h2>
                <p className={styles.stepHint}>Choose the closest fit. We’ll use this to filter specialisations.</p>
                <div className={styles.optionGrid} role="radiogroup" aria-label="Area of focus">
                  {FOCUS_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`${styles.option} ${specialization === opt.value ? styles.optionSelected : ''}`}
                    >
                      <input
                        type="radio"
                        name="focus"
                        value={opt.value}
                        checked={specialization === opt.value}
                        onChange={() => setSpecialization(opt.value)}
                      />
                      <span>
                        <span className={styles.optionLabel}>{opt.label}</span>
                        <span className={styles.optionDesc}>{opt.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.backBtn} onClick={goBack}>
                    ← Back
                  </button>
                  <button type="button" className={styles.primaryBtn} onClick={goNext}>
                    Next →
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className={styles.stepTitle}>How would you like to attend?</h2>
                <p className={styles.stepHint}>We’ll show psychologists who offer your preferred session format.</p>
                <div className={styles.optionGrid} role="radiogroup" aria-label="Session format">
                  {SESSION_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`${styles.option} ${sessionType === opt.value ? styles.optionSelected : ''}`}
                    >
                      <input
                        type="radio"
                        name="session"
                        value={opt.value}
                        checked={sessionType === opt.value}
                        onChange={() => setSessionType(opt.value)}
                      />
                      <span>
                        <span className={styles.optionLabel}>{opt.label}</span>
                        <span className={styles.optionDesc}>{opt.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.backBtn} onClick={goBack}>
                    ← Back
                  </button>
                  <button type="button" className={styles.primaryBtn} onClick={goNext}>
                    Next →
                  </button>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h2 className={styles.stepTitle}>Psychologist gender preference</h2>
                <p className={styles.stepHint}>Optional preference — you can choose “No preference”.</p>
                <div className={styles.optionGrid} role="radiogroup" aria-label="Gender preference">
                  {GENDER_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`${styles.option} ${gender === opt.value ? styles.optionSelected : ''}`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={opt.value}
                        checked={gender === opt.value}
                        onChange={() => setGender(opt.value)}
                      />
                      <span className={styles.optionLabel}>{opt.label}</span>
                    </label>
                  ))}
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.backBtn} onClick={goBack}>
                    ← Back
                  </button>
                  <button type="button" className={styles.primaryBtn} onClick={goNext}>
                    Next →
                  </button>
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <h2 className={styles.stepTitle}>When would you like to start?</h2>
                <p className={styles.stepHint}>This refines availability filters on the next screen.</p>
                <div className={styles.optionGrid} role="radiogroup" aria-label="Availability">
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`${styles.option} ${availability === opt.value ? styles.optionSelected : ''}`}
                    >
                      <input
                        type="radio"
                        name="availability"
                        value={opt.value}
                        checked={availability === opt.value}
                        onChange={() => setAvailability(opt.value)}
                      />
                      <span>
                        <span className={styles.optionLabel}>{opt.label}</span>
                        <span className={styles.optionDesc}>{opt.description}</span>
                      </span>
                    </label>
                  ))}
                </div>

                <h3 className={styles.stepTitle} style={{ marginTop: '2rem', fontSize: '1.1rem' }}>
                  Your preferences
                </h3>
                <ul className={styles.summaryList}>
                  <li>
                    <strong>Focus:</strong>{' '}
                    {FOCUS_OPTIONS.find((f) => f.value === specialization)?.label ?? specialization}
                  </li>
                  <li>
                    <strong>Session:</strong>{' '}
                    {SESSION_OPTIONS.find((s) => s.value === sessionType)?.label ?? sessionType}
                  </li>
                  <li>
                    <strong>Gender:</strong> {GENDER_OPTIONS.find((g) => g.value === gender)?.label ?? gender}
                  </li>
                  <li>
                    <strong>Timing:</strong>{' '}
                    {AVAILABILITY_OPTIONS.find((a) => a.value === availability)?.label ?? availability}
                  </li>
                </ul>

                <div className={styles.finishActions}>
                  {isPatient ? (
                    <button type="button" className={styles.primaryBtn} onClick={persistAndRoute}>
                      Continue to book — choose service & psychologist
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={() => {
                          const prefs = buildPreferences(
                            specialization,
                            sessionType,
                            gender,
                            availability
                          );
                          try {
                            sessionStorage.setItem(MATCH_PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
                          } catch {
                            /* ignore */
                          }
                          navigate('/register');
                        }}
                      >
                        Create account & book
                      </button>
                      <button
                        type="button"
                        className={styles.backBtn}
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => {
                          const prefs = buildPreferences(
                            specialization,
                            sessionType,
                            gender,
                            availability
                          );
                          try {
                            sessionStorage.setItem(MATCH_PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
                          } catch {
                            /* ignore */
                          }
                          navigate('/login');
                        }}
                      >
                        Sign in — preferences saved for after login
                      </button>
                      <p className={styles.secondaryLink}>
                        After you sign in as a patient, open <strong>Book appointment</strong> — your filters apply when
                        you choose a psychologist.
                      </p>
                    </>
                  )}
                </div>

                <div className={styles.actions} style={{ marginTop: '1.25rem' }}>
                  <button type="button" className={styles.backBtn} onClick={goBack}>
                    ← Back
                  </button>
                </div>

                <p className={styles.skipNote}>
                  Prefer to browse without the quiz?{' '}
                  <Link to="/services">View services</Link> or{' '}
                  {isPatient ? (
                    <Link to="/appointments/book-appointment">go straight to booking</Link>
                  ) : (
                    <Link to="/register">register to book</Link>
                  )}
                  .
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
