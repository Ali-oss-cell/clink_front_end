import axios from 'axios';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, User } from '../../types/simple-auth';

interface PatientRegistrationData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string;
  address_line_1: string;
  suburb: string;
  state: string;
  postcode: string;
  medicare_number: string;
  terms_accepted: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';


// Create axios instance for auth endpoints
const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`, // Now: http://127.0.0.1:8000/api/auth
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Helps with CSRF protection
  },
});

// Note: CORS headers must be configured on the Django backend
// These client-side headers don't work for CORS

// Request interceptor to add auth token and ensure correct headers
authAPI.interceptors.request.use((config) => {
  // Ensure Content-Type is always set for JSON requests
  if (config.data && typeof config.data === 'object') {
    config.headers['Content-Type'] = 'application/json';
  }
  
  // NEVER add Authorization header for login/register endpoints
  const isAuthEndpoint = config.url?.includes('/login/') || config.url?.includes('/register/');
  
  if (!isAuthEndpoint) {
    // Only add Authorization for protected endpoints
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  // Add CSRF token if available (for Django CSRF protection)
  const csrfToken = localStorage.getItem('csrf_token');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  
  
  return config;
});

// Response interceptor to handle errors
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {

    // Handle different error types
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Backend server is not running. Please start your Django server on port 8000.');
    }
    
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your internet connection and backend server.');
    }

    if (error.response?.status === 401) {
      // Handle token refresh logic
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', response.data.access);
          return authAPI.request(error.config);
        } catch (refreshError) {
          // Clear tokens and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }

    if (error.response?.status === 404) {
      // Skip generic 404 handling for data-access-request endpoint - let the function handle it
      const isDataAccessRequest = error.config?.url?.includes('/data-access-request/');
      if (!isDataAccessRequest) {
        throw new Error('API endpoint not found. Please check your Django URLs configuration.');
      }
      // For data-access-request, preserve the original error so the function can handle it
      // Don't throw here - let it pass through to Promise.reject(error) below
    }

    if (error.response?.status === 500) {
      throw new Error('Server error. Please check your Django backend logs.');
    }

    return Promise.reject(error);
  }
);

// Helper function to create headers for different scenarios
const createHeaders = (includeAuth: boolean = true, includeCSRF: boolean = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  if (includeAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (includeCSRF) {
    const csrfToken = localStorage.getItem('csrf_token');
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
  }

  return headers;
};

export interface DataAccessRequestResponse {
  message: string;
  request_date: string;
  data: {
    request_date: string;
    patient_id: number;
    personal_information: any;
    patient_profile: any;
    appointments: any[];
    progress_notes: any[];
    billing: {
      invoices: any[];
      payments: any[];
      medicare_claims: any[];
    };
    consent_records: any;
    audit_logs: any[];
  };
  summary: {
    total_appointments: number;
    total_progress_notes: number;
    total_invoices: number;
    total_payments: number;
    total_medicare_claims: number;
  };
}

export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      // Use explicit headers for login (no auth required)
      const headers = createHeaders(false, false);
      
      
      const response = await authAPI.post('/login/', credentials, { headers });
      const data = response.data;
      
      // Django backend returns tokens directly in response: { access, refresh, user }
      if (data.access && data.refresh) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
      } else {
        throw new Error('Invalid response format: missing tokens');
      }
      
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        throw new Error('Invalid response format: missing user data');
      }
      
      return data;
    } catch (error: any) {
      // Django backend returns error in 'error' field
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Login failed');
    }
  },


  // Logout user
  logout: async (): Promise<void> => {
    try {
      // Call logout endpoint if token exists
      const token = localStorage.getItem('access_token');
      if (token) {
        await authAPI.post('/logout/');
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Use explicit headers for protected endpoint (auth required)
      const headers = createHeaders(true, false);
      
      const response = await authAPI.get('/profile/', { headers });
      return response.data;
    } catch (error) {
      // Return stored user if API fails
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get stored user
  getStoredUser: (): User | null => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await authAPI.post('/register/', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  },

  // Register new patient with full details
  registerPatient: async (userData: PatientRegistrationData): Promise<RegisterResponse> => {
    try {
      // Remove terms_accepted from API request (frontend only)
      const { terms_accepted, ...apiData } = userData;
      
      // Validate required fields before sending
      const requiredFields = [
        'email', 'password', 'password_confirm', 'first_name', 'last_name',
        'phone_number', 'date_of_birth', 'address_line_1', 'suburb', 'state', 'postcode'
      ];
      
      const missingFields = requiredFields.filter(field => !apiData[field as keyof typeof apiData]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Use explicit headers for registration (no auth required)
      const headers = createHeaders(false, false);
      
      console.log('[AuthService] Registering patient with data:', {
        ...apiData,
        password: '***',
        password_confirm: '***'
      });
      
      const response = await authAPI.post('/register/patient/', apiData, { headers });
      const data = response.data;
      
      // Store tokens and user data if provided
      if (data.access && data.refresh) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
      }
      
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error: any) {
      console.error('[AuthService] Registration error:', error);
      
      // Handle 400 Bad Request with detailed validation errors
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        // Check if backend returns detailed validation errors
        if (errorData.details && typeof errorData.details === 'object') {
          // Format field-specific errors
          const fieldErrors: string[] = [];
          Object.entries(errorData.details).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach((msg: string) => {
                fieldErrors.push(`${field}: ${msg}`);
              });
            } else {
              fieldErrors.push(`${field}: ${messages}`);
            }
          });
          
          const errorMessage = errorData.error 
            ? `${errorData.error}\n\n${fieldErrors.join('\n')}`
            : `Validation failed:\n${fieldErrors.join('\n')}`;
          
          throw new Error(errorMessage);
        }
        
        // Fallback to detail or error message
        const errorMessage = errorData.detail || errorData.error || 'Registration validation failed';
        throw new Error(errorMessage);
      }
      
      // Handle network errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      
      // Handle other errors
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.error 
        || error.message 
        || 'Patient registration failed';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Request patient's personal data export (APP 12 - Privacy Act 1988)
   * @param exportFormat - Format for data export: 'json', 'pdf', or 'csv'
   * @returns Promise with data or file blob
   * Note: Uses 'export_format' parameter to avoid DRF format negotiation conflict
   */
  requestDataAccess: async (exportFormat: 'json' | 'pdf' | 'csv' = 'json'): Promise<any> => {
    // Define fullUrl outside try block so it's available in catch
    const fullUrl = `${authAPI.defaults.baseURL}/data-access-request/?export_format=${exportFormat}`;
    
    try {
      // Verify token exists
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Please log in to access your data.');
      }

      console.log('[AuthService] Requesting data access:', {
        exportFormat,
        url: fullUrl,
        baseURL: authAPI.defaults.baseURL,
        hasToken: !!token,
        tokenLength: token?.length
      });

      const response = await authAPI.get('/data-access-request/', {
        params: { 
          export_format: exportFormat  // CRITICAL: Use 'export_format' not 'format'
        },
        responseType: exportFormat === 'json' ? 'json' : 'blob',
        timeout: 30000, // 30 second timeout for large exports
      });

      console.log('[AuthService] Data access response:', {
        status: response.status,
        contentType: response.headers['content-type'],
        dataType: typeof response.data,
      });

      // For JSON, return the data directly
      if (exportFormat === 'json') {
        return response.data;
      }

      // For PDF/CSV, create a blob and trigger download
      if (response.data) {
        const blob = new Blob([response.data], {
          type: exportFormat === 'pdf' ? 'application/pdf' : 'text/csv'
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Get filename from Content-Disposition header or generate one
        // Axios headers are case-insensitive, try both lowercase and original case
        const contentDisposition = response.headers['content-disposition'] || 
                                   response.headers['Content-Disposition'];
        let filename = `my-data-${new Date().toISOString().split('T')[0]}.${exportFormat}`;

        if (contentDisposition) {
          // Match filename="..." or filename=...
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            // Remove quotes if present
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }

        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('[AuthService] File downloaded:', filename);
        return { success: true, filename };
      }

      throw new Error('No data received from server');
    } catch (error: any) {
      console.error('[AuthService] Error requesting data access:', error);
      console.error('[AuthService] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        code: error.code,
        message: error.message,
      });

      // Handle specific HTTP status codes
      if (error.response) {
        const status = error.response.status;

        if (status === 403) {
          throw new Error('You do not have permission to access this data');
        } else if (status === 404) {
          throw new Error('Data access endpoint not found. Please contact support.');
        } else if (status === 406) {
          throw new Error('Server cannot generate the requested format. Please try a different format.');
        } else if (status === 401) {
          throw new Error('Please log in to access your data.');
        }

        // For blob responses, check if error is JSON
        const contentType = error.response.headers?.['content-type'] || '';
        if (contentType.includes('application/json')) {
          // Error was returned as JSON blob, try to parse it
          if (error.response.data instanceof Blob) {
            try {
              const text = await error.response.data.text();
              const errorData = JSON.parse(text);
              throw new Error(errorData.detail || errorData.error || 'Failed to request data access');
            } catch (parseError) {
              throw new Error('Failed to request data access');
            }
          } else {
            // Regular JSON error
            throw new Error(error.response.data?.detail || error.response.data?.error || 'Failed to request data access');
          }
        } else {
          throw new Error(`Failed to request data access (Status: ${status}). Please try again.`);
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. The export is taking too long.');
      } else if (error.request) {
        // Network error - no response from server
        console.error('[AuthService] Network error - No response from server');
        console.error('[AuthService] Request URL:', fullUrl);
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        // Request setup error
        throw new Error(error.message || 'Failed to request data access');
      }
    }
  },

};
