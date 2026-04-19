// Appointments API service
import axiosInstance from './axiosInstance';
import {
  extractApiErrorMessage,
  extractApiErrorMessageWithTimeoutHint,
  isAxiosTimeoutOrNetworkError,
} from '../../utils/apiError';

const APPOINTMENT_DETAILS_PATCH_TIMEOUT_MS = 60000;

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
  patient_cost_after_rebate: string | number; // Backend may return as string or number
  date_range: {
    start_date: string;
    end_date: string;
  };
  available_dates: AvailableDate[];
  total_available_slots?: number; // Optional, may not always be present
  message?: string; // Present if not accepting new patients or schedule missing
  /** False when clinician has no weekly hours (cannot generate slots). */
  schedule_configured?: boolean;
  schedule_message_code?: string | null;
  /** Server booking window; slots never extend beyond this many days from local today. */
  booking_policy?: {
    max_advance_booking_days: number;
  };
  /** Wave 3: echoed when `time_window` query was sent */
  time_window?: 'morning' | 'afternoon' | 'evening' | null;
  /** Present when the window filter removed all slots but some existed without the filter */
  window_filter_message_code?: string | null;
}

export interface CalendarViewResponse {
  psychologist_id: number;
  psychologist_name: string;
  month: number;
  year: number;
  available_dates: string[];
  total_available_days: number;
}

/** Wave 2: earliest-slot recommendation across clinicians offering the service */
export interface BookingRecommendationResponse {
  recommendation: {
    service_id: number;
    psychologist_id: number;
    psychologist_name: string;
    time_slot_id: number;
    slot_start: string;
    session_type: 'telehealth' | 'in_person';
  } | null;
  rationale?: { strategy: string };
  manual_path_available?: boolean;
  reason_code?: string;
  booking_policy?: {
    max_advance_booking_days: number;
  };
}

export interface BookAppointmentRequest {
  psychologist_id: number;
  service_id: number;
  time_slot_id: number;
  session_type: 'telehealth' | 'in_person';
  billing_path?: 'medicare' | 'private';
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

export interface AppointmentDetailsUpdateRequest {
  therapy_focus?: string;
  special_requests?: string;
  additional_notes?: string;
}

export interface AppointmentConfirmationResponse {
  appointment_id: number;
  booking_reference: string;
  status: string;
  patient: {
    name: string;
    email: string;
  };
  psychologist: {
    name: string;
    ahpra_number: string;
  };
  service: {
    name: string;
    duration_minutes: number;
  };
  session: {
    type: 'telehealth' | 'in_person' | string;
    formatted_date: string;
    formatted_time: string;
    video_room_id: string | null;
  };
  pricing: {
    consultation_fee: string;
    medicare_rebate: string;
    out_of_pocket_cost: string;
    gst_amount?: string;
    total_paid?: string;
  };
  receipt_id?: string;
}

export interface BookingRevalidationResponse {
  appointment_id: number;
  billing_path: 'medicare' | 'private';
  is_valid: boolean;
  blocking_reasons: string[];
  message: string;
  actions: {
    next: string | null;
    setup_next?: string | null;
    telehealth_consent: string;
    intake_form: string;
    intake_referral_details: string;
    wizard_medicare: string;
    wizard_medicare_referral: string;
    wizard_private: string;
    wizard_private_billing: string;
    referral_upload: string;
  };
}

export interface MedicareLimitCheckResponse {
  sessions_used: number;
  sessions_remaining: number;
  max_sessions: number;
  service_id: number;
  service_name: string;
}

export interface MedicareSessionInfoResponse {
  current_year: number;
  sessions_used: number;
  sessions_remaining: number;
  max_sessions: number;
  services: Array<{
    service_id: number;
    service_name: string;
    item_number: string;
    sessions_used: number;
    sessions_remaining: number;
  }>;
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
  // New timer fields
  session_start_time?: string;
  session_end_time?: string;
  time_until_start_seconds?: number | null;
  time_remaining_seconds?: number | null;
  session_status?: 'upcoming' | 'starting_soon' | 'in_progress' | 'ended' | 'unknown';
  can_join_session?: boolean;
}

export interface PatientAppointmentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PatientAppointment[];
}

