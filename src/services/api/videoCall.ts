import axiosInstance from './axiosInstance';

export interface VideoTokenRequest {
  identity: string; // User's full name
}

export interface VideoTokenResponse {
  access_token: string; // Twilio JWT token for joining the video room
  room_name: string; // The Twilio room name to connect to
  user_identity: string; // User identifier (format: {user_id}-{email})
  expires_in: number; // Token expiration time in seconds
  expires_at: string; // ISO 8601 timestamp when token expires
  appointment_id: number; // The appointment ID
  appointment_duration_minutes: number; // Duration of the appointment
  token_valid_until: string; // Human-readable description of token validity
}

export interface VideoRoomInfo {
  room_name: string;
  appointment_id: number;
  status: string;
  created_at: string;
}

class VideoCallService {
  /**
   * Get Twilio video access token for an appointment
   * @param appointmentId - The appointment ID
   * @returns Video token response with access_token, room_name, and expiration info
   * @throws Error with user-friendly message for 403, 404, 500, or network errors
   */
  async getVideoToken(appointmentId: number | string): Promise<VideoTokenResponse> {
    try {
      // Verify token exists before making request
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Construct full URL for logging
      const endpoint = `/appointments/video-token/${appointmentId}/`;
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
        (import.meta.env.PROD 
          ? 'https://api.tailoredpsychology.com.au/api' 
          : 'http://127.0.0.1:8000/api');
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      
      console.log(`[VideoCallService] Requesting token for appointment ${appointmentId}`);
      console.log(`[VideoCallService] Full URL: ${fullUrl}`);
      console.log(`[VideoCallService] Token exists: ${!!token}`);
      console.log(`[VideoCallService] Token preview: ${token.substring(0, 20)}...`);
      console.log(`[VideoCallService] Frontend origin: ${window.location.origin}`);
      console.log(`[VideoCallService] Base URL: ${API_BASE_URL}`);
      console.log(`[VideoCallService] Endpoint: ${endpoint}`);
      
      // Always fetch fresh token - prevent all caching
      const response = await axiosInstance.get(endpoint, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        params: {
          _t: Date.now() // Cache buster
        },
        validateStatus: (status) => status < 500, // Don't throw on 4xx, let us handle it
        timeout: 30000, // 30 second timeout
      });
      
      // Check if response is an error (4xx status)
      if (response.status >= 400) {
        const errorData = response.data;
        throw {
          response: {
            status: response.status,
            data: errorData,
            statusText: response.statusText
          },
          message: errorData?.error || errorData?.detail || `HTTP ${response.status}`
        };
      }
      
      console.log('[VideoCallService] Token received:', {
        room: response.data.room_name,
        expiresIn: response.data.expires_in,
        appointmentId: response.data.appointment_id
      });
      
      return response.data;
    } catch (error: any) {
      // Handle specific error responses according to API documentation
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const errorData = error.response.data;
        
        switch (status) {
          case 401:
            throw new Error('Authentication failed. Please log in again.');
          case 403:
            throw new Error(errorData?.error || 'Permission denied. You are not authorized to access this video call.');
          case 404:
            if (errorData?.error?.includes('video room')) {
              throw new Error('No video room found for this appointment.');
            }
            throw new Error(errorData?.error || 'Appointment not found.');
          case 500:
            throw new Error(errorData?.error || 'Failed to generate access token. Please try again later.');
          default:
            throw new Error(
              errorData?.error ||
              errorData?.detail ||
              errorData?.message ||
              'Failed to get video access token'
            );
        }
      } else if (error.request) {
        // Request made but no response received - network error
        const frontendOrigin = typeof window !== 'undefined' ? window.location.origin : 'Unknown';
        
        // Enhanced network error diagnostics
        console.error('[VideoCallService] Network error - request not reaching server');
        console.error('  Error code:', error.code);
        console.error('  Error message:', error.message);
        console.error('  Request config:', {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
          fullURL: error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : 'Unknown'
        });
        
        if (error.code === 'ECONNABORTED') {
          console.error('  ⚠️ Request timed out after 30 seconds');
        } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
          console.error('  ⚠️ Network error - request may not have reached server');
          console.error('  Possible causes:');
          console.error('    1. API server is down or unreachable');
          console.error('    2. Wrong API URL in axiosInstance');
          console.error('    3. Network connectivity issue');
          console.error('    4. Check browser Network tab for actual request details');
        }
        
