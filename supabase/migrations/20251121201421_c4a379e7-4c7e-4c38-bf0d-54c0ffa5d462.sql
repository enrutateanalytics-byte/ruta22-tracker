-- Create table to store GPS unit details with economic numbers
CREATE TABLE IF NOT EXISTS public.gps_units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  imei BIGINT NOT NULL UNIQUE,
  economic_number TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.gps_units ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "GPS units are publicly viewable" 
ON public.gps_units 
FOR SELECT 
USING (true);

-- Create policies for public write access (for admin panel)
CREATE POLICY "Public can insert GPS units" 
ON public.gps_units 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update GPS units" 
ON public.gps_units 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete GPS units" 
ON public.gps_units 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gps_units_updated_at
BEFORE UPDATE ON public.gps_units
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data for existing units
INSERT INTO public.gps_units (imei, economic_number, description) VALUES
  (53502533, '101', 'Unidad GPS activa'),
  (51301501, '102', 'Unidad GPS activa'),
  (62704513, '103', 'Unidad GPS activa'),
  (15805513, '104', 'Unidad GPS activa'),
  (43808530, '105', 'Unidad GPS activa'),
  (9403503, '106', 'Unidad GPS activa'),
  (5305593, '107', 'Unidad GPS activa'),
  (98003544, '108', 'Unidad GPS activa'),
  (64003519, '109', 'Unidad GPS activa'),
  (24704594, '110', 'Unidad GPS activa'),
  (6204526, '111', 'Unidad GPS activa')
ON CONFLICT (imei) DO NOTHING;