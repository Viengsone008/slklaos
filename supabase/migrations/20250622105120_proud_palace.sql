/*
  # Fix Users Table RLS Policy Recursion

  1. Security Changes
    - Drop existing recursive policies on users table
    - Create new policies using auth.jwt() to avoid recursion
    - Maintain same access control but without circular dependencies

  2. Policy Updates
    - Users can read their own profile
    - Admins can manage all users
    - Use proper JWT claim extraction syntax
*/

-- Temporarily disable RLS to fix the policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create new policies without recursion issues
-- Policy for users to read their own profile (no recursion)
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Policy for admins to read all users (using auth.jwt() to avoid recursion)
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role'),
      'employee'
    ) = 'admin'
  );

-- Policy for admins to insert users (using auth.jwt() to avoid recursion)
CREATE POLICY "Admins can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role'),
      'employee'
    ) = 'admin'
  );

-- Policy for admins to update users (using auth.jwt() to avoid recursion)
CREATE POLICY "Admins can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role'),
      'employee'
    ) = 'admin'
  );