-- =====================================================
-- Categories Table RLS (Row Level Security) Policies
-- =====================================================
-- Simple RLS policies for the categories table
-- Based on the actual table structure from Supabase schema

-- Actual table columns (from schema):
-- id (uuid, primary key, default gen_random_uuid())
-- name (text, not null)
-- Unique constraint: categories_name_key (name)

-- Enable RLS on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "categories_public_select" ON categories;
DROP POLICY IF EXISTS "categories_authenticated_select" ON categories;
DROP POLICY IF EXISTS "categories_authenticated_insert" ON categories;
DROP POLICY IF EXISTS "categories_authenticated_update" ON categories;
DROP POLICY IF EXISTS "categories_authenticated_delete" ON categories;

-- =====================================================
-- Simple SELECT Policies
-- =====================================================

-- Policy: Allow public to view all categories
CREATE POLICY "categories_public_select" ON categories
FOR SELECT 
TO public
USING (true); -- Allow all public reads

-- Policy: Allow authenticated users to view all categories
CREATE POLICY "categories_authenticated_select" ON categories
FOR SELECT 
TO authenticated
USING (true); -- Allow all authenticated reads

-- =====================================================
-- Simple INSERT Policies
-- =====================================================

-- Policy: Allow authenticated users to create categories
CREATE POLICY "categories_authenticated_insert" ON categories
FOR INSERT 
TO authenticated
WITH CHECK (
  name IS NOT NULL 
  AND LENGTH(TRIM(name)) > 0 -- Ensure name is not empty
);

-- =====================================================
-- Simple UPDATE Policies
-- =====================================================

-- Policy: Allow authenticated users to update categories
CREATE POLICY "categories_authenticated_update" ON categories
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

-- Policy: Allow authenticated users to delete categories
CREATE POLICY "categories_authenticated_delete" ON categories
FOR DELETE 
TO authenticated
USING (true); -- Allow all authenticated deletes

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to update timestamps if they exist
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if updated_at column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' 
    AND column_name = 'updated_at'
  ) THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at timestamp (if column exists)
DROP TRIGGER IF EXISTS trigger_update_categories_updated_at ON categories;
CREATE TRIGGER trigger_update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- Function to normalize category names
CREATE OR REPLACE FUNCTION normalize_category_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Trim and normalize the name
  NEW.name = TRIM(NEW.name);
  
  -- Ensure name is not empty after trimming
  IF LENGTH(NEW.name) = 0 THEN
    RAISE EXCEPTION 'Category name cannot be empty';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for name normalization
DROP TRIGGER IF EXISTS trigger_normalize_category_name ON categories;
CREATE TRIGGER trigger_normalize_category_name
  BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION normalize_category_name();

-- =====================================================
-- Notes and Usage Examples
-- =====================================================

/*
Simple Categories Table RLS Policies:

Table Structure:
- id: uuid (primary key, auto-generated)
- name: category name (required, unique)

Security Model:
1. Public can view all categories (for website display)
2. Authenticated users can create, update, and delete categories
3. Name validation ensures non-empty, unique names
4. Automatic name normalization (trim whitespace)
5. Automatic timestamp updates (if column exists)

Usage Examples:

-- View all categories (public)
SELECT * FROM categories ORDER BY name;

-- Create a new category (authenticated)
INSERT INTO categories (name)
VALUES ('Construction');

-- Create multiple categories (authenticated)
INSERT INTO categories (name) VALUES 
  ('Residential'),
  ('Commercial'),
  ('Industrial'),
  ('Infrastructure'),
  ('Design'),
  ('Renovation'),
  ('Consulting');

-- Update category name (authenticated)
UPDATE categories 
SET name = 'Residential Construction'
WHERE id = 'category-uuid';

-- Delete a category (authenticated)
DELETE FROM categories 
WHERE id = 'category-uuid';

-- Search categories by name pattern (public)
SELECT * FROM categories 
WHERE name ILIKE '%construction%'
ORDER BY name;

-- Count total categories (public)
SELECT COUNT(*) as total_categories 
FROM categories;

-- Get categories with their subcategories (if subcategories table exists)
SELECT 
  c.id,
  c.name as category_name,
  COUNT(s.id) as subcategory_count
FROM categories c
LEFT JOIN subcategories s ON c.id = s.category_id
GROUP BY c.id, c.name
ORDER BY c.name;

Common Category Examples:
- Construction
- Residential
- Commercial
- Industrial
- Infrastructure
- Design
- Renovation
- Consulting
- Engineering
- Project Management

Key Features:
- Public read access for website navigation/filtering
- Authenticated write access for content management
- Unique name constraint prevents duplicates
- Name validation and normalization
- Simple and efficient policies
- Perfect for organizing projects, products, or services
- Foundation for hierarchical categorization systems
*/
