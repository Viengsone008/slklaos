/*
  # Fix Documents RLS Policies

  1. Security Changes
    - Drop existing problematic INSERT policies for documents table
    - Create new, more permissive INSERT policies that work with authentication
    - Add service role policy for admin operations
    - Add trigger to automatically set uploaded_by field

  2. Changes Made
    - Replace uid() with auth.uid() throughout
    - More permissive policies for authenticated operations
    - Automatic uploaded_by field setting via trigger
    - Better handling for system operations
*/

-- Drop existing problematic INSERT policies
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON documents;
DROP POLICY IF EXISTS "Public can insert documents with auth check" ON documents;

-- Create new, more permissive INSERT policies
CREATE POLICY "Authenticated users can insert documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Public can insert documents with system auth"
  ON documents
  FOR INSERT
  TO public
  WITH CHECK (
    -- Allow if user is authenticated (has a valid auth.uid)
    (auth.uid() IS NOT NULL) OR
    -- Allow system operations (when no auth context but valid data)
    (uploaded_by IS NOT NULL)
  );

-- Add service role policy for admin operations
CREATE POLICY "Service role can manage documents"
  ON documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Update existing SELECT policies to use auth.uid() instead of uid()
DROP POLICY IF EXISTS "Public can read non-confidential documents" ON documents;
DROP POLICY IF EXISTS "Users can read accessible documents" ON documents;

CREATE POLICY "Public can read non-confidential documents"
  ON documents
  FOR SELECT
  TO public
  USING (
    ((is_confidential = false) AND (auth.uid() IS NOT NULL)) OR 
    ((uploaded_by = auth.uid()) AND (auth.uid() IS NOT NULL)) OR 
    (EXISTS ( SELECT 1
       FROM users
      WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'manager'::text])) AND (auth.uid() IS NOT NULL))))
  );

CREATE POLICY "Users can read accessible documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    (is_confidential = false) OR 
    (uploaded_by = auth.uid()) OR 
    (EXISTS ( SELECT 1
       FROM users
      WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'manager'::text])))))
  );

-- Update existing UPDATE policy to use auth.uid()
DROP POLICY IF EXISTS "Users can update own documents or admins can update all" ON documents;

CREATE POLICY "Users can update own documents or admins can update all"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (
    (uploaded_by = auth.uid()) OR 
    (EXISTS ( SELECT 1
       FROM users
      WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'manager'::text])))))
  )
  WITH CHECK (
    (uploaded_by = auth.uid()) OR 
    (EXISTS ( SELECT 1
       FROM users
      WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['admin'::text, 'manager'::text])))))
  );

-- Update existing DELETE policy to use auth.uid()
DROP POLICY IF EXISTS "Admins can delete documents" ON documents;

CREATE POLICY "Admins can delete documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS ( SELECT 1
       FROM users
      WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))
  );

-- Create function and trigger to automatically set uploaded_by
DO $$
BEGIN
  -- Add a trigger to automatically set uploaded_by if not provided and user is authenticated
  CREATE OR REPLACE FUNCTION set_uploaded_by()
  RETURNS TRIGGER AS $func$
  BEGIN
    -- If uploaded_by is not set and we have an authenticated user, set it
    IF NEW.uploaded_by IS NULL AND auth.uid() IS NOT NULL THEN
      NEW.uploaded_by := auth.uid();
    END IF;
    RETURN NEW;
  END;
  $func$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Drop trigger if it exists and recreate
  DROP TRIGGER IF EXISTS set_uploaded_by_trigger ON documents;
  
  CREATE TRIGGER set_uploaded_by_trigger
    BEFORE INSERT ON documents
    FOR EACH ROW
    EXECUTE FUNCTION set_uploaded_by();
END $$;