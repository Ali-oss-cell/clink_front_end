import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

// Get API base URL from environment variable or use default
// In production, this should be set via VITE_API_BASE_URL
const getApiBaseUrl = () => {
  // Check environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Fallback based on environment
  if (import.meta.env.PROD) {
    return 'https://api.tailoredpsychology.com.au/api';
  }
  
  return 'http://127.0.0.1:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Log API configuration for debugging
if (import.meta.env.DEV || (import.meta.env.PROD && API_BASE_URL.includes('127.0.0.1'))) {
  console.log('[API Config] Environment:', import.meta.env.MODE);
  console.log('[API Config] VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'NOT SET');
  console.log('[API Config] Using API URL:', API_BASE_URL);
  if (import.meta.env.PROD && API_BASE_URL.includes('127.0.0.1')) {
    console.warn('[API Config] ⚠️ WARNING: Production build is using localhost!');
    console.warn('[API Config] Make sure VITE_API_BASE_URL is set in .env.production');
  }
}

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for video token requests
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // CORS with credentials - set to false for Bearer token auth
});

// Expose config for browser console debugging
if (typeof window !== 'undefined') {
  (window as any).__API_CONFIG__ = {
    baseURL: API_BASE_URL,
    env: import.meta.env.MODE,
    viteApiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'NOT SET',
    isProd: import.meta.env.PROD,
    axiosBaseURL: axiosInstance.defaults.baseURL,
    checkConfig: () => {
      console.log('📋 API Configuration:');
      console.log('  Base URL:', API_BASE_URL);
      console.log('  Environment:', import.meta.env.MODE);
      console.log('  VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'NOT SET');
      console.log('  Is Production:', import.meta.env.PROD);
      console.log('  Axios Instance BaseURL:', axiosInstance.defaults.baseURL);
      return {
        baseURL: API_BASE_URL,
        env: import.meta.env.MODE,
        viteApiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'NOT SET',
        isProd: import.meta.env.PROD,
        axiosBaseURL: axiosInstance.defaults.baseURL
      };
    }
  };
}

// Request interceptor - Add auth token to all requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors and token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', response.data.access);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized:', error.response.data);
          break;
        case 403:
          console.error('Forbidden:', error.response.data);
          break;
        case 404:
          console.error('Not found:', error.response.data);
          break;
        case 500:
          console.error('Server error:', error.response.data);
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received
      const requestUrl = error.config?.baseURL 
        ? `${error.config.baseURL}${error.config.url}` 
        : 'Unknown URL';
      console.error('[Axios] Network error: No response from server');
      console.error('[Axios] Request URL:', requestUrl);
      console.error('[Axios] Method:', error.config?.method?.toUpperCase());
      console.error('[Axios] This usually indicates:');
      console.error('  1. CORS issue - backend not allowing requests from frontend');
      console.error('  2. Network connectivity issue');
      console.error('  3. Backend server is down or unreachable');
      console.error('  4. SSL/certificate issue');
      console.error('[Axios] Check browser Network tab for detailed error');
    } else {
      // Something else happened
      console.error('[Axios] Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

