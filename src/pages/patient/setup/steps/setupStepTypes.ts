import type { PatientSetupState } from '../../../../services/api/patientSetup';

/**
 * Props shared by every wizard step. A step:
 * - Receives the full setup state (for readiness + prefill).
 * - Calls `onAdvance` to persist the step and move forward.
 * - Calls `onDraft` for "save and exit" autosave.
 */
export interface SetupStepComponentProps {
  state: PatientSetupState;
  onAdvance: (payload: Record<string, unknown>) => Promise<void>;
  onDraft: (payload: Record<string, unknown>) => Promise<void>;
  onBack: () => void;
  saving: boolean;
  error: string | null;
}
