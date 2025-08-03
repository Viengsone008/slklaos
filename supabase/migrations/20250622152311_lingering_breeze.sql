/*
  # Fix RLS Policy for Anonymous Quote Submissions

  1. Security Changes
    - Drop existing INSERT policy for quotes table
    - Create new INSERT policy that properly allows anonymous (public) users to submit quotes
    - Ensure the policy allows unauthenticated users to insert quote requests
    - Keep existing SELECT, UPDATE, DELETE policies intact

  2. Policy Details
    - Allow INSERT operations for 'public' role (includes both anonymous and authenticated users)
    - No qualification needed for INSERT (any public user can submit)
    - Simple 'true' check condition to allow all quote submissions
*/

-- Drop the existing INSERT policy if it exists
DROP POLICY IF EXISTS "Allow anonymous quote submissions" ON quotes;

-- Create a new INSERT policy that properly allows anonymous quote submissions
CREATE POLICY "Allow anonymous quote submissions"
  ON quotes
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Ensure RLS is enabled on the quotes table
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;