-- Clear existing data
DELETE FROM route_points;
DELETE FROM stops;
DELETE FROM routes;

-- Create Ruta 22
INSERT INTO routes (id, name, description, color, is_active) 
VALUES (
  gen_random_uuid(),
  'Ruta 22',
  'Ruta principal del sistema de transporte urbano',
  '#FF5722',
  true
);

-- Get the route ID for reference
DO $$
DECLARE
    route_22_id uuid;
BEGIN
    SELECT id INTO route_22_id FROM routes WHERE name = 'Ruta 22';
    
    -- Insert stops for Ruta 22 (strategic stops in Tijuana)
    INSERT INTO stops (route_id, name, latitude, longitude, order_index) VALUES
    (route_22_id, 'Centro Cívico', 32.5149, -117.0382, 1),
    (route_22_id, 'Plaza Río', 32.5435, -117.0235, 2),
    (route_22_id, 'Hospital General', 32.5298, -117.0089, 3),
    (route_22_id, 'Universidad CETYS', 32.5456, -117.0156, 4),
    (route_22_id, 'Zona Norte', 32.5234, -117.0456, 5),
    (route_22_id, 'Mercado Hidalgo', 32.5167, -117.0389, 6),
    (route_22_id, 'Estadio Caliente', 32.5398, -117.0123, 7),
    (route_22_id, 'Terminal Central', 32.5089, -117.0234, 8);
    
    -- Insert route points for the complete route trace
    INSERT INTO route_points (route_id, latitude, longitude, order_index) VALUES
    (route_22_id, 32.5149, -117.0382, 1),
    (route_22_id, 32.5158, -117.0375, 2),
    (route_22_id, 32.5167, -117.0368, 3),
    (route_22_id, 32.5189, -117.0345, 4),
    (route_22_id, 32.5234, -117.0298, 5),
    (route_22_id, 32.5278, -117.0256, 6),
    (route_22_id, 32.5325, -117.0223, 7),
    (route_22_id, 32.5378, -117.0198, 8),
    (route_22_id, 32.5435, -117.0235, 9),
    (route_22_id, 32.5445, -117.0201, 10),
    (route_22_id, 32.5456, -117.0156, 11),
    (route_22_id, 32.5434, -117.0134, 12),
    (route_22_id, 32.5398, -117.0123, 13),
    (route_22_id, 32.5356, -117.0156, 14),
    (route_22_id, 32.5298, -117.0089, 15),
    (route_22_id, 32.5267, -117.0178, 16),
    (route_22_id, 32.5234, -117.0256, 17),
    (route_22_id, 32.5198, -117.0334, 18),
    (route_22_id, 32.5167, -117.0389, 19),
    (route_22_id, 32.5134, -117.0298, 20),
    (route_22_id, 32.5089, -117.0234, 21);
    
END $$;