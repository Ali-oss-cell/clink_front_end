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
      console.error('[VideoCallService] Error getting token:', error);
      console.error('[VideoCallService] Error details:', {
        message: error.message,
        code: error.code,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : null,
        request: error.request ? {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          fullURL: error.config?.baseURL + error.config?.url
        } : null
      });
      
      // Handle specific error responses according to API documentation
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const errorData = error.response.data;
        
        console.log(`[VideoCallService] Server responded with status ${status}`);
        
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
        // Request made but no response received
        const attemptedUrl = error.config?.baseURL 
          ? `${error.config.baseURL}${error.config.url}` 
          : 'Unknown URL';
        const envUrl = import.meta.env.VITE_API_BASE_URL || 'Not set';
        const isProd = import.meta.env.PROD;
        const hasToken = !!localStorage.getItem('access_token');
        
        console.error('[VideoCallService] Network error - No response from server');
        console.error('[VideoCallService] Attempted URL:', attemptedUrl);
        console.error('[VideoCallService] Environment:', isProd ? 'PRODUCTION' : 'DEVELOPMENT');
        console.error('[VideoCallService] VITE_API_BASE_URL:', envUrl);
        console.error('[VideoCallService] Has auth token:', hasToken);
        console.error('[VideoCallService] Request config:', {
          method: error.config?.method,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          headers: error.config?.headers
        });
        console.error('[VideoCallService] Possible causes:');
        console.error('  1. CORS issue - backend not allowing requests from frontend domain');
        console.error('  2. Backend server is down or not accessible');
        console.error('  3. SSL certificate issue');
        console.error('  4. Network firewall blocking the request');
        console.error('  5. Check browser Network tab for detailed error');
        
        // Check if it's a CORS error specifically
        const isCorsError = error.message?.includes('CORS') || 
                           error.message?.includes('Access-Control') ||
                           (error.code === 'ERR_NETWORK' && !error.response);
        
        const frontendOrigin = typeof window !== 'undefined' ? window.location.origin : 'Unknown';
        
        let errorMsg = `Network error: Could not reach API server at ${attemptedUrl}.\n\n`;
        errorMsg += `Diagnostics:\n`;
        errorMsg += `- Environment: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}\n`;
        errorMsg += `- API URL: ${envUrl}\n`;
        errorMsg += `- Frontend origin: ${frontendOrigin}\n`;
        errorMsg += `- Has auth token: ${hasToken ? 'Yes' : 'No'}\n`;
        errorMsg += `- Error type: ${isCorsError ? 'CORS/Network (browser blocked request)' : 'No response from server'}\n\n`;
        errorMsg += `🔍 TO TROUBLESHOOT:\n\n`;
        errorMsg += `1. Open DevTools (F12) → Network tab\n`;
        errorMsg += `2. Try joining video call again\n`;
        errorMsg += `3. Find the request to "video-token/13/"\n`;
        errorMsg += `4. Check the Status column:\n`;
        errorMsg += `   - If you see "(blocked)" or "CORS" → Backend CORS issue\n`;
        errorMsg += `   - If you see "Failed" or "ERR_" → Network/SSL issue\n`;
        errorMsg += `   - If you see "0" or blank → Request never sent\n`;
        errorMsg += `5. Click on the request → Check "Response" and "Headers" tabs\n\n`;
        errorMsg += `🔧 BACKEND FIX (if CORS error):\n`;
        errorMsg += `Add to Django settings.py:\n`;
        errorMsg += `CORS_ALLOWED_ORIGINS = [\n`;
        errorMsg += `    "${frontendOrigin}",\n`;
        errorMsg += `]\n\n`;
        errorMsg += `Or test backend directly:\n`;
        errorMsg += `curl -X GET "${attemptedUrl}" -H "Authorization: Bearer YOUR_TOKEN"`;
        
        throw new Error(errorMsg);
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