        // Try fallback with native fetch
        const endpoint = `/appointments/video-token/${appointmentId}/`;
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
          (import.meta.env.PROD 
            ? 'https://api.tailoredpsychology.com.au/api' 
            : 'http://127.0.0.1:8000/api');
        const attemptedUrl = error.config?.baseURL 
          ? `${error.config.baseURL}${error.config.url}` 
          : `${API_BASE_URL}${endpoint}`;
        
        console.error('  Attempting fallback fetch to:', attemptedUrl);
        
        try {
          const token = localStorage.getItem('access_token');
          const fetchResponse = await fetch(attemptedUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store'
          });
          
          if (!fetchResponse.ok) {
            const errorData = await fetchResponse.json().catch(() => ({ detail: 'Unknown error' }));
            throw {
              response: {
                status: fetchResponse.status,
                data: errorData,
                statusText: fetchResponse.statusText
              },
              message: errorData?.error || errorData?.detail || `HTTP ${fetchResponse.status}`
            };
          }
          
          return await fetchResponse.json();
        } catch (fetchError: any) {
          // CORS error detected - provide clear solution
          const isCorsBlocked = fetchError.name === 'TypeError' && 
                              fetchError.message === 'Failed to fetch';
          
          if (isCorsBlocked) {
            throw new Error(
              `CORS Error: Backend is blocking requests from ${frontendOrigin}. ` +
              `Fix: Add "${frontendOrigin}" to CORS_ALLOWED_ORIGINS in Django settings.py and restart the server.`
            );
          }
          
          throw new Error('Network error: Could not connect to API server. Please check your connection and try again.');
        }
      } else {
        // Error in request setup
        console.error('[VideoCallService] Request setup error:', error.message);
        throw new Error(`Failed to get video token: ${error.message}`);
      }
    }
  }

  /**
   * Get video room information for an appointment
   */
  async getVideoRoomInfo(appointmentId: number | string): Promise<VideoRoomInfo> {
    try {
      const response = await axiosInstance.get(`/appointments/${appointmentId}/video-room/`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to get video room info:', error);
      throw new Error(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to get video room information'
      );
    }
  }

  /**
   * Check if an appointment has video call capability
   */
  isVideoCallAvailable(appointment: any): boolean {
    // Check if appointment is telehealth (support multiple field names)
    const isTelehealth = 
      appointment?.session_type === 'telehealth' ||
      appointment?.appointment_type === 'telehealth' ||
      appointment?.type === 'telehealth';
    
    if (!isTelehealth) {
      return false;
    }

    // Check if appointment is in the future or within the allowed time window
    // Support different date/time field formats
    const appointmentDate = appointment.appointment_date || appointment.date;
    const appointmentTime = appointment.appointment_time || appointment.time || '00:00';
    
    if (!appointmentDate) {
      return false;
    }

    try {
      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      const now = new Date();
      const duration = appointment.duration_minutes || 60; // Default 60 min
      
      // Allow joining 30 minutes before the appointment
      const thirtyMinutesBefore = new Date(appointmentDateTime.getTime() - 30 * 60 * 1000);
      
      // Allow joining until appointment duration + 4 hours after start time
      // This allows: late joins, reconnects, and sessions that run over time
      const extendedEnd = new Date(appointmentDateTime.getTime() + (duration + 240) * 60 * 1000);
      
      return now >= thirtyMinutesBefore && now <= extendedEnd;
    } catch (error) {
      console.error('Error parsing appointment date/time:', error);
      return false;
    }
  }

  /**
   * Check if user can join the video call now
   */
  canJoinNow(appointment: any): boolean {
    if (!this.isVideoCallAvailable(appointment)) {
      return false;
    }

    // Must be in valid status (support multiple status formats)
    const status = appointment.status;
    const validStatuses = ['scheduled', 'in_progress', 'upcoming', 'confirmed'];
    
    return validStatuses.includes(status);
  }

  /**
   * Test axiosInstance configuration (for debugging)
   * Call from browser console: videoCallService.testAxiosConfig()
   */
  testAxiosConfig(): void {
    console.log('🔧 Testing Axios Configuration...');
    console.log('axiosInstance.defaults.baseURL:', axiosInstance.defaults.baseURL);
    console.log('Environment:', import.meta.env.PROD ? 'PRODUCTION' : 'DEVELOPMENT');
    console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'NOT SET');
    console.log('Frontend origin:', window.location.origin);
    
    // Check if __API_CONFIG__ is available
    if ((window as any).__API_CONFIG__) {
      console.log('API Config object:', (window as any).__API_CONFIG__.checkConfig());
    }
    
    // Test a simple endpoint to verify connectivity
    const testUrl = `${axiosInstance.defaults.baseURL}/`;
    console.log('Test URL:', testUrl);
    console.log('Run: videoCallService.testAxiosConfig() to see this info');
  }

  /**
   * Comprehensive network diagnostic test
   * Call from browser console: await videoCallService.testNetwork(13)
   */
  async testNetwork(appointmentId: number | string): Promise<void> {
    console.log('🔍 Network Diagnostic Test for Video Token');
    console.log('='.repeat(50));
    
    const token = localStorage.getItem('access_token');
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
      (import.meta.env.PROD 
        ? 'https://api.tailoredpsychology.com.au/api' 
        : 'http://127.0.0.1:8000/api');
    const endpoint = `/appointments/video-token/${appointmentId}/`;
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    
    console.log('📋 Configuration:');
    console.log('  Appointment ID:', appointmentId);
    console.log('  API Base URL:', API_BASE_URL);
    console.log('  Endpoint:', endpoint);
    console.log('  Full URL:', fullUrl);
    console.log('  Frontend Origin:', window.location.origin);
    console.log('  Has Auth Token:', !!token);
    console.log('  Token Preview:', token ? `${token.substring(0, 20)}...` : 'NONE');
    console.log('  Axios BaseURL:', axiosInstance.defaults.baseURL);
    console.log('');
    
    // Test 1: Direct fetch
    console.log('🧪 Test 1: Direct fetch()');
    try {
      const startTime = Date.now();
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      const duration = Date.now() - startTime;
      
      console.log(`  ✅ Status: ${response.status} (took ${duration}ms)`);
      console.log('  Response Headers:', [...response.headers.entries()]);
      
      if (response.ok) {
        const data = await response.json();
        console.log('  ✅ Success! Data received:', {
          hasToken: !!data.access_token,
          roomName: data.room_name,
          expiresIn: data.expires_in
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('  ❌ Error Response:', errorData);
      }
    } catch (err: any) {
      console.error('  ❌ Fetch failed:', err.name, err.message);
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        console.error('  ⚠️ This is a network/CORS error - request blocked by browser');
      }
    }
    console.log('');
    
    // Test 2: Axios
    console.log('🧪 Test 2: Axios request');
    try {
      const startTime = Date.now();
      const response = await axiosInstance.get(endpoint, {
        headers: {
          'Cache-Control': 'no-cache'
        },
        timeout: 10000
      });
      const duration = Date.now() - startTime;
      
      console.log(`  ✅ Status: ${response.status} (took ${duration}ms)`);
      console.log('  ✅ Success! Data received:', {
        hasToken: !!response.data.access_token,
        roomName: response.data.room_name
      });
    } catch (err: any) {
      console.error('  ❌ Axios failed:', err.code || err.name, err.message);
      if (err.request && !err.response) {
        console.error('  ⚠️ Network error - no response from server');
        console.error('  Error code:', err.code);
        console.error('  Request URL:', err.config?.baseURL + err.config?.url);
      } else if (err.response) {
        console.error('  ⚠️ Server responded with error:', err.response.status);
        console.error('  Error data:', err.response.data);
      }
    }
    console.log('');
    
    console.log('='.repeat(50));
    console.log('💡 Next Steps:');
    console.log('  1. Check browser Network tab for the actual request');
    console.log('  2. If status is 0 or (failed) → Network/CORS issue');
    console.log('  3. If status is 4xx → Backend error (check error message)');
    console.log('  4. If status is 200 → Request works, check why app fails');
  }

  /**
   * Test CORS preflight (for debugging)
   * Call from browser console: videoCallService.testCORS(13)
   */
  async testCORS(appointmentId: number | string): Promise<void> {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
      (import.meta.env.PROD 
        ? 'https://api.tailoredpsychology.com.au/api' 
        : 'http://127.0.0.1:8000/api');
    const url = `${API_BASE_URL}/appointments/video-token/${appointmentId}/`;
    
    console.log('🔍 Testing CORS Preflight...');
    console.log('URL:', url);
    console.log('Origin:', window.location.origin);
    
    try {
      // Test OPTIONS request (CORS preflight)
      const optionsResponse = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'authorization,content-type'
        }
      });
      
      console.log('✅ OPTIONS (Preflight) Status:', optionsResponse.status);
      console.log('OPTIONS Headers:', [...optionsResponse.headers.entries()]);
      
      const corsOrigin = optionsResponse.headers.get('access-control-allow-origin');
      const corsMethods = optionsResponse.headers.get('access-control-allow-methods');
      const corsHeaders = optionsResponse.headers.get('access-control-allow-headers');
      
      console.log('CORS Origin:', corsOrigin);
      console.log('CORS Methods:', corsMethods);
      console.log('CORS Headers:', corsHeaders);
      
      if (corsOrigin !== window.location.origin && corsOrigin !== '*') {
        console.error('❌ CORS Origin mismatch!');
        console.error(`   Expected: ${window.location.origin}`);
        console.error(`   Got: ${corsOrigin}`);
      } else {
        console.log('✅ CORS Origin matches!');
      }
    } catch (error: any) {
      console.error('❌ OPTIONS request failed:', error);
      console.error('This means CORS preflight is being blocked');
    }
  }

  /**
   * Test video token endpoint directly (for debugging)
   * Call from browser console: videoCallService.testVideoToken(13)
   */
  async testVideoToken(appointmentId: number | string): Promise<void> {
    const token = localStorage.getItem('access_token');
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
      (import.meta.env.PROD 
        ? 'https://api.tailoredpsychology.com.au/api' 
        : 'http://127.0.0.1:8000/api');
    const url = `${API_BASE_URL}/appointments/video-token/${appointmentId}/`;
    
    console.log('🧪 Testing video token endpoint...');
    console.log('URL:', url);
    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'MISSING');
    console.log('Origin:', window.location.origin);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Response Status:', response.status);
      console.log('Response Headers:', [...response.headers.entries()]);
      
      const data = await response.json();
      if (response.ok) {
        console.log('✅ Success! Token received:', data);
      } else {
        console.error('❌ Error Response:', data);
      }
    } catch (error: any) {
      console.error('❌ Fetch Error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
  }

  /**
   * Get time until appointment
   */
  getTimeUntilAppointment(appointment: any): string {
    try {
      const appointmentDate = appointment.appointment_date || appointment.date;
      const appointmentTime = appointment.appointment_time || appointment.time || '00:00';
      
      if (!appointmentDate) {
        return 'Time TBD';
      }

      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      const now = new Date();
      const diffMs = appointmentDateTime.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));

      if (diffMins < -5) {
        // More than 5 minutes past start time
        const minutesLate = Math.abs(diffMins);
        if (minutesLate < 60) {
          return `In progress (${minutesLate} min)`;
        } else {
          const hours = Math.floor(minutesLate / 60);
          const mins = minutesLate % 60;
          return mins === 0 ? `In progress (${hours}h)` : `In progress (${hours}h ${mins}m)`;
        }
      } else if (diffMins < 0) {
        return 'Starting now';
      } else if (diffMins === 0) {
        return 'Starting now';
      } else if (diffMins < 60) {
        return `Starts in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
      } else {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        if (mins === 0) {
          return `Starts in ${hours} hour${hours !== 1 ? 's' : ''}`;
        }
        return `Starts in ${hours}h ${mins}m`;
      }
    } catch (error) {
      console.error('Error calculating time until appointment:', error);
      return 'Time TBD';
    }
  }
}

export const videoCallService = new VideoCallService();

