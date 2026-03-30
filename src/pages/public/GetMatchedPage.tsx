import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { psychologistService, type MatchPreviewPsychologist } from '../../services/api/psychologist';
import {
  MATCH_PREFERENCES_STORAGE_KEY,
  type MatchPreferences,
  type MatchSpecializationFilter,
  type MatchSessionTypeFilter,
  type MatchGenderFilter,
  type MatchAvailabilityFilter,
} from '../../constants/matchPreferences';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import styles from './GetMatchedPage.module.scss';

const TOTAL_STEPS = 5;
const MATCH_GOAL_STORAGE_KEY = 'tailored_match_goal';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState(() => Math.max(1, Math.min(TOTAL_STEPS, Number(searchParams.get('step')) || 1)));
  const [specialization, setSpecialization] = useState<MatchSpecializationFilter>('all');
  const [sessionType, setSessionType] = useState<MatchSessionTypeFilter>('both');
  const [gender, setGender] = useState<MatchGenderFilter>('any');
  const [availability, setAvailability] = useState<MatchAvailabilityFilter>('any');
  const [goalText, setGoalText] = useState('');
  const [previewMatches, setPreviewMatches] = useState<MatchPreviewPsychologist[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  const user = authService.getStoredUser();
  const isPatient = user?.role === 'patient';

  const progressPct = useMemo(() => (step / TOTAL_STEPS) * 100, [step]);
  const estimatedMinutes = 1;
  const matchConfidence = useMemo(() => {
    let score = 38;
    if (specialization !== 'all') score += 22;
    if (sessionType !== 'both') score += 14;
    if (gender !== 'any') score += 8;
    if (availability !== 'any') score += 12;
    if (goalText.trim().length >= 12) score += 6;
    return Math.min(100, score);
  }, [availability, gender, goalText, sessionType, specialization]);

  useEffect(() => {
    const qSpecialization = searchParams.get('specialization') as MatchSpecializationFilter | null;
    const qSession = searchParams.get('sessionType') as MatchSessionTypeFilter | null;
    const qGender = searchParams.get('gender') as MatchGenderFilter | null;
    const qAvailability = searchParams.get('availability') as MatchAvailabilityFilter | null;
    const qGoal = searchParams.get('goal') ?? '';
    if (qSpecialization && FOCUS_OPTIONS.some((f) => f.value === qSpecialization)) setSpecialization(qSpecialization);
    if (qSession && SESSION_OPTIONS.some((s) => s.value === qSession)) setSessionType(qSession);
    if (qGender && GENDER_OPTIONS.some((g) => g.value === qGender)) setGender(qGender);
    if (qAvailability && AVAILABILITY_OPTIONS.some((a) => a.value === qAvailability)) setAvailability(qAvailability);
    if (qGoal) setGoalText(qGoal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const next = new URLSearchParams();
    next.set('step', String(step));
    next.set('specialization', specialization);
    next.set('sessionType', sessionType);
    next.set('gender', gender);
    next.set('availability', availability);
    if (goalText.trim()) next.set('goal', goalText.trim());
    setSearchParams(next, { replace: true });
  }, [availability, gender, goalText, sessionType, setSearchParams, specialization, step]);

  useEffect(() => {
    let active = true;
    async function loadPreview() {
      if (step !== 5) return;
      setPreviewLoading(true);
      setPreviewError('');
      try {
        const data = await psychologistService.getMatchPreview({
          specialization,
          session_type: sessionType,
          gender,
          availability,
          goal: goalText.trim() || undefined,
          limit: 3,
        });
        if (active) setPreviewMatches(data);
      } catch (error: any) {
        if (active) {
          setPreviewError(error?.message || 'Failed to load match preview');
          setPreviewMatches([]);
        }
      } finally {
        if (active) setPreviewLoading(false);
      }
    }
    loadPreview();
    return () => {
      active = false;
    };
  }, [availability, gender, goalText, sessionType, specialization, step]);

  const persistAndRoute = () => {
    const prefs = buildPreferences(specialization, sessionType, gender, availability);
    try {
      sessionStorage.setItem(MATCH_PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
      sessionStorage.setItem(MATCH_GOAL_STORAGE_KEY, goalText.trim());
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
                A few quick questions help narrow who may fit your goals and schedule. Your answers stay private and
                secure.
              </p>
              <p className={styles.heroMeta}>
                Takes about {estimatedMinutes} minute • Match confidence: <strong>{matchConfidence}%</strong>
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
                  <Button type="button" className={styles.primaryBtn} onClick={goNext}>
                    Continue →
                  </Button>
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
                      <Input
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
                <div className={styles.goalBox}>
                  <label htmlFor="goalText" className={styles.goalLabel}>
                    Optional: In one sentence, what do you want help with?
                  </label>
                  <Textarea
                    id="goalText"
                    className={styles.goalInput}
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                    rows={3}
                    placeholder="Example: I want support with sleep, overthinking, and feeling stuck at work."
                  />
                </div>
                <div className={styles.actions}>
                  <Button type="button" className={styles.backBtn} onClick={goBack}>
                    ← Back
                  </Button>
                  <Button type="button" className={styles.primaryBtn} onClick={goNext}>
                    Next →
                  </Button>
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
                      <Input
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
                  <Button type="button" className={styles.backBtn} onClick={goBack}>
                    ← Back
                  </Button>
                  <Button type="button" className={styles.primaryBtn} onClick={goNext}>
                    Next →
                  </Button>
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
                      <Input
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
                  <Button type="button" className={styles.backBtn} onClick={goBack}>
                    ← Back
                  </Button>
                  <Button type="button" className={styles.primaryBtn} onClick={goNext}>
                    Next →
                  </Button>
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
                      <Input
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
                    <Button type="button" className={styles.editLink} onClick={() => setStep(2)}>
                      Edit
                    </Button>
                  </li>
                  <li>
                    <strong>Session:</strong>{' '}
                    {SESSION_OPTIONS.find((s) => s.value === sessionType)?.label ?? sessionType}
                    <Button type="button" className={styles.editLink} onClick={() => setStep(3)}>
                      Edit
                    </Button>
                  </li>
                  <li>
                    <strong>Gender:</strong> {GENDER_OPTIONS.find((g) => g.value === gender)?.label ?? gender}
                    <Button type="button" className={styles.editLink} onClick={() => setStep(4)}>
                      Edit
                    </Button>
                  </li>
                  <li>
                    <strong>Timing:</strong>{' '}
                    {AVAILABILITY_OPTIONS.find((a) => a.value === availability)?.label ?? availability}
                    <Button type="button" className={styles.editLink} onClick={() => setStep(5)}>
                      Edit
                    </Button>
                  </li>
                  {goalText.trim() && (
                    <li>
                      <strong>Goal note:</strong> {goalText.trim()}
                      <Button type="button" className={styles.editLink} onClick={() => setStep(2)}>
                        Edit
                      </Button>
                    </li>
                  )}
                </ul>

                {specialization === 'trauma' && availability === 'this-week' && (
                  <div className={styles.safetyNote} role="status" aria-live="polite">
                    If you are in immediate danger or crisis, call <strong>000</strong> or Lifeline <strong>13 11 14</strong>.
                    This matching tool is not a crisis service.
                  </div>
                )}

                <div className={styles.previewBlock}>
                  <h3 className={styles.previewTitle}>Likely top matches</h3>
                  <p className={styles.previewHint}>Preview from backend scoring. You can still choose anyone later.</p>
                  {previewLoading ? (
                    <p className={styles.previewHint}>Loading matches...</p>
                  ) : previewError ? (
                    <p className={styles.previewHint}>{previewError}</p>
                  ) : previewMatches.length === 0 ? (
                    <p className={styles.previewHint}>No matches available yet. Try adjusting your preferences.</p>
                  ) : (
                    <div className={styles.previewGrid}>
                      {previewMatches.map((match) => (
                        <article key={match.id} className={styles.previewCard}>
                          <h4>{match.name}</h4>
                          <p>
                            {match.title} · <strong>{match.match_score}%</strong> fit
                          </p>
                          <ul>
                            {match.reasons.map((r) => (
                              <li key={r}>{r}</li>
                            ))}
                          </ul>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.finishActions}>
                  {isPatient ? (
                    <Button type="button" className={styles.primaryBtn} onClick={persistAndRoute}>
                      Continue to book — choose service & psychologist
                    </Button>
                  ) : (
                    <>
                      <Button
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
                            sessionStorage.setItem(MATCH_GOAL_STORAGE_KEY, goalText.trim());
                          } catch {
                            /* ignore */
                          }
                          navigate('/register');
                        }}
                      >
                        Create account & book
                      </Button>
                      <Button
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
                            sessionStorage.setItem(MATCH_GOAL_STORAGE_KEY, goalText.trim());
                          } catch {
                            /* ignore */
                          }
                          navigate('/login');
                        }}
                      >
                        Sign in — preferences saved for after login
                      </Button>
                      <p className={styles.secondaryLink}>
                        After you sign in as a patient, open <strong>Book appointment</strong> — your filters apply when
                        you choose a psychologist.
                      </p>
                    </>
                  )}
                </div>

                <div className={styles.actions} style={{ marginTop: '1.25rem' }}>
                  <Button type="button" className={styles.backBtn} onClick={goBack}>
                    ← Back
                  </Button>
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
                <p className={styles.privacyLine}>
                  Privacy note: your answers are used to improve matching and booking flow only.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
