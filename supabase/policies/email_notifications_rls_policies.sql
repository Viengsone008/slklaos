-- =====================================================
-- Email Notifications Table RLS (Row Level Security) Policies
-- =====================================================
-- Simple RLS policies for the email_notifications table
-- Based on the actual table structure from Supabase schema

-- Actual table columns (from schema):
-- id (uuid, primary key, default gen_random_uuid())
-- post_id (text, not null)
-- recipient_count (integer, not null, default 0)
-- status (text, not null, default 'pending')
-- content (jsonb, null, default '{}')
-- success_count (integer, null, default 0)
-- error_count (integer, null, default 0)
-- created_at (timestamp with time zone, null, default now())
-- completed_at (timestamp with time zone, null)
-- updated_at (timestamp with time zone, null, default now())

-- Status constraints: 'pending', 'completed', 'failed'

-- Enable RLS on email_notifications table
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "email_notifications_authenticated_select" ON email_notifications;
DROP POLICY IF EXISTS "email_notifications_authenticated_insert" ON email_notifications;
DROP POLICY IF EXISTS "email_notifications_authenticated_update" ON email_notifications;
DROP POLICY IF EXISTS "email_notifications_authenticated_delete" ON email_notifications;

-- =====================================================
-- Simple SELECT Policies
-- =====================================================

-- Policy: Allow authenticated users to view all email notifications
CREATE POLICY "email_notifications_authenticated_select" ON email_notifications
FOR SELECT 
TO authenticated
USING (true); -- Allow all authenticated reads

-- =====================================================
-- Simple INSERT Policies
-- =====================================================

-- Policy: Allow authenticated users to create email notifications
CREATE POLICY "email_notifications_authenticated_insert" ON email_notifications
FOR INSERT 
TO authenticated
WITH CHECK (
  post_id IS NOT NULL 
  AND LENGTH(TRIM(post_id)) > 0 -- Ensure post_id is not empty
  AND status IN ('pending', 'completed', 'failed') -- Valid status
  AND recipient_count >= 0 -- Non-negative recipient count
  AND success_count >= 0 -- Non-negative success count
  AND error_count >= 0 -- Non-negative error count
);

-- =====================================================
-- Simple UPDATE Policies
-- =====================================================

-- Policy: Allow authenticated users to update email notifications
CREATE POLICY "email_notifications_authenticated_update" ON email_notifications
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (
  post_id IS NOT NULL 
  AND LENGTH(TRIM(post_id)) > 0 -- Ensure post_id is not empty
  AND status IN ('pending', 'completed', 'failed') -- Valid status
  AND recipient_count >= 0 -- Non-negative recipient count
  AND success_count >= 0 -- Non-negative success count
  AND error_count >= 0 -- Non-negative error count
);

-- =====================================================
-- Simple DELETE Policies
-- =====================================================

-- Policy: Allow authenticated users to delete email notifications
CREATE POLICY "email_notifications_authenticated_delete" ON email_notifications
FOR DELETE 
TO authenticated
USING (true); -- Allow all authenticated deletes

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  -- Set completed_at when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at timestamp
DROP TRIGGER IF EXISTS trigger_update_email_notifications_updated_at ON email_notifications;
CREATE TRIGGER trigger_update_email_notifications_updated_at
  BEFORE UPDATE ON email_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_email_notifications_updated_at();

-- Function to validate email notification data
CREATE OR REPLACE FUNCTION validate_email_notification_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure success_count + error_count doesn't exceed recipient_count
  IF (NEW.success_count + NEW.error_count) > NEW.recipient_count THEN
    RAISE EXCEPTION 'Success count plus error count cannot exceed recipient count';
  END IF;
  
  -- Ensure status is consistent with completion
  IF NEW.status = 'completed' AND NEW.completed_at IS NULL THEN
    NEW.completed_at = now();
  END IF;
  
  -- If all recipients processed, status should be completed
  IF (NEW.success_count + NEW.error_count) = NEW.recipient_count AND NEW.recipient_count > 0 THEN
    NEW.status = 'completed';
    IF NEW.completed_at IS NULL THEN
      NEW.completed_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for data validation
DROP TRIGGER IF EXISTS trigger_validate_email_notification_data ON email_notifications;
CREATE TRIGGER trigger_validate_email_notification_data
  BEFORE INSERT OR UPDATE ON email_notifications
  FOR EACH ROW
  EXECUTE FUNCTION validate_email_notification_data();

-- =====================================================
-- Notes and Usage Examples
-- =====================================================

/*
Simple Email Notifications Table RLS Policies:

Table Structure:
- id: uuid (primary key, auto-generated)
- post_id: reference to the post being sent (required)
- recipient_count: total number of recipients (default: 0)
- status: notification status ('pending', 'completed', 'failed')
- content: JSONB content of the email
- success_count: number of successful deliveries (default: 0)
- error_count: number of failed deliveries (default: 0)
- created_at: when notification was created
- completed_at: when notification was completed
- updated_at: last update timestamp

Security Model:
1. Only authenticated users can access email notifications
2. No public access (sensitive notification data)
3. All authenticated users can view, create, update, and delete
4. Data validation ensures consistency
5. Automatic timestamp management

Usage Examples:

-- Create a new email notification (authenticated)
INSERT INTO email_notifications (post_id, recipient_count, content)
VALUES ('blog-post-123', 100, '{"subject": "New Blog Post", "template": "newsletter"}');

-- Update notification progress (authenticated)
UPDATE email_notifications 
SET success_count = 85, error_count = 5, status = 'completed'
WHERE id = 'notification-uuid';

-- Get pending notifications (authenticated)
SELECT * FROM email_notifications 
WHERE status = 'pending'
ORDER BY created_at;

-- Get notification statistics (authenticated)
SELECT 
  status,
  COUNT(*) as count,
  AVG(success_count) as avg_success,
  AVG(error_count) as avg_errors
FROM email_notifications
GROUP BY status;

-- Get recent notifications with success rate (authenticated)
SELECT 
  id,
  post_id,
  status,
  recipient_count,
  success_count,
  error_count,
  CASE 
    WHEN recipient_count > 0 
    THEN ROUND((success_count::decimal / recipient_count) * 100, 2)
    ELSE 0 
  END as success_rate_percent,
  created_at,
  completed_at
FROM email_notifications
ORDER BY created_at DESC
LIMIT 10;

Status Workflow:
- 'pending': notification queued for sending
- 'completed': all recipients processed
- 'failed': notification failed to process

Key Features:
- Authenticated-only access for security
- Data validation ensures count consistency
- Automatic status updates when processing completes
- Success rate tracking
- Automatic timestamp management
- JSONB content storage for flexible email data
*/
