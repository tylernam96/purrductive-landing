import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
  has_paid: boolean;
  is_early_access?: boolean;
  stripe_customer_id?: string;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  payment_completed_at?: string;
}

export interface LicenseKey {
  id: string;
  user_id: string;
  license_key: string;
  email: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
  usage_count?: number;
}