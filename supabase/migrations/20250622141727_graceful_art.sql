/*
  # Fix Newsletter Subscribers RLS Policies

  1. Security Updates
    - Add policy for authenticated admin users to manage subscribers
    - Keep existing policy for public insertions (website subscriptions)
    - Add policy for authenticated users to update and delete subscribers

  This migration fixes the RLS policy violation that prevents admin users from creating subscribers.
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Public can insert subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authorized users can read subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Service role can manage subscribers" ON newsletter_subscribers;

-- Allow public (anonymous) users to insert subscribers (for website subscriptions)
CREATE POLICY "Public can insert subscribers"
  ON newsletter_subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated admin/manager users to read all subscribers
CREATE POLICY "Authorized users can read subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'manager')
      AND users.is_active = true
    )
  );

-- Allow authenticated admin/manager users to insert subscribers (manual entry)
CREATE POLICY "Authorized users can insert subscribers"
  ON newsletter_subscribers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'manager')
      AND users.is_active = true
    )
  );

-- Allow authenticated admin/manager users to update subscribers
CREATE POLICY "Authorized users can update subscribers"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'manager')
      AND users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'manager')
      AND users.is_active = true
    )
  );

-- Allow authenticated admin users to delete subscribers
CREATE POLICY "Authorized users can delete subscribers"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
      AND users.is_active = true
    )
  );

-- Keep service role policy for system operations
CREATE POLICY "Service role can manage subscribers"
  ON newsletter_subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);