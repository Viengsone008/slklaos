/*
  # Fix Quotes Table RLS Policies

  1. Security
    - Drop restrictive INSERT policy
    - Create new policy allowing anonymous quote submissions
    - Ensure proper SELECT policy for authorized users
    - Add UPDATE and DELETE policies for authorized users
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "System can insert quotes" ON quotes;

-- Create a new policy that allows anonymous users to insert quotes
CREATE POLICY "Allow anonymous quote submissions"
  ON quotes
  FOR INSERT
  TO anon, public
  WITH CHECK (true);

-- Ensure the existing SELECT policy remains for authorized users only
-- (This should already exist based on your schema, but let's make sure)
DROP POLICY IF EXISTS "Authorized users can read quotes" ON quotes;

CREATE POLICY "Authorized users can read quotes"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE ((users.id)::text = (auth.uid())::text) 
      AND (users.role = ANY (ARRAY['admin'::text, 'manager'::text]))
    )
  );

-- Keep the existing UPDATE and DELETE policies restrictive
-- Only authorized users should be able to modify quotes
-- Note: Removed the "IF NOT EXISTS" clause which was causing the syntax error

-- First drop existing policies if they exist
DROP POLICY IF EXISTS "Authorized users can update quotes" ON quotes;
DROP POLICY IF EXISTS "Authorized users can delete quotes" ON quotes;

-- Then create new policies
CREATE POLICY "Authorized users can update quotes"
  ON quotes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE ((users.id)::text = (auth.uid())::text) 
      AND (users.role = ANY (ARRAY['admin'::text, 'manager'::text]))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users
      WHERE ((users.id)::text = (auth.uid())::text) 
      AND (users.role = ANY (ARRAY['admin'::text, 'manager'::text]))
    )
  );

CREATE POLICY "Authorized users can delete quotes"
  ON quotes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE ((users.id)::text = (auth.uid())::text) 
      AND (users.role = ANY (ARRAY['admin'::text, 'manager'::text]))
    )
  );