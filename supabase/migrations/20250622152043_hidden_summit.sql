/*
  # Fix RLS policies for contacts table

  1. Security
    - Enable RLS on contacts table
    - Add policy for anonymous users to insert contacts
    - Ensure only authorized users can read contacts
  
  This migration fixes the Row Level Security (RLS) policies for the contacts table
  to allow anonymous users to submit contact forms from the public website.
*/

-- First ensure RLS is enabled
ALTER TABLE IF EXISTS public.contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "System can insert contacts" ON contacts;

-- Create policy to allow public users to insert contacts
CREATE POLICY "Allow anonymous contact submissions"
  ON contacts
  FOR INSERT
  TO anon, public
  WITH CHECK (true);

-- Ensure the existing SELECT policy remains for authorized users only
DROP POLICY IF EXISTS "Authorized users can read contacts" ON contacts;

CREATE POLICY "Authorized users can read contacts"
  ON contacts
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