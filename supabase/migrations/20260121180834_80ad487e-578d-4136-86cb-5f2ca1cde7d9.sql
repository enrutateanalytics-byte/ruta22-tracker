-- Deactivate GPS units R22-129 and R22-218
UPDATE public.gps_units 
SET is_active = false, updated_at = now() 
WHERE imei IN (359857083023317, 359857085116036);