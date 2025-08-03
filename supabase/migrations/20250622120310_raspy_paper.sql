/*
  # Fix User Creation RLS Policy

  1. Security Updates
    - Add policy for authenticated admins to create users
    - Ensure proper role checking for user management
    - Allow user creation by admin users from the users table

  2. Changes
    - Add new policy for user creation by admins
    - Update existing policies to be more specific
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "JWT admins can manage users" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;

-- Create comprehensive policies for user management

-- Allow service role to manage all users (for system operations)
CREATE POLICY "Service role can manage all users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read their own profile
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Allow admin users (from users table) to read all users
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
      AND users.is_active = true
    )
  );

-- Allow admin users (from users table) to create new users
CREATE POLICY "Admins can create users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
      AND users.is_active = true
    )
  );

-- Allow admin users (from users table) to update users
CREATE POLICY "Admins can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
      AND users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
      AND users.is_active = true
    )
  );

-- Allow admin users (from users table) to delete users
CREATE POLICY "Admins can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
      AND users.is_active = true
    )
  );

-- Also allow JWT-based admin access (for cases where role is in JWT metadata)
CREATE POLICY "JWT admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );