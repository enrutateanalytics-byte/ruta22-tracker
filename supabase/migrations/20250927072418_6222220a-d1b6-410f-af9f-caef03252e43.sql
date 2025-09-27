-- Create routes table
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#FF0000',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stops table
CREATE TABLE public.stops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create route_points table for geographical route data
CREATE TABLE public.route_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_points ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (transport data should be publicly viewable)
CREATE POLICY "Routes are publicly viewable" 
ON public.routes 
FOR SELECT 
USING (true);

CREATE POLICY "Stops are publicly viewable" 
ON public.stops 
FOR SELECT 
USING (true);

CREATE POLICY "Route points are publicly viewable" 
ON public.route_points 
FOR SELECT 
USING (true);

-- For now, we'll make all operations public since there's no authentication yet
-- In production, you should restrict INSERT, UPDATE, DELETE to admin users only
CREATE POLICY "Anyone can manage routes" 
ON public.routes 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can manage stops" 
ON public.stops 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can manage route points" 
ON public.route_points 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_stops_route_id ON public.stops(route_id);
CREATE INDEX idx_stops_order ON public.stops(route_id, order_index);
CREATE INDEX idx_route_points_route_id ON public.route_points(route_id);
CREATE INDEX idx_route_points_order ON public.route_points(route_id, order_index);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON public.routes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stops_updated_at
  BEFORE UPDATE ON public.stops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();