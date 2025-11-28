-- Add provider column to gps_units table
ALTER TABLE gps_units 
ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'tebsa';

-- Add check constraint for valid providers
ALTER TABLE gps_units 
ADD CONSTRAINT gps_units_provider_check 
CHECK (provider IN ('tebsa', 'tracksolid'));

-- Update existing records to use 'tebsa' provider
UPDATE gps_units 
SET provider = 'tebsa' 
WHERE provider IS NULL OR provider = '';