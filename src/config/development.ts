// Development configuration for local testing
export const developmentConfig = {
  // API Configuration
  API_BASE_URL: 'http://127.0.0.1:8000',
  API_TIMEOUT: 10000,
  
  // CORS Configuration
  CORS_ORIGINS: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  
  // Debug Settings
  DEBUG: true,
  LOG_LEVEL: 'debug',
  
  
  // Django Backend Integration
  DJANGO_BACKEND_URL: 'http://127.0.0.1:8000',
  DJANGO_API_PREFIX: '/api',
  ENABLE_BACKEND_TESTS: true, // Enable backend connectivity tests
  
  // Authentication
  TOKEN_STORAGE_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_STORAGE_KEY: 'user',
  
  // Development Features
  ENABLE_REDUX_DEVTOOLS: true,
  ENABLE_HOT_RELOAD: true,
  ENABLE_ERROR_BOUNDARIES: true
};

export default developmentConfig;
