-- Profiles table to store phone numbers
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Restrict admin panel data: only authenticated admins can mutate routes/stops/route_points/gps_units
-- Drop existing public mutation policies
DROP POLICY IF EXISTS "Public can insert routes" ON public.routes;
DROP POLICY IF EXISTS "Public can update routes" ON public.routes;
DROP POLICY IF EXISTS "Public can delete routes" ON public.routes;

DROP POLICY IF EXISTS "Public can insert stops" ON public.stops;
DROP POLICY IF EXISTS "Public can update stops" ON public.stops;
DROP POLICY IF EXISTS "Public can delete stops" ON public.stops;

DROP POLICY IF EXISTS "Public can insert route points" ON public.route_points;
DROP POLICY IF EXISTS "Public can update route points" ON public.route_points;
DROP POLICY IF EXISTS "Public can delete route points" ON public.route_points;

DROP POLICY IF EXISTS "Public can insert GPS units" ON public.gps_units;
DROP POLICY IF EXISTS "Public can update GPS units" ON public.gps_units;
DROP POLICY IF EXISTS "Public can delete GPS units" ON public.gps_units;

-- Recreate as admin-only mutations (SELECT remains public so the app keeps working)
CREATE POLICY "Admins can insert routes" ON public.routes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update routes" ON public.routes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete routes" ON public.routes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert stops" ON public.stops FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update stops" ON public.stops FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete stops" ON public.stops FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert route points" ON public.route_points FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update route points" ON public.route_points FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete route points" ON public.route_points FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert GPS units" ON public.gps_units FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update GPS units" ON public.gps_units FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete GPS units" ON public.gps_units FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));