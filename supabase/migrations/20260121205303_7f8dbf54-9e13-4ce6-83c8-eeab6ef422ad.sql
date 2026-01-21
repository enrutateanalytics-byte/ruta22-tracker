-- Deactivate all TEBSA units and activate all TrackSolid units
UPDATE public.gps_units 
SET is_active = false, updated_at = now() 
WHERE provider = 'tebsa';

UPDATE public.gps_units 
SET is_active = true, updated_at = now() 
WHERE provider = 'tracksolid';