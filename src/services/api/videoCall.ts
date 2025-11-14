import axiosInstance from './axiosInstance';

export interface VideoTokenRequest {
  identity: string; // User's full name
}

export interface VideoTokenResponse {
  token: string;
  room_name: string;
  identity: string;
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
   */
  async getVideoToken(appointmentId: number | string): Promise<VideoTokenResponse> {
    try {
      const response = await axiosInstance.get(`/appointments/video-token/${appointmentId}/`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to get video token:', error);
      throw new Error(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to get video access token'
      );
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
    // Check if appointment is telehealth
    if (appointment?.appointment_type !== 'telehealth' && appointment?.type !== 'telehealth') {
      return false;
    }

    // Check if appointment is in the future or within the allowed time window
    const appointmentDateTime = new Date(appointment.appointment_date + 'T' + appointment.appointment_time);
    const now = new Date();
    
    // Allow joining 15 minutes before the appointment
    const fifteenMinutesBefore = new Date(appointmentDateTime.getTime() - 15 * 60 * 1000);
    
    // Allow joining up to 2 hours after the appointment (in case it runs late)
    const twoHoursAfter = new Date(appointmentDateTime.getTime() + 2 * 60 * 60 * 1000);
    
    return now >= fifteenMinutesBefore && now <= twoHoursAfter;
  }

  /**
   * Check if user can join the video call now
   */
  canJoinNow(appointment: any): boolean {
    if (!this.isVideoCallAvailable(appointment)) {
      return false;
    }

    // Must be in 'scheduled' or 'in_progress' status
    return appointment.status === 'scheduled' || appointment.status === 'in_progress';
  }

  /**
   * Get time until appointment
   */
  getTimeUntilAppointment(appointment: any): string {
    const appointmentDateTime = new Date(appointment.appointment_date + 'T' + appointment.appointment_time);
    const now = new Date();
    const diffMs = appointmentDateTime.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 0) {
      return 'Started';
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
  }
}

export const videoCallService = new VideoCallService();

