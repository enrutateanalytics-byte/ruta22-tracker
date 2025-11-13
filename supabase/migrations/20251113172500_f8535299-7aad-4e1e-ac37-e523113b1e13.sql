-- Actualizar políticas RLS para permitir acceso público sin autenticación

-- Route points: Permitir inserción, actualización y eliminación pública
DROP POLICY IF EXISTS "Only admins can insert route points" ON route_points;
DROP POLICY IF EXISTS "Only admins can update route points" ON route_points;
DROP POLICY IF EXISTS "Only admins can delete route points" ON route_points;

CREATE POLICY "Public can insert route points" 
ON route_points 
FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "Public can update route points" 
ON route_points 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete route points" 
ON route_points 
FOR DELETE 
TO public
USING (true);

-- Stops: Permitir inserción, actualización y eliminación pública
DROP POLICY IF EXISTS "Only admins can insert stops" ON stops;
DROP POLICY IF EXISTS "Only admins can update stops" ON stops;
DROP POLICY IF EXISTS "Only admins can delete stops" ON stops;

CREATE POLICY "Public can insert stops" 
ON stops 
FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "Public can update stops" 
ON stops 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete stops" 
ON stops 
FOR DELETE 
TO public
USING (true);

-- Routes: Permitir inserción, actualización y eliminación pública
DROP POLICY IF EXISTS "Only admins can insert routes" ON routes;
DROP POLICY IF EXISTS "Only admins can update routes" ON routes;
DROP POLICY IF EXISTS "Only admins can delete routes" ON routes;

CREATE POLICY "Public can insert routes" 
ON routes 
FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "Public can update routes" 
ON routes 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete routes" 
ON routes 
FOR DELETE 
TO public
USING (true);