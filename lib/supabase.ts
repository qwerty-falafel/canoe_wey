import { createClient } from '@supabase/supabase-js';

export type BookingStatus = 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'DECLINED' | 'CANCELLED' | 'COMPLETED';

export type Booking = {
  id: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  preferred_date: string;
  alternative_date: string | null;
  group_size: number;
  occasion_type: string | null;
  company_name: string | null;
  message: string | null;
  status: BookingStatus;
  admin_notes: string | null;
};

export function getAdminServerClient() {
  const url = process.env.PROJECT_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) throw new Error('Supabase server configuration is missing.');
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}