// Appointments service class
export class AppointmentsService {

  /**
   * Get available time slots for a psychologist
   * 
   * @param params - Query parameters
   * @returns Promise with available slots data
   * @throws Error if psychologist not found or invalid parameters
   */
  async getAvailableSlots(params: {
    psychologistId: number;
    startDate: string;
    endDate?: string;
    serviceId?: number;
    sessionType?: 'telehealth' | 'in_person';
    /** Wave 3: morning | afternoon | evening — omit for full day */
    timeWindow?: 'morning' | 'afternoon' | 'evening';
  }): Promise<AvailableSlotsResponse> {
    // ✅ Validate required parameters
    if (!params.psychologistId || isNaN(params.psychologistId)) {
      throw new Error('Valid psychologist_id is required');
    }
    
    if (!params.startDate) {
      throw new Error('start_date is required (format: YYYY-MM-DD)');
    }

    // ✅ Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(params.startDate)) {
      throw new Error('start_date must be in YYYY-MM-DD format');
    }

    // ✅ Build query string using URLSearchParams
    const queryParams = new URLSearchParams({
      psychologist_id: params.psychologistId.toString(),
      start_date: params.startDate,
    });

    if (params.endDate) {
      if (!dateRegex.test(params.endDate)) {
        throw new Error('end_date must be in YYYY-MM-DD format');
      }
      queryParams.append('end_date', params.endDate);
    }
    
    if (params.serviceId) {
      queryParams.append('service_id', params.serviceId.toString());
    }
    
    if (params.sessionType) {
      queryParams.append('session_type', params.sessionType);
    }

    if (params.timeWindow) {
      queryParams.append('time_window', params.timeWindow);
    }

    try {
      // Canonical route lives under /appointments; auth alias kept as fallback.
      try {
        const response = await axiosInstance.get<AvailableSlotsResponse>(
          `/appointments/available-slots/?${queryParams.toString()}`
        );
        return response.data;
      } catch (primaryError: any) {
        if (primaryError?.response?.status !== 404) throw primaryError;
        const fallback = await axiosInstance.get<AvailableSlotsResponse>(
          `/auth/appointments/available-slots/?${queryParams.toString()}`
        );
        return fallback.data;
      }
    } catch (error: any) {
      // ✅ Handle specific errors
      if (error.response?.status === 404) {
        throw new Error(
          `Psychologist with ID ${params.psychologistId} not found. ` +
          `Please select a different psychologist.`
        );
      }
      
      if (error.response?.status === 400) {
        const errorMsg = error.response.data?.error || 'Invalid request parameters';
        throw new Error(errorMsg);
      }
      
      if (error.response?.status === 403) {
        throw new Error('Access denied');
      }
      
      // ✅ Network errors
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        throw new Error('Network error. Please check your connection.');
      }
      
