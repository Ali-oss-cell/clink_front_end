/**
 * Preferences collected on the public "Get matched" flow, applied when the
 * patient reaches psychologist selection (filters pre-filled once).
 */
export const MATCH_PREFERENCES_STORAGE_KEY = 'tailored_match_preferences';

/** Current wizard step (1–5) for /get-matched resume */
export const MATCH_STEP_STORAGE_KEY = 'tailored_match_step';

export type MatchSpecializationFilter =
  | 'all'
  | 'anxiety'
  | 'depression'
  | 'trauma'
  | 'adhd'
  | 'relationship';

export type MatchSessionTypeFilter = 'both' | 'in-person' | 'telehealth';

export type MatchGenderFilter = 'any' | 'male' | 'female' | 'non-binary';

export type MatchAvailabilityFilter = 'any' | 'this-week' | 'next-week';

export interface MatchPreferences {
  specialization: MatchSpecializationFilter;
  sessionType: MatchSessionTypeFilter;
  gender: MatchGenderFilter;
  availability: MatchAvailabilityFilter;
}

export function parseMatchPreferences(raw: string | null): MatchPreferences | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<MatchPreferences>;
    if (!data || typeof data !== 'object') return null;
    return {
      specialization: (data.specialization as MatchSpecializationFilter) || 'all',
      sessionType: (data.sessionType as MatchSessionTypeFilter) || 'both',
      gender: (data.gender as MatchGenderFilter) || 'any',
      availability: (data.availability as MatchAvailabilityFilter) || 'any',
    };
  } catch {
    return null;
  }
}
