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
      throw new Error('API endpoint not found. Please check your Django URLs configuration.');
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
      
      // Use explicit headers for registration (no auth required)
      const headers = createHeaders(false, false);
      
      
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
      throw new Error(error.response?.data?.detail || 'Patient registration failed');
    }
  },

};
