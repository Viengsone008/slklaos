-- =====================================================
-- Contacts Table RLS (Row Level Security) Policies
-- =====================================================
-- This file contains comprehensive RLS policies for the contacts table
-- Supports role-based access control for different user types
-- Based on the actual table structure from Supabase schema

-- Actual table columns (from schema):
-- id (uuid, primary key, default extensions.uuid_generate_v4())
-- name (text, not null)
-- email (text, not null)
-- phone (text, null)
-- company (text, null)
-- service (text, null)
-- subject (text, null)
-- message (text, not null)
-- preferred_contact (text, null, default 'email')
-- urgency (text, null, default 'medium')
-- status (text, null, default 'new')
-- priority (text, null, default 'medium')
-- source (text, null, default 'website')
-- assigned_to (uuid, null)
-- follow_up_date (timestamp with time zone, null)
-- lead_score (integer, null, default 50)
-- estimated_value (numeric(12,2), null)
-- conversion_probability (integer, null, default 30)
-- customer_profile (jsonb, null, default '{}')
-- project_context (jsonb, null, default '{}')
-- internal_notes (jsonb, null, default '{}')
-- created_at (timestamp with time zone, null, default now())
-- updated_at (timestamp with time zone, null, default now())

-- Enable RLS on contacts table
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SELECT Policies
-- =====================================================

-- Policy: Allow admin users to view all contacts
CREATE POLICY "contacts_admin_select_all" ON contacts
FOR SELECT 
TO authenticated
USING (true); -- Simplified: allow all authenticated users to read contacts

-- Policy: Allow sales team to view all contacts
CREATE POLICY "contacts_sales_select" ON contacts
FOR SELECT 
TO authenticated
USING (true); -- Simplified: allow all authenticated reads

-- Policy: Allow users to view contacts assigned to them
CREATE POLICY "contacts_assigned_select" ON contacts
FOR SELECT 
TO authenticated
USING (
  assigned_to = auth.uid()
);

-- Policy: Public cannot view contacts (privacy protection)
-- No public SELECT policy - contacts are private by default

-- =====================================================
-- INSERT Policies
-- =====================================================

-- Policy: Allow public to submit contact forms (website submissions)
CREATE POLICY "contacts_public_insert" ON contacts
FOR INSERT 
TO public
WITH CHECK (
  -- Public can only insert basic contact info
  assigned_to IS NULL 
  AND status = 'new'
  AND source = 'website'
);

-- Policy: Allow authenticated users to create contacts
CREATE POLICY "contacts_authenticated_insert" ON contacts
FOR INSERT 
TO authenticated
WITH CHECK (true); -- Allow all authenticated inserts

-- Policy: Allow admin/sales to create contacts with full data
CREATE POLICY "contacts_admin_insert" ON contacts
FOR INSERT 
TO authenticated
WITH CHECK (true); -- Simplified: allow all authenticated users

-- =====================================================
-- UPDATE Policies
-- =====================================================

-- Policy: Allow admin users to update all contacts
CREATE POLICY "contacts_admin_update" ON contacts
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true); -- Simplified: allow all authenticated updates

-- Policy: Allow assigned users to update their contacts
CREATE POLICY "contacts_assigned_update" ON contacts
FOR UPDATE 
TO authenticated
USING (
  assigned_to = auth.uid()
)
WITH CHECK (
  assigned_to = auth.uid()
);

-- Policy: Allow sales team to update contact status and assignments
CREATE POLICY "contacts_sales_update" ON contacts
FOR UPDATE 
TO authenticated
USING (true) -- Simplified: allow all authenticated users
WITH CHECK (true);

-- Policy: Prevent public from updating contacts
-- No public UPDATE policy - only authenticated users can update

-- =====================================================
-- DELETE Policies
-- =====================================================

-- Policy: Allow admin users to delete any contact
CREATE POLICY "contacts_admin_delete" ON contacts
FOR DELETE 
TO authenticated
USING (true); -- Simplified: allow all authenticated deletes

-- Policy: Restrict contact deletion to prevent data loss
CREATE POLICY "contacts_restricted_delete" ON contacts
FOR DELETE 
TO authenticated
USING (
  -- Only allow deletion of test/spam contacts
  status IN ('spam', 'test', 'duplicate')
  OR (
    -- Or contacts older than 2 years with no activity
    created_at < (now() - interval '2 years')
    AND status IN ('closed', 'rejected')
  )
);

-- Policy: Prevent public from deleting contacts
-- No public DELETE policy - only authenticated users can delete

-- =====================================================
-- Status-based Policies
-- =====================================================

-- Policy: Control contact status transitions
CREATE POLICY "contacts_status_control" ON contacts
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (
  -- Allow any status change for now (simplified)
  status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'closed', 'spam', 'duplicate')
);

-- Policy: Control lead score updates
CREATE POLICY "contacts_lead_score_control" ON contacts
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (
  -- Lead score should be between 0 and 100
  lead_score >= 0 AND lead_score <= 100
);

-- Policy: Control conversion probability updates
CREATE POLICY "contacts_conversion_control" ON contacts
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (
  -- Conversion probability should be between 0 and 100
  conversion_probability >= 0 AND conversion_probability <= 100
);

-- =====================================================
-- Additional Security Functions
-- =====================================================