      console.error('[AppointmentsService] Failed to get available slots:', error);
      throw new Error(error.message || 'Failed to load available slots');
    }
  }

  /**
   * Wave 2: get earliest bookable slot among clinicians offering the service (patient-only).
   */
  async getBookingRecommendation(params: {
    serviceId: number;
    sessionType?: 'telehealth' | 'in_person' | 'both';
  }): Promise<BookingRecommendationResponse> {
    const queryParams = new URLSearchParams({
      service_id: params.serviceId.toString(),
    });
    if (params.sessionType && params.sessionType !== 'both') {
      queryParams.append('session_type', params.sessionType);
    }

    try {
      try {
        const response = await axiosInstance.get<BookingRecommendationResponse>(
          `/appointments/booking-recommendation/?${queryParams.toString()}`
        );
        return response.data;
      } catch (primaryError: any) {
        if (primaryError?.response?.status !== 404) throw primaryError;
        const fallback = await axiosInstance.get<BookingRecommendationResponse>(
          `/auth/appointments/booking-recommendation/?${queryParams.toString()}`
        );
        return fallback.data;
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        const msg = error.response.data?.error || 'Invalid recommendation request';
        throw new Error(msg);
      }
      if (error.response?.status === 403) {
        throw new Error('Access denied');
      }
      if (error.response?.status === 404) {
        throw new Error(error.response.data?.error || 'Service not found');
      }
      console.error('[AppointmentsService] getBookingRecommendation failed:', error);
      throw new Error(error.message || 'Failed to load booking recommendation');
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
      
      try {
        const response = await axiosInstance.get(`/appointments/calendar-view/?${queryParams.toString()}`);
        return response.data;
      } catch (primaryError: any) {
        if (primaryError?.response?.status !== 404) throw primaryError;
        const fallback = await axiosInstance.get(`/auth/appointments/calendar-view/?${queryParams.toString()}`);
        return fallback.data;
      }
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
      // Canonical route is /appointments/book-enhanced; auth alias retained as fallback.
      try {
        const response = await axiosInstance.post('/appointments/book-enhanced/', data);
        return response.data;
      } catch (primaryError: any) {
        if (primaryError?.response?.status !== 404) throw primaryError;
        const fallback = await axiosInstance.post('/auth/appointments/book-enhanced/', data);
        return fallback.data;
      }
    } catch (error: any) {
      console.error('Failed to book appointment:', error);
      const d = error.response?.data;
      let msg =
        (typeof d === 'string' && d) ||
        d?.detail ||
        d?.error ||
        d?.message;
      if (msg && typeof msg !== 'string') {
        msg = Array.isArray(msg) ? msg.join(' ') : JSON.stringify(msg);
      }
      if (d && typeof d === 'object' && !msg) {
        const first = Object.entries(d).find(
          ([, v]) => Array.isArray(v) && v.length
        );
        if (first) msg = `${first[0]}: ${(first[1] as string[]).join(' ')}`;
      }
      throw new Error(
        msg ||
          'Could not complete booking. If this is a Medicare service, check your GP referral, provider number, and referral dates in your profile or intake form.'
      );
    }
  }

  /**
   * Get booking summary for payment page
   */
  async getBookingSummary(appointmentId: number): Promise<BookingSummaryResponse> {
    try {
      try {
        const response = await axiosInstance.get(
          `/appointments/booking-summary/?appointment_id=${appointmentId}`
        );
        return response.data;
      } catch (primaryError: any) {
        if (primaryError?.response?.status !== 404) throw primaryError;
        const fallback = await axiosInstance.get(
          `/auth/appointments/booking-summary/?appointment_id=${appointmentId}`
        );
        return fallback.data;
      }
    } catch (error) {
      console.error('Failed to get booking summary:', error);
      throw new Error(extractApiErrorMessage(error, 'Failed to load booking summary'));
    }
  }

  async updateAppointmentDetails(
    appointmentId: number,
    payload: AppointmentDetailsUpdateRequest
  ): Promise<{ message?: string }> {
    const url = `/appointments/${appointmentId}/details/`;
    const config = { timeout: APPOINTMENT_DETAILS_PATCH_TIMEOUT_MS };

    const patchOnce = () => axiosInstance.patch(url, payload, config);

    try {
      const response = await patchOnce();
      return response.data;
    } catch (error) {
      if (isAxiosTimeoutOrNetworkError(error)) {
        try {
          const response = await patchOnce();
          return response.data;
        } catch (retryError) {
          console.error('Failed to update appointment details (after retry):', retryError);
          throw new Error(
            extractApiErrorMessageWithTimeoutHint(retryError, 'Failed to save appointment details')
          );
        }
      }
      console.error('Failed to update appointment details:', error);
      throw new Error(
        extractApiErrorMessageWithTimeoutHint(error, 'Failed to save appointment details')
      );
    }
  }

  async getAppointmentConfirmation(appointmentId: number): Promise<AppointmentConfirmationResponse> {
    try {
      const response = await axiosInstance.get<AppointmentConfirmationResponse>(
        `/appointments/${appointmentId}/confirmation/`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to load appointment confirmation:', error);
      throw new Error(extractApiErrorMessage(error, 'Failed to load confirmation'));
    }
  }

  async revalidateBooking(
    appointmentId: number,
    billingPath?: 'medicare' | 'private'
  ): Promise<BookingRevalidationResponse> {
    try {
      const response = await axiosInstance.post<BookingRevalidationResponse>(
        `/appointments/${appointmentId}/revalidate-booking/`,
        billingPath ? { billing_path: billingPath } : {}
      );
      return response.data;
    } catch (error) {
      console.error('Failed to revalidate booking:', error);
      throw new Error(extractApiErrorMessage(error, 'Failed to revalidate booking'));
    }
  }

  /**
   * Get patient appointments with pagination and filtering
   * 
   * @param status - Filter by status (all, upcoming, completed, cancelled, past)
   * @param page - Page number (default: 1)
   * @param pageSize - Results per page (default: 10, max: 50)
   * @returns Promise with appointments data
   */
  async getPatientAppointments(params?: {
    status?: 'all' | 'upcoming' | 'completed' | 'cancelled' | 'past';
    page?: number;
    page_size?: number;
  }): Promise<PatientAppointmentsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      const statusParam = params?.status || 'all';
      if (statusParam !== 'all') {
        queryParams.append('status', statusParam);
      }
      
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      
      const pageSize = params?.page_size || 10;
      // Enforce max page size of 50
      queryParams.append('page_size', Math.min(pageSize, 50).toString());

      // Backend endpoint: /appointments/patient/appointments/
      const response = await axiosInstance.get<PatientAppointmentsResponse>(
        `/appointments/patient/appointments/?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get patient appointments:', error);
      throw error;
    }
  }

  /**
   * Get upcoming appointments only
   */
  async getUpcomingAppointments(): Promise<PatientAppointmentsResponse> {
    return this.getPatientAppointments({ status: 'upcoming', page: 1, page_size: 10 });
  }

  /**
   * Get completed appointments
   */
  async getCompletedAppointments(page: number = 1): Promise<PatientAppointmentsResponse> {
    return this.getPatientAppointments({ status: 'completed', page, page_size: 10 });
  }

  /**
   * Get specific appointment details
   */
  async getAppointmentDetails(appointmentId: string): Promise<PatientAppointment> {
    try {
      const response = await axiosInstance.get(`/appointments/appointments/${appointmentId}/`);
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
      const payload = { notes: reason || 'Patient requested cancellation' };
      try {
        const response = await axiosInstance.post(`/appointments/cancel/${appointmentId}/`, payload);
        return response.data;
      } catch (primaryError: any) {
        // Fallback to viewset action route in case deployment still uses it.
        if (primaryError?.response?.status !== 404) throw primaryError;
        const fallback = await axiosInstance.post(`/appointments/appointments/${appointmentId}/cancel/`, payload);
        return fallback.data;
      }
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
      const payload = { appointment_date: newDateTime };
      try {
        const response = await axiosInstance.post(`/appointments/reschedule/${appointmentId}/`, payload);
        return response.data;
      } catch (primaryError: any) {
        if (primaryError?.response?.status !== 404) throw primaryError;
        const fallback = await axiosInstance.post(`/appointments/appointments/${appointmentId}/reschedule/`, payload);
        return fallback.data;
      }
    } catch (error) {
      console.error('Failed to reschedule appointment:', error);
      throw new Error('Failed to reschedule appointment');
    }
  }

  /**
   * Get psychologist schedule with filtering and pagination
   */
  async getPsychologistSchedule(params?: {
    start_date?: string;
    end_date?: string;
    month?: string; // Format: YYYY-MM
    year?: number;
    status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'all';
    page?: number;
    page_size?: number;
  }): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: {
      id: number;
      patient_id: number;
      patient_name: string;
      service_name: string;
      appointment_date: string;
      formatted_date: string;
      formatted_time: string;
      duration_minutes: number;
      session_type: 'telehealth' | 'in_person';
      status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
      notes: string | null;
      location: string | null;
      meeting_link: string | null;
      // Timer fields
      session_start_time?: string;
      session_end_time?: string;
      time_until_start_seconds?: number | null;
      time_remaining_seconds?: number | null;
      session_status?: 'upcoming' | 'starting_soon' | 'in_progress' | 'ended' | 'unknown';
      can_join_session?: boolean;
    }[];
  }> {
    try {
      const queryParams: any = {};
      
      if (params?.start_date) {
        queryParams.start_date = params.start_date;
      }
      if (params?.end_date) {
        queryParams.end_date = params.end_date;
      }
      if (params?.month) {
        queryParams.month = params.month;
      }
      if (params?.year) {
        queryParams.year = params.year;
      }
      if (params?.status && params.status !== 'all') {
        queryParams.status = params.status;
      }
      if (params?.page) {
        queryParams.page = params.page;
      }
      if (params?.page_size) {
        queryParams.page_size = params.page_size;
      }

      const response = await axiosInstance.get('/appointments/psychologist/schedule/', {
        params: queryParams
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to get psychologist schedule:', error);
      throw new Error('Failed to load schedule');
    }
  }

  /**
   * Complete a session appointment
   */
  async completeSession(appointmentId: number, progressNote?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    progress_rating?: number;
  }): Promise<any> {
    try {
      const response = await axiosInstance.post(`/appointments/complete-session/${appointmentId}/`, {
        progress_note: progressNote || null
      });
      return response.data;
    } catch (error) {
      console.error('Failed to complete session:', error);
      throw new Error('Failed to complete session');
    }
  }

  /**
   * Cancel or reschedule an appointment
   */
  async appointmentAction(
    appointmentId: number, 
    action: 'cancel' | 'reschedule',
    data: {
      reason?: string;
      new_date?: string;
    }
  ): Promise<any> {
    try {
      const payload: any = { action };
      if (action === 'cancel' && data.reason) {
        payload.reason = data.reason;
      }
      if (action === 'reschedule' && data.new_date) {
        payload.new_date = data.new_date;
        if (data.reason) {
          payload.reason = data.reason;
        }
      }

      const response = await axiosInstance.post(`/appointments/appointment-actions/${appointmentId}/`, payload);
      return response.data;
    } catch (error) {
      console.error(`Failed to ${action} appointment:`, error);
      throw new Error(`Failed to ${action} appointment`);
    }
  }

  /**
   * Check Medicare session limit for a specific service
   */
  async checkMedicareLimit(serviceId: number): Promise<MedicareLimitCheckResponse> {
    try {
      const response = await axiosInstance.get<MedicareLimitCheckResponse>(
        `/appointments/medicare-limit-check/?service_id=${serviceId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('[AppointmentsService] Error checking Medicare limit:', error);
      if (error.response) {
        throw new Error(error.response.data?.detail || error.response.data?.error || 'Failed to check Medicare limit');
      } else if (error.request) {
        throw new Error('Network error: Unable to connect to server');
      } else {
        throw new Error(error.message || 'Failed to check Medicare limit');
      }
    }
  }

  /**
   * Get patient's Medicare session information
   */
  async getMedicareSessionInfo(): Promise<MedicareSessionInfoResponse> {
    try {
      const response = await axiosInstance.get<MedicareSessionInfoResponse>(
        '/appointments/medicare-session-info/'
      );
      return response.data;
    } catch (error: any) {
      console.error('[AppointmentsService] Error fetching Medicare session info:', error);
      if (error.response) {
        throw new Error(error.response.data?.detail || error.response.data?.error || 'Failed to fetch Medicare session info');
      } else if (error.request) {
        throw new Error('Network error: Unable to connect to server');
      } else {
        throw new Error(error.message || 'Failed to fetch Medicare session info');
      }
    }
  }
}

// Export singleton instance

export const appointmentsService = new AppointmentsService();

