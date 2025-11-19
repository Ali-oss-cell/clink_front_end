import axiosInstance from './axiosInstance';

export interface PrivacyPolicyStatus {
  accepted: boolean;
  accepted_date: string | null;
  version: string;
  latest_version: string;
  needs_update: boolean;
  privacy_policy_url: string;
}

export interface AcceptPrivacyPolicyResponse {
  message: string;
  accepted_date: string;
  version: string;
  privacy_policy_url: string;
}

export interface WithdrawConsentRequest {
  consent_type: 'all' | 'treatment' | 'data_sharing' | 'marketing';
  reason?: string;
}

export interface WithdrawConsentResponse {
  message: string;
  withdrawn_date: string;
  withdrawal_reason: string;
}

/**
 * Get Privacy Policy acceptance status
 * 
 * Common errors:
 * - 401: User not authenticated or token expired
 * - 403: User is not a patient (endpoint only works for patients)
 * - 404: Endpoint not found (migration may not be run)
 * - 500: Server error
 */
export const getPrivacyPolicyStatus = async (): Promise<PrivacyPolicyStatus> => {
  try {
    // Check if user is authenticated
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('User not authenticated. Please log in first.');
    }

    const response = await axiosInstance.get<PrivacyPolicyStatus>('/auth/privacy-policy/');
    return response.data;
  } catch (error: any) {
    console.error('[PrivacyService] Error getting Privacy Policy status:', error);
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      // Provide specific error messages based on status code
      switch (status) {
        case 401:
          console.error('[PrivacyService] Authentication failed. Token may be expired or invalid.');
          throw new Error('Authentication failed. Please log in again.');
        case 403:
          console.error('[PrivacyService] Access forbidden. User may not be a patient.');
          throw new Error('Access denied. This feature is only available for patients.');
        case 404:
          console.error('[PrivacyService] Endpoint not found. Migration may not be run: python manage.py migrate');
          throw new Error('Privacy Policy endpoint not found. Please contact support.');
        case 500:
          console.error('[PrivacyService] Server error:', errorData);
          throw new Error('Server error. Please try again later.');
        default:
          const errorMessage = errorData?.detail || errorData?.error || errorData?.message || 'Failed to get Privacy Policy status';
          console.error(`[PrivacyService] Error ${status}:`, errorMessage);
          throw new Error(errorMessage);
      }
    } else if (error.request) {
      console.error('[PrivacyService] Network error - No response from server');
      console.error('[PrivacyService] This usually means:');
      console.error('  1. Django server is not running: python manage.py runserver');
      console.error('  2. Wrong baseURL in axios configuration');
      console.error('  3. Firewall/network blocking the connection');
      throw new Error('Network error: Unable to connect to server. Please check if the server is running.');
    } else {
      // Request setup error
      console.error('[PrivacyService] Request setup error:', error.message);
      throw new Error(error.message || 'Failed to get Privacy Policy status');
    }
  }
};

/**
 * Accept Privacy Policy
 * 
 * Common errors:
 * - 401: User not authenticated or token expired
 * - 403: User is not a patient
 * - 404: Endpoint not found (migration may not be run)
 */
export const acceptPrivacyPolicy = async (): Promise<AcceptPrivacyPolicyResponse> => {
  try {
    // Check if user is authenticated
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('User not authenticated. Please log in first.');
    }

    const response = await axiosInstance.post<AcceptPrivacyPolicyResponse>('/auth/privacy-policy/');
    console.log('[PrivacyService] Privacy Policy accepted successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[PrivacyService] Error accepting Privacy Policy:', error);
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      switch (status) {
        case 401:
          throw new Error('Authentication failed. Please log in again.');
        case 403:
          throw new Error('Access denied. This feature is only available for patients.');
        case 404:
          throw new Error('Privacy Policy endpoint not found. Please contact support.');
        default:
          throw new Error(errorData?.detail || errorData?.error || errorData?.message || 'Failed to accept Privacy Policy');
      }
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server. Please check if the server is running.');
    } else {
      throw new Error(error.message || 'Failed to accept Privacy Policy');
    }
  }
};

/**
 * Withdraw consent
 */
export const withdrawConsent = async (
  consentType: 'all' | 'treatment' | 'data_sharing' | 'marketing',
  reason?: string
): Promise<WithdrawConsentResponse> => {
  try {
    const response = await axiosInstance.post<WithdrawConsentResponse>(
      '/auth/consent/withdraw/',
      {
        consent_type: consentType,
        reason: reason || '',
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('[PrivacyService] Error withdrawing consent:', error);
    if (error.response) {
      throw new Error(error.response.data?.detail || error.response.data?.error || 'Failed to withdraw consent');
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw new Error(error.message || 'Failed to withdraw consent');
    }
  }
};

