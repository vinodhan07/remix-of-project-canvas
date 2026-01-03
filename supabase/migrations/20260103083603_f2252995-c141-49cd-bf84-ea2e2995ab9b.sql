-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create cities table (reusable across trips)
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  cost_index DECIMAL(3,2) DEFAULT 1.00,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, country)
);

-- Create trips table
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trip_name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_public BOOLEAN DEFAULT false,
  cover_image TEXT,
  share_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Create trip_stops table (cities in a trip sequence)
CREATE TABLE public.trip_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_stop_dates CHECK (end_date >= start_date)
);

-- Create activities table (available activities per city)
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('transport', 'accommodation', 'food', 'activities', 'other')),
  description TEXT,
  estimated_cost DECIMAL(10,2) DEFAULT 0,
  duration_hours DECIMAL(4,2),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create itinerary_items table (day-wise planning)
CREATE TABLE public.itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_stop_id UUID NOT NULL REFERENCES public.trip_stops(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  custom_name TEXT,
  date DATE NOT NULL,
  time_slot TIME,
  cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  is_completed BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create budgets table (auto-calculated per trip)
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL UNIQUE REFERENCES public.trips(id) ON DELETE CASCADE,
  transport_cost DECIMAL(10,2) DEFAULT 0,
  accommodation_cost DECIMAL(10,2) DEFAULT 0,
  food_cost DECIMAL(10,2) DEFAULT 0,
  activities_cost DECIMAL(10,2) DEFAULT 0,
  other_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (transport_cost + accommodation_cost + food_cost + activities_cost + other_cost) STORED,
  currency TEXT DEFAULT 'USD',
  daily_limit DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create packing_lists table
CREATE TABLE public.packing_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create packing_items table
CREATE TABLE public.packing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  packing_list_id UUID NOT NULL REFERENCES public.packing_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Essentials',
  is_packed BOOLEAN DEFAULT false,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packing_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packing_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Cities policies (public read, admin write - for now everyone can add)
CREATE POLICY "Cities are viewable by everyone" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert cities" ON public.cities FOR INSERT TO authenticated WITH CHECK (true);

-- Trips policies
CREATE POLICY "Users can view their own trips" ON public.trips FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert their own trips" ON public.trips FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own trips" ON public.trips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own trips" ON public.trips FOR DELETE USING (auth.uid() = user_id);

-- Trip stops policies
CREATE POLICY "Users can view stops of their trips" ON public.trip_stops FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_stops.trip_id AND (trips.user_id = auth.uid() OR trips.is_public = true))
);
CREATE POLICY "Users can insert stops to their trips" ON public.trip_stops FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_stops.trip_id AND trips.user_id = auth.uid())
);
CREATE POLICY "Users can update stops of their trips" ON public.trip_stops FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_stops.trip_id AND trips.user_id = auth.uid())
);
CREATE POLICY "Users can delete stops from their trips" ON public.trip_stops FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_stops.trip_id AND trips.user_id = auth.uid())
);

-- Activities policies (public read)
CREATE POLICY "Activities are viewable by everyone" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert activities" ON public.activities FOR INSERT TO authenticated WITH CHECK (true);

-- Itinerary items policies
CREATE POLICY "Users can view itinerary of their trips" ON public.itinerary_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.trip_stops ts
    JOIN public.trips t ON t.id = ts.trip_id
    WHERE ts.id = itinerary_items.trip_stop_id AND (t.user_id = auth.uid() OR t.is_public = true)
  )
);
CREATE POLICY "Users can insert itinerary items" ON public.itinerary_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trip_stops ts
    JOIN public.trips t ON t.id = ts.trip_id
    WHERE ts.id = itinerary_items.trip_stop_id AND t.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update their itinerary items" ON public.itinerary_items FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.trip_stops ts
    JOIN public.trips t ON t.id = ts.trip_id
    WHERE ts.id = itinerary_items.trip_stop_id AND t.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete their itinerary items" ON public.itinerary_items FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.trip_stops ts
    JOIN public.trips t ON t.id = ts.trip_id
    WHERE ts.id = itinerary_items.trip_stop_id AND t.user_id = auth.uid()
  )
);

-- Budgets policies
CREATE POLICY "Users can view budgets of their trips" ON public.budgets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = budgets.trip_id AND (trips.user_id = auth.uid() OR trips.is_public = true))
);
CREATE POLICY "Users can insert budgets for their trips" ON public.budgets FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = budgets.trip_id AND trips.user_id = auth.uid())
);
CREATE POLICY "Users can update budgets of their trips" ON public.budgets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = budgets.trip_id AND trips.user_id = auth.uid())
);

-- Packing lists policies
CREATE POLICY "Users can view packing lists of their trips" ON public.packing_lists FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = packing_lists.trip_id AND trips.user_id = auth.uid())
);
CREATE POLICY "Users can insert packing lists" ON public.packing_lists FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = packing_lists.trip_id AND trips.user_id = auth.uid())
);
CREATE POLICY "Users can delete packing lists" ON public.packing_lists FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.trips WHERE trips.id = packing_lists.trip_id AND trips.user_id = auth.uid())
);

-- Packing items policies
CREATE POLICY "Users can view packing items" ON public.packing_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.packing_lists pl
    JOIN public.trips t ON t.id = pl.trip_id
    WHERE pl.id = packing_items.packing_list_id AND t.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert packing items" ON public.packing_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.packing_lists pl
    JOIN public.trips t ON t.id = pl.trip_id
    WHERE pl.id = packing_items.packing_list_id AND t.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update packing items" ON public.packing_items FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.packing_lists pl
    JOIN public.trips t ON t.id = pl.trip_id
    WHERE pl.id = packing_items.packing_list_id AND t.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete packing items" ON public.packing_items FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.packing_lists pl
    JOIN public.trips t ON t.id = pl.trip_id
    WHERE pl.id = packing_items.packing_list_id AND t.user_id = auth.uid()
  )
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to auto-create budget when trip is created
CREATE OR REPLACE FUNCTION public.handle_new_trip()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.budgets (trip_id) VALUES (NEW.id);
  INSERT INTO public.packing_lists (trip_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger to create budget and packing list on new trip
CREATE TRIGGER on_trip_created
  AFTER INSERT ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_trip();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_trips_user_id ON public.trips(user_id);
CREATE INDEX idx_trips_is_public ON public.trips(is_public);
CREATE INDEX idx_trips_share_code ON public.trips(share_code);
CREATE INDEX idx_trip_stops_trip_id ON public.trip_stops(trip_id);
CREATE INDEX idx_trip_stops_city_id ON public.trip_stops(city_id);
CREATE INDEX idx_activities_city_id ON public.activities(city_id);
CREATE INDEX idx_activities_category ON public.activities(category);
CREATE INDEX idx_itinerary_items_trip_stop_id ON public.itinerary_items(trip_stop_id);
CREATE INDEX idx_itinerary_items_date ON public.itinerary_items(date);
CREATE INDEX idx_packing_items_list_id ON public.packing_items(packing_list_id);

-- Insert some starter cities
INSERT INTO public.cities (name, country, cost_index, image_url) VALUES
  ('Paris', 'France', 1.50, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'),
  ('Tokyo', 'Japan', 1.40, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800'),
  ('Bali', 'Indonesia', 0.70, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800'),
  ('Santorini', 'Greece', 1.30, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800'),
  ('New York', 'USA', 1.60, 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800'),
  ('Barcelona', 'Spain', 1.20, 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800'),
  ('Dubai', 'UAE', 1.45, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800'),
  ('Sydney', 'Australia', 1.35, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800');