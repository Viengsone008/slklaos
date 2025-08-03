/*
  # Fix newsletter subscribers policy

  1. Changes
     - Add conditional check to only create the policy if it doesn't already exist
     - Ensure RLS is enabled on the newsletter_subscribers table
*/

-- First ensure RLS is enabled
ALTER TABLE IF EXISTS public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public users to subscribe (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'newsletter_subscribers' 
    AND policyname = 'Public can subscribe'
  ) THEN
    CREATE POLICY "Public can subscribe" 
      ON public.newsletter_subscribers
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END
$$;