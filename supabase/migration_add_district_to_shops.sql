-- Add district column to shops table
ALTER TABLE shops ADD COLUMN IF NOT EXISTS district TEXT;

-- Create index on district for filtering
CREATE INDEX IF NOT EXISTS idx_shops_district ON shops(district);

-- Update existing shops with district extracted from location (optional - for manual update later)
-- Example: UPDATE shops SET district = 'Raipur' WHERE location LIKE '%Raipur%';
