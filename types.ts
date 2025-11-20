export interface Device {
  id: string;
  userId: string; // Link device to a specific user
  device_serial: string;
  brand_name: string;
  category?: string; // e.g., Fridge, Washing Machine
  warranty_period: string;
  purchase_date: string; // ISO Date string YYYY-MM-DD
  expiry_date: string; // ISO Date string YYYY-MM-DD
  free_service_dates: string[]; // Array of ISO Date strings
  helpline_number: string;
  invoice_number: string;
  service_receipt?: string;
  createdAt: number;
}

export type ViewState = 'dashboard' | 'list' | 'add' | 'details';

export interface ExtractionResponse {
  device_serial: string;
  brand_name: string;
  warranty_period: string;
  purchase_date: string;
  expiry_date: string;
  free_service_dates: string[];
  helpline_number: string;
  invoice_number: string;
  service_receipt: string;
  category: string;
}

export interface DashboardStats {
  total: number;
  active: number;
  expiringSoon: number;
}