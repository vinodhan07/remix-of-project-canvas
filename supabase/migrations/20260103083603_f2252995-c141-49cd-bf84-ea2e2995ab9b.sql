-- Create profiles table (User Context)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- Redundant but requested structure often implies it
  full_name TEXT,
  avatar_url TEXT,
  dietary_preference TEXT, -- e.g., veg/home-style
  health_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create trips table
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  dates RANGE, -- storing range if preferred, but start/end is explicit
  budget_limit DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create stops table
CREATE TABLE public.stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  best_time_to_visit TEXT, -- e.g. "April-June"
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create activities table (Planned activities)
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id UUID NOT NULL REFERENCES public.stops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  cost DECIMAL(10,2) DEFAULT 0,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  is_visited BOOLEAN DEFAULT false,
  is_must_see BOOLEAN DEFAULT false, -- For "Gold" landmarks
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create transport table
CREATE TABLE public.transport (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE, -- Optional direct link for easier queries
  from_activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  to_activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  mode TEXT CHECK (mode IN ('walk', 'drive', 'transit', 'flight', 'train', 'other')),
  duration_mins INTEGER,
  cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Settings
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport ENABLE ROW LEVEL SECURITY;

-- Policies
-- Profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trips
CREATE POLICY "Users can view own trips" ON public.trips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trips" ON public.trips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trips" ON public.trips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trips" ON public.trips FOR DELETE USING (auth.uid() = user_id);

-- Stops
CREATE POLICY "Users can view stops of own trips" ON public.stops FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = stops.trip_id AND trips.user_id = auth.uid())
);
CREATE POLICY "Users can manage stops of own trips" ON public.stops FOR ALL USING (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = stops.trip_id AND trips.user_id = auth.uid())
);

-- Activities
CREATE POLICY "Users can view activities of own trips" ON public.activities FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.stops 
    JOIN public.trips ON trips.id = stops.trip_id 
    WHERE stops.id = activities.stop_id AND trips.user_id = auth.uid()
  )
);
CREATE POLICY "Users can manage activities of own trips" ON public.activities FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.stops 
    JOIN public.trips ON trips.id = stops.trip_id 
    WHERE stops.id = activities.stop_id AND trips.user_id = auth.uid()
  )
);

-- Transport
CREATE POLICY "Users can view transport of own trips" ON public.transport FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.activities a
    JOIN public.stops s ON s.id = a.stop_id
    JOIN public.trips t ON t.id = s.trip_id
    WHERE (transport.from_activity_id = a.id OR transport.to_activity_id = a.id)
    AND t.user_id = auth.uid()
  )
);
CREATE POLICY "Users can manage transport of own trips" ON public.transport FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.activities a
    JOIN public.stops s ON s.id = a.stop_id
    JOIN public.trips t ON t.id = s.trip_id
    WHERE (transport.from_activity_id = a.id) -- Simplified check
    AND t.user_id = auth.uid()
  )
);

-- Triggers for User Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, dietary_preference)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'standard');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();