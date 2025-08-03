/*
  # Fix Documents Table RLS Policy

  1. Security Updates
    - Drop existing restrictive INSERT policy for documents
    - Create new INSERT policy that allows authenticated users to insert documents
    - Update SELECT policy to be more permissive for authenticated users
    - Add UPDATE and DELETE policies for proper document management

  2. Policy Changes
    - Allow authenticated users to insert documents
    - Allow users to read documents they have access to based on confidentiality settings
    - Allow document owners and admins to update documents
    - Allow admins to delete documents

  This resolves the "new row violates row-level security policy" error when creating documents.
*/

-- Drop existing policies to recreate them with proper permissions
DROP POLICY IF EXISTS "Users can insert documents" ON documents;
DROP POLICY IF EXISTS "Users can read non-confidential documents" ON documents;

-- Create new INSERT policy that allows authenticated users to create documents
CREATE POLICY "Authenticated users can insert documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create new SELECT policy for reading documents
CREATE POLICY "Users can read accessible documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    -- Users can read non-confidential documents
    (is_confidential = false)
    OR
    -- Users can read documents they uploaded
    (uploaded_by = auth.uid())
    OR
    -- Admins and managers can read all documents
    (EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    ))
  );

-- Create UPDATE policy for documents
CREATE POLICY "Users can update own documents or admins can update all"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (
    -- Users can update documents they uploaded
    (uploaded_by = auth.uid())
    OR
    -- Admins and managers can update all documents
    (EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    ))
  )
  WITH CHECK (
    -- Same conditions for the updated data
    (uploaded_by = auth.uid())
    OR
    (EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
    ))
  );

-- Create DELETE policy for documents
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

-- Also add similar policies for public role to handle cases where auth might not be fully initialized
CREATE POLICY "Public can insert documents with auth check"
  ON documents
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public can read non-confidential documents"
  ON documents
  FOR SELECT
  TO public
  USING (
    (is_confidential = false AND auth.uid() IS NOT NULL)
    OR
    (uploaded_by = auth.uid() AND auth.uid() IS NOT NULL)
    OR
    (EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'manager')
      AND auth.uid() IS NOT NULL
    ))
  );