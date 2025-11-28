-- Paso 1: Desactivar todas las unidades TEBSA existentes
UPDATE gps_units 
SET is_active = false 
WHERE provider = 'tebsa';

-- Paso 2: Insertar las 13 nuevas unidades TrackSolid
INSERT INTO gps_units (imei, economic_number, provider, is_active) VALUES
(359857083600601, 'R22 - 495', 'tracksolid', true),
(359857085256386, 'R22 - 668', 'tracksolid', true),
(359857083708685, 'R22 - 690', 'tracksolid', true),
(862798052273915, 'R22 - 882', 'tracksolid', true),
(359857080881931, 'R22 - 864', 'tracksolid', true),
(359857083592014, 'R22 - 884', 'tracksolid', true),
(359857085107803, 'R22 - 353', 'tracksolid', true),
(359857083023317, 'R22 - 129', 'tracksolid', true),
(359857083600544, 'R22 - 759', 'tracksolid', true),
(359857085262566, 'R22 - 247', 'tracksolid', true),
(359857085116036, 'R22 - 218', 'tracksolid', true),
(359857086387693, 'R22 - 1324', 'tracksolid', true),
(359857085259901, 'R22 - 917', 'tracksolid', true);