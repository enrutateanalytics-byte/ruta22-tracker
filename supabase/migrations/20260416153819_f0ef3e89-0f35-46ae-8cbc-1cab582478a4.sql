
-- Desactivar la unidad actual R22-218 con IMEI 359857085116036
UPDATE public.gps_units SET is_active = false, updated_at = now() WHERE imei = 359857085116036;

-- Insertar nueva unidad R22-218 con el nuevo IMEI
INSERT INTO public.gps_units (imei, economic_number, provider, is_active, description)
VALUES (359857081120966, 'R22-218', 'tracksolid', true, 'Unidad R22-218 - IMEI actualizado');
