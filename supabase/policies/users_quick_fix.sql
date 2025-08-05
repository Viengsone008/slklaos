-- =====================================================
-- QUICK FIX: Ultra-Simple Users RLS Policies
-- =====================================================
-- Run this to immediately fix the infinite recursion error

-- Drop all existing policies to clean slate
DROP POLICY IF EXISTS "users_admin_select_all" ON users;
DROP POLICY IF EXISTS "users_self_select" ON users;
DROP POLICY IF EXISTS "users_manager_select" ON users;
DROP POLICY IF EXISTS "users_authenticated_select" ON users;
DROP POLICY IF EXISTS "users_admin_insert" ON users;
DROP POLICY IF EXISTS "users_authenticated_insert" ON users;
DROP POLICY IF EXISTS "users_admin_update" ON users;
DROP POLICY IF EXISTS "users_self_update" ON users;
DROP POLICY IF EXISTS "users_manager_update" ON users;
DROP POLICY IF EXISTS "users_authenticated_update" ON users;
DROP POLICY IF EXISTS "users_admin_delete" ON users;
DROP POLICY IF EXISTS "users_restrict_delete" ON users;
DROP POLICY IF EXISTS "users_authenticated_delete" ON users;

-- Create ultra-simple policies with NO recursion
CREATE POLICY "enable_read_access_for_all_users" ON users FOR SELECT USING (true);
CREATE POLICY "enable_insert_for_authenticated_users" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "enable_update_for_authenticated_users" ON users FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "enable_delete_for_authenticated_users" ON users FOR DELETE TO authenticated USING (true);

-- Drop any recursive functions
DROP FUNCTION IF EXISTS user_has_role(UUID, TEXT);
DROP FUNCTION IF EXISTS can_manage_user(UUID, UUID);
DROP FUNCTION IF EXISTS get_accessible_users(UUID);
