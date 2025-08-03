/*
  # Fix newsletter subscription RLS policies

  1. Security
    - Simplify RLS policies for newsletter_subscribers table
    - Create a permissive policy for public inserts
    - Ensure proper access control for admin management

  This migration addresses the error: "new row violates row-level security policy for table newsletter_subscribers"
  by creating a more permissive policy for public inserts.
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
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create a policy for authenticated users to subscribe
CREATE POLICY "Authenticated users can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO authenticated
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
  )
  WITH CHECK (
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