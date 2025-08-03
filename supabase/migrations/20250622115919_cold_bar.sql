/*
  # Fix Documents RLS Policies

  1. Security Updates
    - Update RLS policies for documents table to allow proper inserts
    - Ensure uploaded_by field is properly handled
    - Fix policy conditions for authenticated users

  2. Changes
    - Drop existing problematic policies
    - Create new, more permissive policies for document creation
    - Ensure trigger function works correctly with RLS
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Authenticated users can create documents" ON documents;
DROP POLICY IF EXISTS "Public can create documents when authenticated" ON documents;

-- Create a more permissive insert policy for authenticated users
CREATE POLICY "Allow authenticated users to create documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create a policy for public role that checks for authentication
CREATE POLICY "Allow public to create documents with auth"
  ON documents
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() IS NOT NULL);

-- Update the existing select policy to be more permissive for authenticated users
DROP POLICY IF EXISTS "Public can read non-confidential documents" ON documents;
CREATE POLICY "Authenticated users can read accessible documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    (is_confidential = false) OR 
    (uploaded_by = auth.uid()) OR 
    (EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    ))
  );

-- Create a simpler public select policy
CREATE POLICY "Public can read non-confidential documents"
  ON documents
  FOR SELECT
  TO public
  USING (
    (is_confidential = false AND auth.uid() IS NOT NULL) OR
    (uploaded_by = auth.uid() AND auth.uid() IS NOT NULL) OR
    (EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
      AND auth.uid() IS NOT NULL
    ))
  );

-- Ensure the trigger function exists and works correctly
CREATE OR REPLACE FUNCTION set_uploaded_by()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set uploaded_by if it's not already set and we have an authenticated user
  IF NEW.uploaded_by IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.uploaded_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to ensure it's working
DROP TRIGGER IF EXISTS set_uploaded_by_trigger ON documents;
CREATE TRIGGER set_uploaded_by_trigger
  BEFORE INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION set_uploaded_by();