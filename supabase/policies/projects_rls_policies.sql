-- =====================================================
-- Simplified Projects Table RLS Policies
-- =====================================================
-- This file contains simplified RLS policies for the projects table
-- Use this as an alternative to the complex policies if you're getting permission errors

-- Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "projects_public_select" ON projects;
DROP POLICY IF EXISTS "projects_authenticated_select" ON projects;
DROP POLICY IF EXISTS "projects_admin_select_all" ON projects;
DROP POLICY IF EXISTS "projects_manager_select" ON projects;
DROP POLICY IF EXISTS "projects_owner_select" ON projects;
DROP POLICY IF EXISTS "projects_admin_insert" ON projects;
DROP POLICY IF EXISTS "projects_manager_insert" ON projects;
DROP POLICY IF EXISTS "projects_pm_insert" ON projects;
DROP POLICY IF EXISTS "projects_admin_update" ON projects;
DROP POLICY IF EXISTS "projects_manager_update" ON projects;
DROP POLICY IF EXISTS "projects_owner_update" ON projects;
DROP POLICY IF EXISTS "projects_admin_delete" ON projects;
DROP POLICY IF EXISTS "projects_manager_delete" ON projects;
DROP POLICY IF EXISTS "projects_restricted_delete" ON projects;
DROP POLICY IF EXISTS "projects_status_control" ON projects;
DROP POLICY IF EXISTS "projects_publish_control" ON projects;

-- =====================================================
-- Simple SELECT Policies
-- =====================================================

-- Policy: Allow everyone to read all projects (for development/testing)
CREATE POLICY "projects_allow_all_select" ON projects
FOR SELECT 
USING (true); -- Allow all reads

-- =====================================================
-- Simple INSERT/UPDATE/DELETE Policies
-- =====================================================

-- Policy: Allow authenticated users to insert projects
CREATE POLICY "projects_allow_authenticated_insert" ON projects
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to update projects
CREATE POLICY "projects_allow_authenticated_update" ON projects
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users to delete projects
CREATE POLICY "projects_allow_authenticated_delete" ON projects
FOR DELETE 
TO authenticated
USING (true);

-- =====================================================
-- Notes
-- =====================================================

/*
These are simplified policies that should work without permission errors.
Once you have the basic functionality working, you can gradually add back
the more complex role-based restrictions.

These policies:
1. Allow anyone (public/authenticated) to read all projects
2. Allow authenticated users to perform all operations
3. Do not rely on auth.users table or JWT claims

To revert back to the complex policies, simply run the main projects_rls_policies.sql file.
*/
