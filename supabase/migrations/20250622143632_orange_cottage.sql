/*
  # Fix newsletter subscribers RLS policies

  1. Changes
    - Drop all existing policies on newsletter_subscribers table
    - Create a single, simple policy for public inserts
    - Maintain admin management policies
    - Ensure service role has full access

  This migration fixes the row-level security issue that prevents public users
  from subscribing to the newsletter.
*/

-- First, drop all existing policies on the newsletter_subscribers table to avoid conflicts
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Public can insert subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authorized users can insert subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authorized users can read subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authorized users can update subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authorized users can delete subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can manage subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Service role can manage subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Service role can manage all subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "JWT admins can manage users" ON newsletter_subscribers;

-- Create a simple, permissive policy for public inserts with no restrictions
CREATE POLICY "Public can subscribe"
  ON newsletter_subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authorized users to read subscribers
CREATE POLICY "Authorized users can read subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE ((users.id)::text = (auth.uid())::text) 
      AND (users.role = ANY (ARRAY['admin'::text, 'manager'::text]))
      AND (users.is_active = true)
    )
  );

-- Allow authorized users to update subscribers
CREATE POLICY "Authorized users can update subscribers"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE ((users.id)::text = (auth.uid())::text) 
      AND (users.role = ANY (ARRAY['admin'::text, 'manager'::text]))
      AND (users.is_active = true)
    )
  );

-- Allow authorized users to delete subscribers
CREATE POLICY "Authorized users can delete subscribers"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE ((users.id)::text = (auth.uid())::text) 
      AND (users.role = 'admin'::text)
      AND (users.is_active = true)
    )
  );

-- Ensure service role has full access
CREATE POLICY "Service role can manage all subscribers"
  ON newsletter_subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);