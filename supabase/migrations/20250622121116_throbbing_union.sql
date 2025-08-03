/*
  # Fix RLS policies for documents table

  1. Security
    - Drop existing problematic policies
    - Create new policies with proper authentication checks
    - Add service role policy for system operations
    - Fix uploaded_by trigger function
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Authenticated users can create documents" ON documents;
DROP POLICY IF EXISTS "Allow authenticated users to create documents" ON documents;
DROP POLICY IF EXISTS "Allow public to create documents with auth" ON documents;
DROP POLICY IF EXISTS "Public can create documents when authenticated" ON documents;
DROP POLICY IF EXISTS "Public can insert documents with system auth" ON documents;
DROP POLICY IF EXISTS "Users can read accessible documents" ON documents;
DROP POLICY IF EXISTS "Public can read non-confidential documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents or admins can update all" ON documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON documents;
DROP POLICY IF EXISTS "Service role can manage documents" ON documents;
DROP POLICY IF EXISTS "Service role can manage all documents" ON documents;

-- Create new, simplified policies

-- Service role can do anything (for admin operations)
CREATE POLICY "Service role can manage all documents"
  ON documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to create documents
CREATE POLICY "Allow authenticated users to create documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to read documents based on permissions
CREATE POLICY "Authenticated users can read documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    -- Non-confidential documents are visible to all authenticated users
    (is_confidential = false)
    OR
    -- Users can see their own documents
    (uploaded_by = auth.uid())
    OR
    -- Admins and managers can see all documents
    (EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    ))
  );

-- Allow users to update their own documents, admins can update any
CREATE POLICY "Users can update own documents or admins can update all"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (
    (uploaded_by = auth.uid())
    OR
    (EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    ))
  )
  WITH CHECK (
    (uploaded_by = auth.uid())
    OR
    (EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    ))
  );

-- Only admins can delete documents
CREATE POLICY "Admins can delete documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Fix the trigger function to set uploaded_by correctly
CREATE OR REPLACE FUNCTION set_uploaded_by()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set uploaded_by if it's not already set
  IF NEW.uploaded_by IS NULL THEN
    NEW.uploaded_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS set_uploaded_by_trigger ON documents;
CREATE TRIGGER set_uploaded_by_trigger
  BEFORE INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION set_uploaded_by();