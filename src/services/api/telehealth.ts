import axiosInstance from './axiosInstance';

export interface TelehealthConsentResponse {
  consent_to_telehealth: boolean;
  telehealth_consent_version?: string | null;
  telehealth_consent_date?: string | null;
  telehealth_emergency_protocol_acknowledged: boolean;
  telehealth_emergency_contact: string;
  telehealth_emergency_plan: string;
  telehealth_tech_requirements_acknowledged: boolean;
  telehealth_recording_consent: boolean;
  updated_at?: string;
}

export interface TelehealthConsentRequest {
  consent_to_telehealth: boolean;
  telehealth_emergency_protocol_acknowledged: boolean;
  telehealth_emergency_contact: string;
  telehealth_emergency_plan: string;
  telehealth_tech_requirements_acknowledged: boolean;
  telehealth_recording_consent?: boolean;
}

export const TelehealthService = {
  async getConsent(): Promise<TelehealthConsentResponse> {
    try {
      const response = await axiosInstance.get<TelehealthConsentResponse>('/auth/telehealth-consent/');
      return response.data;
    } catch (error: any) {
      console.error('[TelehealthService] Failed to fetch telehealth consent:', error);
      if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.detail ||
          error.response.data?.error ||
          'Unable to load telehealth consent. Please try again.';

        if (status === 404) {
          throw new Error('Telehealth consent endpoint not found. Please contact support.');
        }

        throw new Error(message);
      }

      if (error.request) {
        throw new Error('Network error: Unable to connect to server.');
      }

      throw new Error(error.message || 'Failed to load telehealth consent');
    }
  },

  async submitConsent(payload: TelehealthConsentRequest): Promise<TelehealthConsentResponse> {
    try {
      const response = await axiosInstance.post<TelehealthConsentResponse>('/auth/telehealth-consent/', payload);
      return response.data;
    } catch (error: any) {
      console.error('[TelehealthService] Failed to submit telehealth consent:', error);
      if (error.response) {
        const message =
          error.response.data?.detail ||
          error.response.data?.error ||
          'Unable to save telehealth consent. Please review the form.';
        throw new Error(message);
      }

      if (error.request) {
        throw new Error('Network error: Unable to connect to server.');
      }

      throw new Error(error.message || 'Failed to submit telehealth consent');
    }
  },
};

