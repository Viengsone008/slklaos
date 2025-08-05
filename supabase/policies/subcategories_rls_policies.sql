-- =====================================================
-- Subcategories Table RLS (Row Level Security) Policies
-- =====================================================
-- Simple RLS policies for the subcategories table
-- Based on the actual table structure from Supabase schema

-- Actual table columns (from schema):
-- id (uuid, primary key, default gen_random_uuid())
-- name (text, not null)
-- category_id (uuid, null)
-- Foreign key constraint: category_id references categories(id) on delete CASCADE

-- Enable RLS on subcategories table
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "subcategories_public_select" ON subcategories;
DROP POLICY IF EXISTS "subcategories_authenticated_select" ON subcategories;
DROP POLICY IF EXISTS "subcategories_authenticated_insert" ON subcategories;
DROP POLICY IF EXISTS "subcategories_authenticated_update" ON subcategories;
DROP POLICY IF EXISTS "subcategories_authenticated_delete" ON subcategories;

-- =====================================================
-- Simple SELECT Policies
-- =====================================================

-- Policy: Allow public to view all subcategories
CREATE POLICY "subcategories_public_select" ON subcategories
FOR SELECT 
TO public
USING (true); -- Allow all public reads

-- Policy: Allow authenticated users to view all subcategories
CREATE POLICY "subcategories_authenticated_select" ON subcategories
FOR SELECT 
TO authenticated
USING (true); -- Allow all authenticated reads

-- =====================================================
-- Simple INSERT Policies
-- =====================================================

-- Policy: Allow authenticated users to create subcategories
CREATE POLICY "subcategories_authenticated_insert" ON subcategories
FOR INSERT 
TO authenticated
WITH CHECK (
  name IS NOT NULL 
  AND LENGTH(TRIM(name)) > 0 -- Ensure name is not empty
);

-- =====================================================
-- Simple UPDATE Policies
-- =====================================================

-- Policy: Allow authenticated users to update subcategories
CREATE POLICY "subcategories_authenticated_update" ON subcategories
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

-- Policy: Allow authenticated users to delete subcategories
CREATE POLICY "subcategories_authenticated_delete" ON subcategories
FOR DELETE 
TO authenticated
USING (true); -- Allow all authenticated deletes

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to update timestamps if they exist
CREATE OR REPLACE FUNCTION update_subcategories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if updated_at column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subcategories' 
    AND column_name = 'updated_at'
  ) THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at timestamp (if column exists)
DROP TRIGGER IF EXISTS trigger_update_subcategories_updated_at ON subcategories;
CREATE TRIGGER trigger_update_subcategories_updated_at
  BEFORE UPDATE ON subcategories
  FOR EACH ROW
  EXECUTE FUNCTION update_subcategories_updated_at();

-- =====================================================
-- Notes and Usage Examples
-- =====================================================

/*
Simple Subcategories Table RLS Policies:

Table Structure:
- id: uuid (primary key, auto-generated)
- name: subcategory name (required)
- category_id: reference to parent category (optional)

Security Model:
1. Public can view all subcategories (for website display)
2. Authenticated users can create, update, and delete subcategories
3. Name validation ensures non-empty names
4. Automatic timestamp updates (if column exists)

Usage Examples:

-- View all subcategories (public)
SELECT * FROM subcategories ORDER BY name;

-- View subcategories for a specific category (public)
SELECT s.* FROM subcategories s 
WHERE s.category_id = 'category-uuid'
ORDER BY s.name;

-- Create a new subcategory (authenticated)
INSERT INTO subcategories (name, category_id)
VALUES ('Residential Construction', 'construction-category-uuid');

-- Update subcategory name (authenticated)
UPDATE subcategories 
SET name = 'Commercial Construction'
WHERE id = 'subcategory-uuid';

-- Delete a subcategory (authenticated)
DELETE FROM subcategories 
WHERE id = 'subcategory-uuid';

-- Get subcategories with their parent categories
SELECT 
  s.id,
  s.name as subcategory_name,
  c.name as category_name
FROM subcategories s
LEFT JOIN categories c ON s.category_id = c.id
ORDER BY c.name, s.name;

Key Features:
- Public read access for website navigation
- Authenticated write access for content management
- Name validation to prevent empty entries
- Foreign key relationship with categories table
- Cascade delete when parent category is removed
- Simple and efficient policies
*/
