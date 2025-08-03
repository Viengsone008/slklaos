/*
  # Fix Newsletter Subscription RLS Policy

  1. Security Updates
    - Drop conflicting policies that might prevent public inserts
    - Create a clear policy for public newsletter subscriptions
    - Ensure authenticated users can also subscribe
    - Maintain admin access for management

  2. Changes
    - Remove restrictive policies that conflict with public access
    - Add explicit policy for anonymous newsletter subscriptions
    - Keep existing policies for authenticated operations
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can insert subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authorized users can insert subscribers" ON newsletter_subscribers;

-- Create a clear policy for public newsletter subscriptions
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users to subscribe as well
CREATE POLICY "Authenticated users can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Keep existing read/update/delete policies for authorized users
-- (These should remain as they are for admin management)