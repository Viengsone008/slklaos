-- =====================================================
-- Commercial Subcategories Table RLS (Row Level Security) Policies
-- =====================================================
-- Simple RLS policies for the commercial_subcategories table
-- Based on the actual table structure from Supabase schema

-- Actual table columns (from schema):
-- id (uuid, primary key, default gen_random_uuid())
-- name (text, not null)
-- Unique constraint: commercial_subcategories_name_key (name)

-- Enable RLS on commercial_subcategories table
ALTER TABLE commercial_subcategories ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "commercial_subcategories_public_select" ON commercial_subcategories;
DROP POLICY IF EXISTS "commercial_subcategories_authenticated_select" ON commercial_subcategories;
DROP POLICY IF EXISTS "commercial_subcategories_authenticated_insert" ON commercial_subcategories;
DROP POLICY IF EXISTS "commercial_subcategories_authenticated_update" ON commercial_subcategories;
DROP POLICY IF EXISTS "commercial_subcategories_authenticated_delete" ON commercial_subcategories;

-- =====================================================
-- Simple SELECT Policies
-- =====================================================

-- Policy: Allow public to view all commercial subcategories
CREATE POLICY "commercial_subcategories_public_select" ON commercial_subcategories
FOR SELECT 
TO public
USING (true); -- Allow all public reads

-- Policy: Allow authenticated users to view all commercial subcategories
CREATE POLICY "commercial_subcategories_authenticated_select" ON commercial_subcategories
FOR SELECT 
TO authenticated
USING (true); -- Allow all authenticated reads

-- =====================================================
-- Simple INSERT Policies
-- =====================================================

-- Policy: Allow authenticated users to create commercial subcategories
CREATE POLICY "commercial_subcategories_authenticated_insert" ON commercial_subcategories
FOR INSERT 
TO authenticated
WITH CHECK (
  name IS NOT NULL 
  AND LENGTH(TRIM(name)) > 0 -- Ensure name is not empty
);

-- =====================================================
-- Simple UPDATE Policies
-- =====================================================

-- Policy: Allow authenticated users to update commercial subcategories
CREATE POLICY "commercial_subcategories_authenticated_update" ON commercial_subcategories
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (
  name IS NOT NULL 
  AND LENGTH(TRIM(name)) > 0 -- Ensure name is not empty
);

-- =====================================================
-- Simple DELETE Policies
-- =====================================================

-- Policy: Allow authenticated users to delete commercial subcategories
CREATE POLICY "commercial_subcategories_authenticated_delete" ON commercial_subcategories
FOR DELETE 
TO authenticated
USING (true); -- Allow all authenticated deletes

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to update timestamps if they exist
CREATE OR REPLACE FUNCTION update_commercial_subcategories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if updated_at column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commercial_subcategories' 
    AND column_name = 'updated_at'
  ) THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at timestamp (if column exists)
DROP TRIGGER IF EXISTS trigger_update_commercial_subcategories_updated_at ON commercial_subcategories;
CREATE TRIGGER trigger_update_commercial_subcategories_updated_at
  BEFORE UPDATE ON commercial_subcategories
  FOR EACH ROW
  EXECUTE FUNCTION update_commercial_subcategories_updated_at();

-- Function to normalize names
CREATE OR REPLACE FUNCTION normalize_commercial_subcategory_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Trim and normalize the name
  NEW.name = TRIM(NEW.name);
  
  -- Ensure name is not empty after trimming
  IF LENGTH(NEW.name) = 0 THEN
    RAISE EXCEPTION 'Commercial subcategory name cannot be empty';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for name normalization
DROP TRIGGER IF EXISTS trigger_normalize_commercial_subcategory_name ON commercial_subcategories;
CREATE TRIGGER trigger_normalize_commercial_subcategory_name
  BEFORE INSERT OR UPDATE ON commercial_subcategories
  FOR EACH ROW
  EXECUTE FUNCTION normalize_commercial_subcategory_name();

-- =====================================================
-- Notes and Usage Examples
-- =====================================================

/*
Simple Commercial Subcategories Table RLS Policies:

Table Structure:
- id: uuid (primary key, auto-generated)
- name: commercial subcategory name (required, unique)

Security Model:
1. Public can view all commercial subcategories (for website display)
2. Authenticated users can create, update, and delete commercial subcategories
3. Name validation ensures non-empty, unique names
4. Automatic name normalization (trim whitespace)
5. Automatic timestamp updates (if column exists)

Usage Examples:

-- View all commercial subcategories (public)
SELECT * FROM commercial_subcategories ORDER BY name;

-- Create a new commercial subcategory (authenticated)
INSERT INTO commercial_subcategories (name)
VALUES ('Office Buildings');

-- Create multiple commercial subcategories (authenticated)
INSERT INTO commercial_subcategories (name) VALUES 
  ('Retail Spaces'),
  ('Warehouses'),
  ('Industrial Facilities'),
  ('Shopping Centers'),
  ('Hotels & Hospitality'),
  ('Healthcare Facilities'),
  ('Educational Buildings');

-- Update commercial subcategory name (authenticated)
UPDATE commercial_subcategories 
SET name = 'Mixed-Use Developments'
WHERE id = 'subcategory-uuid';

-- Delete a commercial subcategory (authenticated)
DELETE FROM commercial_subcategories 
WHERE id = 'subcategory-uuid';

-- Search commercial subcategories by name pattern (public)
SELECT * FROM commercial_subcategories 
WHERE name ILIKE '%office%'
ORDER BY name;

-- Count total commercial subcategories (public)
SELECT COUNT(*) as total_subcategories 
FROM commercial_subcategories;

Common Commercial Subcategories Examples:
- Office Buildings
- Retail Spaces
- Warehouses
- Industrial Facilities
- Shopping Centers
- Hotels & Hospitality
- Healthcare Facilities
- Educational Buildings
- Mixed-Use Developments
- Data Centers
- Manufacturing Plants
- Distribution Centers

Key Features:
- Public read access for website navigation/filtering
- Authenticated write access for content management
- Unique name constraint prevents duplicates
- Name validation and normalization
- Simple and efficient policies
- Perfect for commercial project categorization
*/
