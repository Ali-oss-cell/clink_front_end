// Appointments API service
import axiosInstance from './axiosInstance';

export interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  start_time_formatted: string;
  end_time_formatted: string;
  is_available: boolean;
}

export interface AvailableDate {
  date: string;
  day_name: string;
  slots: TimeSlot[];
}

export interface AvailableSlotsResponse {
  psychologist_id: number;
  psychologist_name: string;
  psychologist_title: string;
  is_accepting_new_patients: boolean;
  telehealth_available: boolean;
  in_person_available: boolean;
  consultation_fee: string;
  medicare_rebate_amount: string;
  patient_cost_after_rebate: number;
  date_range: {
    start_date: string;
    end_date: string;
  };
  available_dates: AvailableDate[];
  total_available_slots: number;
}

export interface CalendarViewResponse {
  psychologist_id: number;
  psychologist_name: string;
  month: number;
  year: number;
  available_dates: string[];
  total_available_days: number;
}

export interface BookAppointmentRequest {
  psychologist_id: number;
  service_id: number;
  time_slot_id: number;
  session_type: 'telehealth' | 'in_person';
  notes?: string;
}

export interface BookAppointmentResponse {
  message: string;
  appointment: {
    id: number;
    patient: number;
    patient_name: string;
    psychologist: number;
    psychologist_name: string;
    service: number;
    service_name: string;
    appointment_date: string;
    formatted_date: string;
    duration_minutes: number;
    duration_hours: number;
    status: string;
    status_display: string;
    session_type: string;
    notes: string;
    video_room_id: string;
    created_at: string;
    updated_at: string;
  };
  booking_details: {
    psychologist_name: string;
    service_name: string;
    session_type: string;
    appointment_date: string;
    duration_minutes: number;
    consultation_fee: string;
    medicare_rebate: string;
    out_of_pocket_cost: string;
  };
}

export interface BookingSummaryResponse {
  appointment_id: number;
  status: string;
  patient: {
    name: string;
    email: string;
    phone: string;
  };
  psychologist: {
    id: number;
    name: string;
    title: string;
    qualifications: string;
    ahpra_number: string;
    profile_image_url: string;
  };
  service: {
    id: number;
    name: string;
    description: string;
    duration_minutes: number;
  };
  session: {
    type: string;
    appointment_date: string;
    formatted_date: string;
    formatted_time: string;
    video_room_id: string | null;
  };
  pricing: {
    consultation_fee: string;
    medicare_rebate: string;
    out_of_pocket_cost: string;
    medicare_item_number: string;
  };
  notes: string;
  created_at: string;
}

export interface PatientAppointment {
  id: string;
  appointment_date: string;
  formatted_date: string;
  formatted_time: string;
  duration_minutes: number;
  session_type: 'telehealth' | 'in_person';
  status: 'upcoming' | 'completed' | 'cancelled' | 'past' | 'no_show';
  psychologist: {
    name: string;
    title: string;
    profile_image_url: string;
  };
  location: string | null;
  meeting_link: string | null;
  notes: string | null;
  can_reschedule: boolean;
  can_cancel: boolean;
  reschedule_deadline: string;
  cancellation_deadline: string;
}

export interface PatientAppointmentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PatientAppointment[];
}

// Appointments service class
export class AppointmentsService {
  private baseURL = 'http://127.0.0.1:8000/api';

  /**
   * Get available time slots for a psychologist
   */
  async getAvailableSlots(params: {
    psychologistId: number;
    startDate: string;
    endDate?: string;
    serviceId?: number;
    sessionType?: 'telehealth' | 'in_person';
  }): Promise<AvailableSlotsResponse> {
    try {
      const queryParams: any = {
        psychologist_id: params.psychologistId,
        start_date: params.startDate,
      };
      
      if (params.endDate) queryParams.end_date = params.endDate;
      if (params.serviceId) queryParams.service_id = params.serviceId;
      if (params.sessionType) queryParams.session_type = params.sessionType;
      
      const response = await axiosInstance.get('/appointments/available-slots/', {
        params: queryParams
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get available slots:', error);
      throw new Error('Failed to load available slots');
    }
  }

  /**
   * Get calendar view of available dates for a month
   */
  async getCalendarView(params: {
    psychologistId: number;
    month?: number;
    year?: number;
  }): Promise<CalendarViewResponse> {
    try {
      const queryParams = new URLSearchParams({
        psychologist_id: params.psychologistId.toString(),
      });
      
      if (params.month) queryParams.append('month', params.month.toString());
      if (params.year) queryParams.append('year', params.year.toString());
      
      const response = await fetch(
        `${this.baseURL}/appointments/calendar-view/?${queryParams.toString()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to get calendar view:', error);
      throw new Error('Failed to load calendar');
    }
  }

  /**
   * Book an appointment
   */
  async bookAppointment(data: BookAppointmentRequest): Promise<BookAppointmentResponse> {
    try {
      const response = await axiosInstance.post('/appointments/book-enhanced/', data);
      return response.data;
    } catch (error) {
      console.error('Failed to book appointment:', error);
      throw error;
    }
  }

  /**
   * Get booking summary for payment page
   */
  async getBookingSummary(appointmentId: number): Promise<BookingSummaryResponse> {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(
        `${this.baseURL}/appointments/booking-summary/?appointment_id=${appointmentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch booking summary');
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to get booking summary:', error);
      throw new Error('Failed to load booking summary');
    }
  }

  /**
   * Get patient appointments with pagination and filtering
   */
  async getPatientAppointments(params?: {
    status?: 'all' | 'upcoming' | 'completed' | 'cancelled' | 'past';
    page?: number;
    page_size?: number;
  }): Promise<PatientAppointmentsResponse> {
    try {
      const queryParams: any = {};
      
      if (params?.status && params.status !== 'all') {
        queryParams.status = params.status;
      }
      if (params?.page) {
        queryParams.page = params.page;
      }
      if (params?.page_size) {
        queryParams.page_size = params.page_size;
      }

      const response = await axiosInstance.get('/appointments/patient/appointments/', {
        params: queryParams
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get patient appointments:', error);
      throw new Error('Failed to load appointments');
    }
  }

  /**
   * Get specific appointment details
   */
  async getAppointmentDetails(appointmentId: string): Promise<PatientAppointment> {
    try {
      const response = await axiosInstance.get(`/appointments/patient/appointments/${appointmentId}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to get appointment details:', error);
      throw new Error('Failed to load appointment details');
    }
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(appointmentId: string, reason?: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post(`/appointments/patient/appointments/${appointmentId}/cancel/`, {
        reason: reason || 'Patient requested cancellation'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      throw new Error('Failed to cancel appointment');
    }
  }

  /**
   * Reschedule an appointment
   */
  async rescheduleAppointment(appointmentId: string, newDateTime: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post(`/appointments/patient/appointments/${appointmentId}/reschedule/`, {
        new_appointment_date: newDateTime
      });
      return response.data;
    } catch (error) {
      console.error('Failed to reschedule appointment:', error);
      throw new Error('Failed to reschedule appointment');
    }
  }
}

// Export singleton instance
export const appointmentsService = new AppointmentsService();

