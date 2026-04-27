UPDATE public.gps_units
SET is_active = false, updated_at = now()
WHERE imei = 359857085116036;

INSERT INTO public.gps_units (imei, economic_number, provider, is_active)
VALUES (869066064959167, 'R22 - 218', 'tracksolid', true);