import type { User } from './auth';
import type { Psychologist } from './user';

export interface Service {
  id: number;
  name: string;
  service_type: 'individual' | 'couples' | 'family' | 'group' | 'assessment';
  description: string;
  duration_minutes: number;
  standard_fee: number;
  medicare_rebate: number;
  out_of_pocket_cost: number;
}

export interface AppointmentBooking {
  service: number;
  psychologist: number;
  appointment_date: string;
  appointment_time: string;
  session_type: 'in_person' | 'telehealth';
  notes?: string;
}

export interface Appointment {
  id: number;
  patient: User;
  psychologist: Psychologist;
  service: Service;
  appointment_datetime: string;
  session_type: 'in_person' | 'telehealth';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  video_room_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AvailableDate {
  date: string;
  slots: TimeSlot[];
}
