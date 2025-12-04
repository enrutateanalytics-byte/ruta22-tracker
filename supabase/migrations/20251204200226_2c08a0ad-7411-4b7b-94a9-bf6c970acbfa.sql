-- Activate TEBSA units as fallback while TrackSolid rate limiting is resolved
UPDATE gps_units SET is_active = true WHERE provider = 'tebsa';