import axiosInstance from './axiosInstance';

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  source_page?: string;
}

export interface ContactResponse {
  message: string;
  enquiry_id: string;
  created_at: string;
}

export const contactService = {
  async submitEnquiry(payload: ContactRequest): Promise<ContactResponse> {
    const response = await axiosInstance.post<ContactResponse>('/public/contact/', payload);
    return response.data;
  },
};

