/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Current policies create infinite recursion by querying the users table within user policies
    - The jwt() function calls are causing circular dependencies

  2. Solution
    - Remove problematic policies that cause recursion
    - Create simpler policies that don't reference the users table from within user policies
    - Use auth.uid() and auth.jwt() more carefully to avoid circular references

  3. Changes
    - Drop existing problematic policies
    - Create new policies that avoid recursion
    - Ensure users can still access their own data and admins can manage users
*/

-- Drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;

-- Create new policies that avoid recursion
-- Policy for users to read their own profile (no recursion)
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Policy for admin operations using JWT claims directly (no table lookup)
CREATE POLICY "Service role can manage users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy for authenticated users with admin role in JWT
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

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;