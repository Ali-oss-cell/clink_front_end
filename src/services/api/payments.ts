import axiosInstance from './axiosInstance';

export type PaymentMethod = 'card' | 'phone' | 'in_person';

export interface CreatePaymentIntentRequest {
  appointment_id: number;
  payment_method: PaymentMethod;
}

export interface CreatePaymentIntentResponse {
  appointment_id: number;
  amount: string;
  currency: string;
  payment_intent_id: string;
  client_secret?: string;
  status: string;
}

export interface ConfirmPaymentRequest {
  appointment_id: number;
  payment_intent_id: string;
}

export interface ConfirmPaymentResponse {
  message: string;
  appointment_id: number;
  appointment_status: string;
  payment_status: string;
  receipt_id?: string;
}

export interface PaymentReceiptResponse {
  appointment_id: number;
  receipt_id?: string;
  amount_paid?: string;
  currency?: string;
  paid_at?: string;
  [key: string]: unknown;
}

export const paymentsService = {
  async createIntent(payload: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> {
    const response = await axiosInstance.post<CreatePaymentIntentResponse>('/payments/create-intent/', payload);
    return response.data;
  },

  async confirm(payload: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> {
    const response = await axiosInstance.post<ConfirmPaymentResponse>('/payments/confirm/', payload);
    return response.data;
  },

  async getReceipt(appointmentId: number): Promise<PaymentReceiptResponse> {
    const response = await axiosInstance.get<PaymentReceiptResponse>(
      `/payments/receipt/?appointment_id=${appointmentId}`
    );
    return response.data;
  },
};

