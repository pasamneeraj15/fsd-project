/*
# AgriSmart - Smart Farming Management System Schema

## Overview
Creates the complete database schema for AgriSmart, a smart farming management app.
Users (farmers) can manage crops, view pesticides/fertilizers, monitor weather, and track alerts.

## 1. New Tables

### Reference Data (public, read-only from client)
- `crops`: Crop catalog (wheat, rice, cotton, tomato, potato, grapes, chili). Columns: id, name, description, growing_season, soil_requirements, water_requirements, common_pests, image_url, category.
- `pesticides`: Pesticide catalog keyed by crop. Columns: id, name, target_pest, crop, dosage, form, pre_harvest_interval, safety_info.
- `fertilizers`: Fertilizer catalog. Columns: id, name, category, description, dosage, suitable_crops (text[]).

### User-Owned Data (authenticated, owner-scoped)
- `profiles`: Extends auth.users. Columns: id (FK auth.users), full_name, location, farm_info, temp_unit, notifications_enabled.
- `farm_crops`: User's planted crops. Columns: id, user_id, crop_id, planting_date, expected_harvest_date, status, notes.
- `fertilizer_plans`: User's fertilizer plans. Columns: id, user_id, fertilizer_id, crop_id, application_date, notes.
- `alerts`: User alerts. Columns: id, user_id, title, message, category, severity, is_read, created_at.
- `farm_activities`: Activity log. Columns: id, user_id, activity_type, description, created_at.

## 2. Security
- RLS enabled on ALL tables.
- Reference tables (crops, pesticides, fertilizers): SELECT to anon+authenticated (public catalog). No client writes.
- User-owned tables: full CRUD scoped to authenticated owner via auth.uid() = user_id.
- profiles: user can read/update own profile only.
- All owner columns default to auth.uid() so inserts work without client passing user_id.

## 3. Indexes
- farm_crops(user_id), fertilizer_plans(user_id), alerts(user_id), farm_activities(user_id)
- pesticides(crop) for crop-based lookups
- fertilizers(category) for category filtering
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  location text DEFAULT '',
  farm_info text DEFAULT '',
  temp_unit text NOT NULL DEFAULT 'C',
  notifications_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ CROPS (reference) ============
CREATE TABLE IF NOT EXISTS crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  growing_season text DEFAULT '',
  soil_requirements text DEFAULT '',
  water_requirements text DEFAULT '',
  common_pests text DEFAULT '',
  image_url text DEFAULT '',
  category text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_crops" ON crops;
CREATE POLICY "read_crops" ON crops FOR SELECT
  TO anon, authenticated USING (true);

-- ============ PESTICIDES (reference) ============
CREATE TABLE IF NOT EXISTS pesticides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  target_pest text DEFAULT '',
  crop text NOT NULL,
  dosage text DEFAULT '',
  form text DEFAULT '',
  pre_harvest_interval text DEFAULT '',
  safety_info text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pesticides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_pesticides" ON pesticides;
CREATE POLICY "read_pesticides" ON pesticides FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_pesticides_crop ON pesticides(crop);

-- ============ FERTILIZERS (reference) ============
CREATE TABLE IF NOT EXISTS fertilizers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Inorganic',
  description text DEFAULT '',
  dosage text DEFAULT '',
  suitable_crops text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fertilizers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_fertilizers" ON fertilizers;
CREATE POLICY "read_fertilizers" ON fertilizers FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_fertilizers_category ON fertilizers(category);

-- ============ FARM_CROPS (user-owned) ============
CREATE TABLE IF NOT EXISTS farm_crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id uuid REFERENCES crops(id) ON DELETE SET NULL,
  crop_name text NOT NULL DEFAULT '',
  planting_date date,
  expected_harvest_date date,
  status text NOT NULL DEFAULT 'Growing',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE farm_crops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_farm_crops" ON farm_crops;
CREATE POLICY "select_own_farm_crops" ON farm_crops FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_farm_crops" ON farm_crops;
CREATE POLICY "insert_own_farm_crops" ON farm_crops FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_farm_crops" ON farm_crops;
CREATE POLICY "update_own_farm_crops" ON farm_crops FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_farm_crops" ON farm_crops;
CREATE POLICY "delete_own_farm_crops" ON farm_crops FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_farm_crops_user ON farm_crops(user_id);

-- ============ FERTILIZER_PLANS (user-owned) ============
CREATE TABLE IF NOT EXISTS fertilizer_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  fertilizer_id uuid REFERENCES fertilizers(id) ON DELETE SET NULL,
  fertilizer_name text NOT NULL DEFAULT '',
  crop_name text DEFAULT '',
  application_date date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fertilizer_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_fertilizer_plans" ON fertilizer_plans;
CREATE POLICY "select_own_fertilizer_plans" ON fertilizer_plans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_fertilizer_plans" ON fertilizer_plans;
CREATE POLICY "insert_own_fertilizer_plans" ON fertilizer_plans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_fertilizer_plans" ON fertilizer_plans;
CREATE POLICY "delete_own_fertilizer_plans" ON fertilizer_plans FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_fertilizer_plans_user ON fertilizer_plans(user_id);

-- ============ ALERTS (user-owned) ============
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text DEFAULT '',
  category text NOT NULL DEFAULT 'pest',
  severity text NOT NULL DEFAULT 'medium',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_alerts" ON alerts;
CREATE POLICY "select_own_alerts" ON alerts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_alerts" ON alerts;
CREATE POLICY "insert_own_alerts" ON alerts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_alerts" ON alerts;
CREATE POLICY "update_own_alerts" ON alerts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_alerts" ON alerts;
CREATE POLICY "delete_own_alerts" ON alerts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);

-- ============ FARM_ACTIVITIES (user-owned) ============
CREATE TABLE IF NOT EXISTS farm_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL DEFAULT 'general',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE farm_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_farm_activities" ON farm_activities;
CREATE POLICY "select_own_farm_activities" ON farm_activities FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_farm_activities" ON farm_activities;
CREATE POLICY "insert_own_farm_activities" ON farm_activities FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_farm_activities" ON farm_activities;
CREATE POLICY "delete_own_farm_activities" ON farm_activities FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_farm_activities_user ON farm_activities(user_id);

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ AUTO-UPDATE updated_at ============
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS farm_crops_updated_at ON farm_crops;
CREATE TRIGGER farm_crops_updated_at BEFORE UPDATE ON farm_crops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
