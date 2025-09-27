-- Insertar rutas basadas en la información existente de TEBSA
INSERT INTO public.routes (name, description, color, is_active) VALUES
('M1 R18 - Apoyo Urbi 2 / Barcelona', 'Ruta desde Urbi hasta Barcelona, horario matutino desde las 5:20 AM', '#A52714', true),
('Ruta Centro-Playas', 'Conexión desde el centro de Tijuana hasta Playas de Tijuana', '#2E7D32', true),
('Línea Azul - Otay Mesa', 'Servicio hacia Otay Mesa y zona industrial', '#1976D2', true),
('Ruta Universidad', 'Servicio para estudiantes, conecta universidades principales', '#7B1FA2', true),
('Línea Roja - Zona Río', 'Servicio directo a Zona Río y centros comerciales', '#D32F2F', true);

-- Obtener el ID de la ruta M1 R18 para insertar sus paradas
DO $$
DECLARE
    ruta_m1_id UUID;
    ruta_centro_id UUID;
    ruta_otay_id UUID;
    ruta_uni_id UUID;
    ruta_rio_id UUID;
BEGIN
    -- Obtener IDs de las rutas
    SELECT id INTO ruta_m1_id FROM public.routes WHERE name = 'M1 R18 - Apoyo Urbi 2 / Barcelona';
    SELECT id INTO ruta_centro_id FROM public.routes WHERE name = 'Ruta Centro-Playas';
    SELECT id INTO ruta_otay_id FROM public.routes WHERE name = 'Línea Azul - Otay Mesa';
    SELECT id INTO ruta_uni_id FROM public.routes WHERE name = 'Ruta Universidad';
    SELECT id INTO ruta_rio_id FROM public.routes WHERE name = 'Línea Roja - Zona Río';
    
    -- Insertar paradas para la ruta M1 R18 basadas en el archivo KML
    INSERT INTO public.stops (route_id, name, latitude, longitude, order_index) VALUES
    (ruta_m1_id, 'ROMA URBI 2', 32.4250856, -116.9652378, 1),
    (ruta_m1_id, 'FIRST CASH URBI', 32.4205141, -116.9698526, 2),
    (ruta_m1_id, 'Blvd Barcelona', 32.4383712, -116.9865719, 3),
    (ruta_m1_id, 'Eco Recycling', 32.453666, -116.9927026, 4),
    (ruta_m1_id, 'Tacos El Toro', 32.4489807, -116.9967076, 5),
    (ruta_m1_id, 'Aprecio', 32.4464607, -116.9992945, 6),
    (ruta_m1_id, 'AutoZone', 32.4446422, -117.0148582, 7),
    (ruta_m1_id, 'ADI SYSTEMS', 32.4639952, -117.0170478, 8);
    
    -- Insertar paradas para otras rutas
    INSERT INTO public.stops (route_id, name, latitude, longitude, order_index) VALUES
    -- Ruta Centro-Playas
    (ruta_centro_id, 'Centro Cívico', 32.5149, -117.0382, 1),
    (ruta_centro_id, 'Mercado Hidalgo', 32.5168, -117.0342, 2),
    (ruta_centro_id, 'Zona Centro', 32.5321, -117.0287, 3),
    (ruta_centro_id, 'Hospital General', 32.5089, -117.0456, 4),
    (ruta_centro_id, 'Playas de Tijuana', 32.5321, -117.1287, 5),
    
    -- Línea Azul - Otay Mesa
    (ruta_otay_id, 'Terminal Centro', 32.5149, -117.0382, 1),
    (ruta_otay_id, 'Boulevard Agua Caliente', 32.5234, -117.0156, 2),
    (ruta_otay_id, 'Plaza Río', 32.5321, -117.0087, 3),
    (ruta_otay_id, 'Otay Universidad', 32.5556, -116.9456, 4),
    (ruta_otay_id, 'Otay Mesa Industrial', 32.5678, -116.9234, 5),
    
    -- Ruta Universidad
    (ruta_uni_id, 'CETYS Universidad', 32.5234, -117.0456, 1),
    (ruta_uni_id, 'UABC Tijuana', 32.5089, -117.0123, 2),
    (ruta_uni_id, 'Centro Cultural', 32.5321, -117.0287, 3),
    (ruta_uni_id, 'Instituto Tecnológico', 32.4987, -117.0654, 4),
    
    -- Línea Roja - Zona Río
    (ruta_rio_id, 'Garita San Ysidro', 32.5421, -117.0321, 1),
    (ruta_rio_id, 'Plaza Santa Fe', 32.5234, -117.0156, 2),
    (ruta_rio_id, 'Zona Río', 32.5149, -117.0382, 3),
    (ruta_rio_id, 'Galerias Hipódromo', 32.4987, -117.0654, 4);
    
    -- Insertar puntos de ruta basados en el KML para M1 R18 (algunos puntos clave)
    INSERT INTO public.route_points (route_id, latitude, longitude, order_index) VALUES
    (ruta_m1_id, 32.4251559, -116.9652558, 1),
    (ruta_m1_id, 32.4255679, -116.9659344, 2),
    (ruta_m1_id, 32.4259732, -116.9665969, 3),
    (ruta_m1_id, 32.4261294, -116.966959, 4),
    (ruta_m1_id, 32.4264305, -116.96771, 5),
    (ruta_m1_id, 32.4265709, -116.9680882, 6),
    (ruta_m1_id, 32.4266275, -116.9683672, 7),
    (ruta_m1_id, 32.4266886, -116.968807, 8),
    (ruta_m1_id, 32.4267045, -116.9691772, 9),
    (ruta_m1_id, 32.4266886, -116.9694508, 10),
    (ruta_m1_id, 32.4205141, -116.9698526, 11),
    (ruta_m1_id, 32.4383712, -116.9865719, 12),
    (ruta_m1_id, 32.453666, -116.9927026, 13),
    (ruta_m1_id, 32.4489807, -116.9967076, 14),
    (ruta_m1_id, 32.4464607, -116.9992945, 15),
    (ruta_m1_id, 32.4446422, -117.0148582, 16),
    (ruta_m1_id, 32.4639952, -117.0170478, 17);
    
    -- Insertar algunos puntos de ruta para las otras rutas también
    INSERT INTO public.route_points (route_id, latitude, longitude, order_index) VALUES
    -- Puntos para Ruta Centro-Playas
    (ruta_centro_id, 32.5149, -117.0382, 1),
    (ruta_centro_id, 32.5156, -117.0365, 2),
    (ruta_centro_id, 32.5168, -117.0342, 3),
    (ruta_centro_id, 32.5234, -117.0287, 4),
    (ruta_centro_id, 32.5321, -117.1087, 5),
    (ruta_centro_id, 32.5321, -117.1287, 6);

END $$;