/*
  # Add social sharing and email notification tables
  
  1. New Tables
    - `social_shares` - Tracks social media sharing of posts
    - `email_notifications` - Tracks email notifications sent for posts
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users and service role
    
  3. Constraints
    - Add check constraints for status and platform values
    
  4. Indexes
    - Add indexes for common query fields
*/

-- Create social_shares table
CREATE TABLE IF NOT EXISTS social_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id text NOT NULL,
  platform text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  content jsonb DEFAULT '{}'::jsonb,
  platform_post_id text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Add status check constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'social_shares_status_check'
  ) THEN
    ALTER TABLE social_shares 
    ADD CONSTRAINT social_shares_status_check 
    CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text]));
  END IF;
END $$;

-- Add platform check constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'social_shares_platform_check'
  ) THEN
    ALTER TABLE social_shares 
    ADD CONSTRAINT social_shares_platform_check 
    CHECK (platform = ANY (ARRAY['facebook'::text, 'instagram'::text, 'linkedin'::text, 'twitter'::text]));
  END IF;
END $$;

-- Create email_notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id text NOT NULL,
  recipient_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  content jsonb DEFAULT '{}'::jsonb,
  success_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Add status check constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'email_notifications_status_check'
  ) THEN
    ALTER TABLE email_notifications 
    ADD CONSTRAINT email_notifications_status_check 
    CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text]));
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for social_shares
CREATE POLICY "Authorized users can read social shares"
  ON social_shares
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE ((users.id)::text = (auth.uid())::text) 
      AND (users.role = ANY (ARRAY['admin'::text, 'manager'::text]))
    )
  );

CREATE POLICY "Service role can manage social shares"
  ON social_shares
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policies for email_notifications
CREATE POLICY "Authorized users can read email notifications"
  ON email_notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE ((users.id)::text = (auth.uid())::text) 
      AND (users.role = ANY (ARRAY['admin'::text, 'manager'::text]))
    )
  );

CREATE POLICY "Service role can manage email notifications"
  ON email_notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_social_shares_post_id ON social_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_platform ON social_shares(platform);
CREATE INDEX IF NOT EXISTS idx_social_shares_status ON social_shares(status);

CREATE INDEX IF NOT EXISTS idx_email_notifications_post_id ON email_notifications(post_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);