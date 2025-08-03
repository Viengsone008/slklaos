/*
  # Fix newsletter subscribers permissions

  1. Security
    - Modify RLS policies to ensure public users can subscribe to the newsletter
    - Fix permission issues with newsletter_subscribers table
    - Ensure both authenticated and anonymous users can insert records

  2. Changes
    - Drop and recreate policies with proper permissions
    - Add explicit policy for public inserts
    - Ensure service role has full access
*/

-- First, drop any conflicting policies to start fresh
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Public can insert subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authorized users can insert subscribers" ON newsletter_subscribers;

-- Create a simple, permissive policy for public inserts
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create a policy for authenticated users to insert
CREATE POLICY "Authenticated users can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure admin users can manage subscribers
CREATE POLICY "Admins can manage subscribers"
  ON newsletter_subscribers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_active = true
    )
  );

-- Ensure service role has full access
CREATE POLICY "Service role can manage all subscribers"
  ON newsletter_subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);