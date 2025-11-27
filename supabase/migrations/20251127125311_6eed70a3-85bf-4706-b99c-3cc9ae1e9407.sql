-- Actualizar números económicos correctos
UPDATE gps_units 
SET economic_number = '884', updated_at = now()
WHERE imei = 43808530;

UPDATE gps_units 
SET economic_number = '864', updated_at = now()
WHERE imei = 24704594;

-- Agregar IMEI 20706550 si no existe
INSERT INTO gps_units (imei, economic_number, description, is_active)
VALUES (20706550, '882', 'Unidad GPS activa', true)
ON CONFLICT (imei) DO UPDATE 
SET economic_number = '882', 
    is_active = true,
    updated_at = now();