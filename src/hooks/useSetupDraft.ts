/**
 * Loads patient setup state and exposes draft helpers for each step.
 *
 * Philosophy:
 * - Steps own their own local form state (controlled inputs / libraries).
 * - The hook persists every "save" or "advance" to the server so reload /
 *   different device always resumes from the canonical place.
 * - The hook never reaches into localStorage — the server is truth.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  patientSetupService,
  type PatchSetupPayload,
  type PatientSetupState,
  type SetupStepId,
} from '../services/api/patientSetup';

export interface UseSetupDraftResult {
  state: PatientSetupState | null;
  loading: boolean;
  saving: boolean;
  completing: boolean;
  error: string | null;

  /** Force-refresh from server. */
  refresh: () => Promise<void>;

  /**
   * Save a step payload. When ``advance`` is true and the step becomes
   * complete server-side, the wizard will move forward.
   */
  saveStep: (
    step: SetupStepId,
    payload: Record<string, unknown>,
    options?: { advance?: boolean },
  ) => Promise<PatientSetupState>;

  /** Fire-and-forget draft persist (advance=false). */
  saveDraft: (
    step: SetupStepId,
    payload: Record<string, unknown>,
  ) => Promise<PatientSetupState>;

  /** POST /complete/. Idempotent. */
  complete: () => Promise<PatientSetupState & { completed: boolean }>;
}

export function useSetupDraft(): UseSetupDraftResult {
  const [state, setState] = useState<PatientSetupState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientSetupService.getState();
      if (mounted.current) setState(data);
    } catch (e) {
      if (mounted.current) {
        setError(e instanceof Error ? e.message : 'Failed to load setup');
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const patch = useCallback(async (body: PatchSetupPayload) => {
    setSaving(true);
    setError(null);
    try {
      const data = await patientSetupService.saveStep(body);
      if (mounted.current) setState(data);
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save step';
      if (mounted.current) setError(msg);
      throw e;
    } finally {
      if (mounted.current) setSaving(false);
    }
  }, []);

  const saveStep = useCallback(
    (
      step: SetupStepId,
      payload: Record<string, unknown>,
      options?: { advance?: boolean },
    ) =>
      patch({
        step_id: step,
        payload,
        advance: options?.advance ?? true,
      }),
    [patch],
  );

  const saveDraft = useCallback(
    (step: SetupStepId, payload: Record<string, unknown>) =>
      patch({ step_id: step, payload, advance: false }),
    [patch],
  );

  const complete = useCallback(async () => {
    setCompleting(true);
    setError(null);
    try {
      const data = await patientSetupService.complete();
      if (mounted.current) setState(data);
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to complete setup';
      if (mounted.current) setError(msg);
      throw e;
    } finally {
      if (mounted.current) setCompleting(false);
    }
  }, []);

  return {
    state,
    loading,
    saving,
    completing,
    error,
    refresh,
    saveStep,
    saveDraft,
    complete,
  };
}