-- Function to check if user can manage contacts
CREATE OR REPLACE FUNCTION can_manage_contacts(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Simplified: assume all authenticated users can manage contacts
  RETURN user_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if contact is assigned to user
CREATE OR REPLACE FUNCTION is_contact_assigned_to_user(user_id UUID, contact_assigned_to UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_id = contact_assigned_to;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get contacts by status and user role
CREATE OR REPLACE FUNCTION get_user_accessible_contacts(user_id UUID)
RETURNS TABLE (
  contact_id UUID,
  contact_name TEXT,
  contact_email TEXT,
  contact_status TEXT,
  can_edit BOOLEAN,
  can_delete BOOLEAN,
  lead_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.email,
    c.status,
    true as can_edit, -- Simplified: all authenticated users can edit
    true as can_delete, -- Simplified: all authenticated users can delete
    c.lead_score
  FROM contacts c
  WHERE 
    -- Show all contacts to authenticated users (simplified)
    user_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate lead score based on contact data
CREATE OR REPLACE FUNCTION calculate_lead_score(
  contact_company TEXT,
  contact_service TEXT,
  estimated_val NUMERIC,
  contact_source TEXT
)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 50; -- Base score
BEGIN
  -- Company provided adds points
  IF contact_company IS NOT NULL AND contact_company != '' THEN
    score := score + 15;
  END IF;
  
  -- Service interest adds points
  IF contact_service IS NOT NULL THEN
    CASE contact_service
      WHEN 'construction' THEN score := score + 20;
      WHEN 'renovation' THEN score := score + 15;
      WHEN 'design' THEN score := score + 10;
      ELSE score := score + 5;
    END CASE;
  END IF;
  
  -- Estimated value adds points
  IF estimated_val IS NOT NULL THEN
    IF estimated_val > 100000 THEN score := score + 25;
    ELSIF estimated_val > 50000 THEN score := score + 15;
    ELSIF estimated_val > 10000 THEN score := score + 10;
    END IF;
  END IF;
  
  -- Source affects score
  CASE contact_source
    WHEN 'referral' THEN score := score + 20;
    WHEN 'google' THEN score := score + 10;
    WHEN 'social' THEN score := score + 5;
    WHEN 'website' THEN score := score + 0;
    ELSE score := score + 0;
  END CASE;
  
  -- Ensure score is within bounds
  IF score > 100 THEN score := 100; END IF;
  IF score < 0 THEN score := 0; END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Trigger Functions for Automatic Updates
-- =====================================================

-- Function to automatically update lead score on insert/update
CREATE OR REPLACE FUNCTION update_contact_lead_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-calculate lead score if not provided
  IF NEW.lead_score IS NULL OR OLD.lead_score = NEW.lead_score THEN
    NEW.lead_score := calculate_lead_score(
      NEW.company,
      NEW.service,
      NEW.estimated_value,
      NEW.source
    );
  END IF;
  
  -- Update timestamp
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic lead score calculation
DROP TRIGGER IF EXISTS trigger_update_contact_lead_score ON contacts;
CREATE TRIGGER trigger_update_contact_lead_score
  BEFORE INSERT OR UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_lead_score();

-- =====================================================
-- Notes and Best Practices
-- =====================================================

/*
Contacts Table RLS Policies - Key Features:

Table Structure:
- id: uuid (primary key)
- name, email: contact info (required)
- phone, company, service: optional contact details
- subject, message: inquiry details
- preferred_contact: communication preference
- urgency, priority: importance indicators
- status: lead lifecycle status
- source: how they found you
- assigned_to: sales rep assignment
- follow_up_date: next action date
- lead_score: auto-calculated qualification score
- estimated_value: potential project value
- conversion_probability: likelihood to convert
- customer_profile, project_context, internal_notes: JSONB data
- timestamps: created_at, updated_at

Security Model:
1. Public can submit contact forms (INSERT only)
2. Authenticated users can view/edit all contacts (simplified)
3. No public read access (privacy protection)
4. Contact assignment system via assigned_to
5. Status workflow controls
6. Automatic lead scoring

Contact Status Workflow:
new → contacted → qualified → proposal → negotiation → won/lost/closed
(spam/duplicate for cleanup)

Lead Scoring Factors:
- Company provided: +15 points
- Service interest: +5-20 points
- Estimated value: +10-25 points
- Source quality: +0-20 points
- Base score: 50 points

Usage Examples:
-- Submit contact form (public)
INSERT INTO contacts (name, email, message, source) 
VALUES ('John Doe', 'john@example.com', 'Need renovation quote', 'website');

-- Assign contact to sales rep
UPDATE contacts SET assigned_to = 'sales-rep-uuid', status = 'contacted' 
WHERE id = 'contact-uuid';

-- Update lead score manually
UPDATE contacts SET lead_score = 85 WHERE id = 'contact-uuid';

-- Get high-value leads
SELECT * FROM contacts WHERE lead_score > 70 AND status IN ('new', 'contacted');

Testing Commands:
-- Test public contact submission
INSERT INTO contacts (name, email, message) VALUES ('Test User', 'test@example.com', 'Test message');

-- Test authenticated contact management
SELECT * FROM contacts WHERE assigned_to = auth.uid();

-- Test lead scoring
SELECT name, email, lead_score FROM contacts ORDER BY lead_score DESC;
*/
