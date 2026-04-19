/**
 * Patient Setup Wizard API client.
 *
 * Thin wrapper over `/api/auth/patient/setup/` endpoints. The wizard UI
 * should prefer this module over direct axios calls so draft/advance
 * semantics stay in one place.
 */

import axiosInstance from './axiosInstance';
import { extractApiErrorMessage } from '../../utils/apiError';
import type { BookingReadinessResponse } from './auth';

// ---- Types ------------------------------------------------------------

export type SetupStepId =
  | 'welcome'
  | 'contact'
  | 'privacy_telehealth'
  | 'billing_path'
  | 'referral'
  | 'intake_min'
  | 'intake_full'
  | 'review';

export type SetupStepStatus = 'not_started' | 'draft' | 'complete';

export interface SetupStepMeta {
  id: SetupStepId;
  title: string;
  status: SetupStepStatus;
  required_for_booking: boolean;
}

export interface PatientSetupState {
  steps: SetupStepMeta[];
  current_step: SetupStepId;
  last_step: SetupStepId;
  completed_steps: SetupStepId[];
  draft: Partial<Record<SetupStepId, Record<string, unknown>>>;
  completed_at: string | null;
  billing_path: 'medicare' | 'private';
  readiness: BookingReadinessResponse;
}

export interface PatchSetupPayload {
  step_id: SetupStepId;
  payload: Record<string, unknown>;
  advance?: boolean;
}

// ---- API calls --------------------------------------------------------

const BASE_URL = '/auth/patient/setup/';

export const patientSetupService = {
  /** Load full wizard state (creates it server-side on first call). */
  getState: async (): Promise<PatientSetupState> => {
    try {
      const response = await axiosInstance.get<PatientSetupState>(BASE_URL);
      return response.data;
    } catch (error) {
      throw new Error(
        extractApiErrorMessage(error, 'Failed to load setup state'),
      );
    }
  },

  /** Save a step's payload. `advance=true` moves `last_step` forward. */
  saveStep: async (body: PatchSetupPayload): Promise<PatientSetupState> => {
    try {
      const response = await axiosInstance.patch<PatientSetupState>(
        BASE_URL,
        body,
      );
      return response.data;
    } catch (error) {
      throw new Error(
        extractApiErrorMessage(error, 'Failed to save setup step'),
      );
    }
  },

  /** Finalize the wizard. Idempotent; 400 when required steps remain. */
  complete: async (): Promise<PatientSetupState & { completed: boolean }> => {
    try {
      const response = await axiosInstance.post<
        PatientSetupState & { completed: boolean }
      >(`${BASE_URL}complete/`);
      return response.data;
    } catch (error) {
      throw new Error(
        extractApiErrorMessage(error, 'Failed to complete setup'),
      );
    }
  },
};

export default patientSetupService;
