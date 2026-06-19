-- ============================================================
-- NAKSH369 Database Schema
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  whatsapp_number TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client profiles (birth data per reading)
CREATE TABLE IF NOT EXISTS public.client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  first_name TEXT,
  dob DATE NOT NULL,
  birth_time TEXT,
  birth_time_uncertain BOOLEAN DEFAULT FALSE,
  birth_place TEXT NOT NULL,
  birth_place_lat NUMERIC,
  birth_place_lng NUMERIC,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  life_path_number INT,
  birthday_number INT,
  personal_year INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Readings
CREATE TABLE IF NOT EXISTS public.readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  client_profile_id UUID REFERENCES public.client_profiles(id),
  reading_type TEXT DEFAULT 'blueprint',
  questions TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'delivered', 'rejected')),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blueprints
CREATE TABLE IF NOT EXISTS public.blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id UUID REFERENCES public.readings(id) ON DELETE CASCADE UNIQUE,
  content_html TEXT,
  pdf_url TEXT,
  generation_status TEXT DEFAULT 'pending' CHECK (generation_status IN ('pending', 'completed', 'failed')),
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRM tracking
CREATE TABLE IF NOT EXISTS public.crm_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  interaction_type TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Auto-create user profile on signup trigger
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      first_name = COALESCE(EXCLUDED.first_name, public.users.first_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tracking ENABLE ROW LEVEL SECURITY;

-- Users: can read/update own row
CREATE POLICY "Users read own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Client profiles: own only
CREATE POLICY "Users manage own profiles" ON public.client_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Readings: own only
CREATE POLICY "Users manage own readings" ON public.readings
  FOR ALL USING (auth.uid() = user_id);

-- Blueprints: accessible if reading belongs to user
CREATE POLICY "Users access own blueprints" ON public.blueprints
  FOR SELECT USING (
    reading_id IN (SELECT id FROM public.readings WHERE user_id = auth.uid())
  );

-- CRM: own only
CREATE POLICY "Users own crm" ON public.crm_tracking
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- Supabase Storage bucket for blueprints
-- (Run separately if needed, or create via Dashboard)
-- ============================================================

-- INSERT INTO storage.buckets (id, name, public) VALUES ('blueprints', 'blueprints', true)
-- ON CONFLICT DO NOTHING;

-- ============================================================
-- Set admin role (run after creating admin user in Auth)
-- Replace the email below with your admin email
-- ============================================================

-- UPDATE public.users SET role = 'admin' WHERE email = 'himanshoumehtta@gmail.com';
