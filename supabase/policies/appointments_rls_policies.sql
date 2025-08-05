-- =====================================================
-- Appointments Table RLS (Row Level Security) Policies
-- =====================================================
-- Simple RLS policies for the appointments table
-- Based on the actual table structure from Supabase schema

-- Actual table columns (from schema):
-- id (uuid, primary key, default gen_random_uuid())
-- date (date, not null)
-- time (time without time zone, not null)
-- candidate_name (text, null)
-- candidate_email (text, null)
-- status (text, null, default 'pending')
-- created_at (timestamp with time zone, null, default now())
-- updated_at (timestamp with time zone, null, default now())

-- Enable RLS on appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "appointments_public_select" ON appointments;
DROP POLICY IF EXISTS "appointments_authenticated_select" ON appointments;
DROP POLICY IF EXISTS "appointments_public_insert" ON appointments;
DROP POLICY IF EXISTS "appointments_authenticated_insert" ON appointments;
DROP POLICY IF EXISTS "appointments_authenticated_update" ON appointments;
DROP POLICY IF EXISTS "appointments_authenticated_delete" ON appointments;

-- =====================================================
-- Simple SELECT Policies
-- =====================================================

-- Policy: Allow authenticated users to view all appointments
CREATE POLICY "appointments_authenticated_select" ON appointments
FOR SELECT 
TO authenticated
USING (true); -- Allow all authenticated users to read appointments

-- =====================================================
-- Simple INSERT Policies
-- =====================================================

-- Policy: Allow public to book appointments (for website booking)
CREATE POLICY "appointments_public_insert" ON appointments
FOR INSERT 
TO public
WITH CHECK (
  -- Public can only create pending appointments with basic info
  status = 'pending'
  AND candidate_name IS NOT NULL
  AND candidate_email IS NOT NULL
  AND date IS NOT NULL
  AND time IS NOT NULL
);

-- Policy: Allow authenticated users to create appointments
CREATE POLICY "appointments_authenticated_insert" ON appointments
FOR INSERT 
TO authenticated
WITH CHECK (true); -- Allow all authenticated inserts

-- =====================================================
-- Simple UPDATE Policies
-- =====================================================

-- Policy: Allow authenticated users to update appointments
CREATE POLICY "appointments_authenticated_update" ON appointments
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (
  -- Ensure status is valid
  status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')
);

-- =====================================================
-- Simple DELETE Policies
-- =====================================================

-- Policy: Allow authenticated users to delete appointments
CREATE POLICY "appointments_authenticated_delete" ON appointments
FOR DELETE 
TO authenticated
USING (true); -- Allow all authenticated deletes

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at timestamp
DROP TRIGGER IF EXISTS trigger_update_appointments_updated_at ON appointments;
CREATE TRIGGER trigger_update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();

-- =====================================================
-- Notes and Usage Examples
-- =====================================================

/*
Simple Appointments Table RLS Policies:

Table Structure:
- id: uuid (primary key, auto-generated)
- date: appointment date (required)
- time: appointment time (required)
- candidate_name: person booking appointment
- candidate_email: contact email
- status: appointment status (pending, confirmed, completed, cancelled, rescheduled)
- created_at, updated_at: timestamps

Security Model:
1. Public can book appointments (INSERT only) - perfect for website booking forms
2. Authenticated users can view, update, and delete all appointments
3. Status validation on updates
4. Automatic timestamp updates

Usage Examples:

-- Book an appointment (public - from website)
INSERT INTO appointments (date, time, candidate_name, candidate_email, status)
VALUES ('2025-08-15', '14:00:00', 'John Doe', 'john@example.com', 'pending');

-- Confirm an appointment (authenticated)
UPDATE appointments 
SET status = 'confirmed' 
WHERE id = 'appointment-uuid';

-- Get all pending appointments (authenticated)
SELECT * FROM appointments 
WHERE status = 'pending' 
ORDER BY date, time;

-- Cancel an appointment (authenticated)
UPDATE appointments 
SET status = 'cancelled' 
WHERE id = 'appointment-uuid';

-- Get appointments for a specific date (authenticated)
SELECT * FROM appointments 
WHERE date = '2025-08-15' 
ORDER BY time;

Valid Status Values:
- 'pending': newly booked appointment
- 'confirmed': appointment confirmed by admin
- 'completed': appointment finished
- 'cancelled': appointment cancelled
- 'rescheduled': appointment moved to different time
*/
