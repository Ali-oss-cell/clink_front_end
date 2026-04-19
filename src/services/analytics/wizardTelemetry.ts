const WIZARD_SESSION_KEY = 'wizard_session_id';
const WIZARD_EVENT_LOG_KEY = 'wizard_event_log';
const MAX_STORED_EVENTS = 200;

export type WizardTelemetryEventName =
  | 'wizard_viewed'
  | 'wizard_step_viewed'
  | 'wizard_step_advanced'
  | 'wizard_step_back'
  | 'wizard_complete_clicked'
  | 'wizard_filter_expanded'
  | 'wizard_recommended_selected'
  | 'wizard_manual_mode_enabled'
  | 'wizard_time_window_selected';

export interface WizardTelemetryPayload {
  event_name: WizardTelemetryEventName;
  step_id?: string;
  billing_path?: 'medicare' | 'private' | 'unknown';
  metadata?: Record<string, unknown>;
}

export const resolveReleaseTag = (): string => {
  const tag = (import.meta.env.VITE_RELEASE_TAG || import.meta.env.VITE_APP_RELEASE_TAG || '').trim();
  return tag || 'unknown';
};

export const getOrCreateWizardSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  const existing = sessionStorage.getItem(WIZARD_SESSION_KEY);
  if (existing) return existing;
  const next = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `wiz-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  sessionStorage.setItem(WIZARD_SESSION_KEY, next);
  return next;
};

export const getWizardTelemetryHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};
  const sessionId = getOrCreateWizardSessionId();
  if (sessionId) headers['X-Wizard-Session-Id'] = sessionId;
  headers['X-Release-Tag'] = resolveReleaseTag();
  return headers;
};

const safeParseEvents = (raw: string | null): any[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const trackWizardEvent = (payload: WizardTelemetryPayload): void => {
  if (typeof window === 'undefined') return;
  const entry = {
    ...payload,
    wizard_session_id: getOrCreateWizardSessionId(),
    release_tag: resolveReleaseTag(),
    ts: new Date().toISOString(),
  };
  const existing = safeParseEvents(sessionStorage.getItem(WIZARD_EVENT_LOG_KEY));
  const next = [...existing, entry].slice(-MAX_STORED_EVENTS);
  sessionStorage.setItem(WIZARD_EVENT_LOG_KEY, JSON.stringify(next));
  if (import.meta.env.DEV) {
    // Useful for quick smoke checks until backend ingestion endpoint exists.
    console.debug('[wizard-telemetry]', entry);
  }
};

