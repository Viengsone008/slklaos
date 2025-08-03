/*
  # Fix Quotes RLS Policies

  1. Changes
    - Checks if policies exist before creating them
    - Ensures RLS is enabled on quotes table
    - Maintains proper access control for quotes table
*/

-- First ensure RLS is enabled
ALTER TABLE IF EXISTS public.quotes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "System can insert quotes" ON quotes;
DROP POLICY IF EXISTS "Allow anonymous quote submissions" ON quotes;
DROP POLICY IF EXISTS "Authorized users can read quotes" ON quotes;
DROP POLICY IF EXISTS "Authorized users can update quotes" ON quotes;
DROP POLICY IF EXISTS "Authorized users can delete quotes" ON quotes;

-- Create policies with proper checks to avoid duplicates
DO $$
BEGIN
  -- Create INSERT policy for anonymous users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'quotes' 
    AND policyname = 'Allow anonymous quote submissions'
  ) THEN
    CREATE POLICY "Allow anonymous quote submissions"
      ON quotes
      FOR INSERT
      TO anon, public
      WITH CHECK (true);
  END IF;

  -- Create SELECT policy for authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'quotes' 
    AND policyname = 'Authorized users can read quotes'
  ) THEN
    CREATE POLICY "Authorized users can read quotes"
      ON quotes
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM users
          WHERE ((users.id)::text = (auth.uid())::text) 
          AND (users.role = ANY (ARRAY['admin'::text, 'manager'::text]))
        )
      );
  END IF;

  -- Create UPDATE policy for authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'quotes' 
    AND policyname = 'Authorized users can update quotes'
  ) THEN
    CREATE POLICY "Authorized users can update quotes"
      ON quotes
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM users
          WHERE ((users.id)::text = (auth.uid())::text) 
          AND (users.role = ANY (ARRAY['admin'::text, 'manager'::text]))
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM users
          WHERE ((users.id)::text = (auth.uid())::text) 
          AND (users.role = ANY (ARRAY['admin'::text, 'manager'::text]))
        )
      );
  END IF;

  -- Create DELETE policy for authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'quotes' 
    AND policyname = 'Authorized users can delete quotes'
  ) THEN
    CREATE POLICY "Authorized users can delete quotes"
      ON quotes
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM users
          WHERE ((users.id)::text = (auth.uid())::text) 
          AND (users.role = ANY (ARRAY['admin'::text, 'manager'::text]))
        )
      );
  END IF;
END $$;