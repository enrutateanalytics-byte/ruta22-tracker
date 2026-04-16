-- Desactivar IMEI actual de R22-218
UPDATE public.gps_units SET is_active = false, updated_at = now() WHERE imei = 359857081120966;

-- Insertar nuevo IMEI para R22-218
INSERT INTO public.gps_units (imei, economic_number, provider, is_active, description)
VALUES (869066064926711, 'R22-218', 'tracksolid', true, 'Unidad R22-218 - IMEI actualizado');