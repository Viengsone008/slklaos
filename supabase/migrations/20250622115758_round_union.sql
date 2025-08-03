/*
  # Fix Documents RLS Policies

  1. Security Updates
    - Drop existing problematic INSERT policies
    - Create simplified INSERT policy for authenticated users
    - Ensure uploaded_by trigger function works correctly
    - Add policy for admins to bypass restrictions

  2. Changes
    - Simplified INSERT policies that work with the current authentication setup
    - Ensure the uploaded_by field is properly set via trigger
    - Allow authenticated users to insert documents
*/

-- Drop existing INSERT policies that might be causing issues
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON documents;
DROP POLICY IF EXISTS "Public can insert documents with system auth" ON documents;

-- Create a simple INSERT policy for authenticated users
CREATE POLICY "Authenticated users can create documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create INSERT policy for public with proper auth check
CREATE POLICY "Public can create documents when authenticated"
  ON documents
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() IS NOT NULL);

-- Ensure the uploaded_by trigger function exists and works correctly
CREATE OR REPLACE FUNCTION set_uploaded_by()
RETURNS TRIGGER AS $$
BEGIN
  -- Set uploaded_by to current user if not already set
  IF NEW.uploaded_by IS NULL THEN
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

-- Add a policy for service role to manage documents (for admin operations)
CREATE POLICY "Service role can manage all documents"
  ON documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);