import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? 'demo-anon-key';

export const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Crop = {
  id: string;
  name: string;
  description: string;
  growing_season: string;
  soil_requirements: string;
  water_requirements: string;
  common_pests: string;
  image_url: string;
  category: string;
};

export type Pesticide = {
  id: string;
  name: string;
  target_pest: string;
  crop: string;
  dosage: string;
  form: string;
  pre_harvest_interval: string;
  safety_info: string;
};

export type Fertilizer = {
  id: string;
  name: string;
  category: string;
  description: string;
  dosage: string;
  suitable_crops: string[];
  image_url: string;
};

export type FarmCrop = {
  id: string;
  user_id: string;
  crop_id: string | null;
  crop_name: string;
  planting_date: string | null;
  expected_harvest_date: string | null;
  status: string;
  notes: string;
  created_at: string;
};

export type FertilizerPlan = {
  id: string;
  user_id: string;
  fertilizer_id: string | null;
  fertilizer_name: string;
  crop_name: string;
  application_date: string | null;
  notes: string;
  created_at: string;
};

export type Alert = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  category: string;
  severity: string;
  is_read: boolean;
  created_at: string;
};

export type FarmActivity = {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  location: string;
  farm_info: string;
  temp_unit: string;
  notifications_enabled: boolean;
};
