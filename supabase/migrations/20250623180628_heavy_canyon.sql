/*
  # Add Dashboard Stats Function for Performance Optimization

  1. New Function
    - `get_dashboard_stats` - Efficiently calculates dashboard statistics in a single database call
    - Reduces multiple round-trips to the database
    - Improves performance for international users

  2. Benefits
    - Single database call instead of 8+ separate queries
    - Reduces network latency for international users
    - More efficient counting mechanism
    - Better caching potential
*/

-- Create a function to get all dashboard stats in a single call
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_projects integer;
  active_projects integer;
  total_tasks integer;
  completed_tasks integer;
  total_contacts integer;
  new_contacts integer;
  total_quotes integer;
  pending_quotes integer;
  result json;
BEGIN
  -- Get project counts
  SELECT 
    COUNT(*) FILTER (WHERE true),
    COUNT(*) FILTER (WHERE status = 'in_progress')
  INTO 
    total_projects,
    active_projects
  FROM projects;

  -- Get task counts
  SELECT 
    COUNT(*) FILTER (WHERE true),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO 
    total_tasks,
    completed_tasks
  FROM tasks;

  -- Get contact counts
  SELECT 
    COUNT(*) FILTER (WHERE true),
    COUNT(*) FILTER (WHERE status = 'new')
  INTO 
    total_contacts,
    new_contacts
  FROM contacts;

  -- Get quote counts
  SELECT 
    COUNT(*) FILTER (WHERE true),
    COUNT(*) FILTER (WHERE status = 'new')
  INTO 
    total_quotes,
    pending_quotes
  FROM quotes;

  -- Construct the result JSON
  result := json_build_object(
    'totalProjects', total_projects,
    'activeProjects', active_projects,
    'totalTasks', total_tasks,
    'completedTasks', completed_tasks,
    'totalContacts', total_contacts,
    'newContacts', new_contacts,
    'totalQuotes', total_quotes,
    'pendingQuotes', pending_quotes
  );

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO service_role;