/*
  # Add Database Indexes for Performance Optimization

  1. New Indexes
    - Add indexes for frequently queried columns
    - Improve query performance for international users
    - Optimize common filter operations

  2. Benefits
    - Faster query execution
    - Reduced database load
    - Better performance for users in different regions
    - More efficient sorting and filtering
*/

-- Add indexes for posts table
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author);

-- Add indexes for contacts table
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);
CREATE INDEX IF NOT EXISTS idx_contacts_service ON contacts(service);
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_score ON contacts(lead_score);

-- Add indexes for quotes table
CREATE INDEX IF NOT EXISTS idx_quotes_email ON quotes(email);
CREATE INDEX IF NOT EXISTS idx_quotes_company ON quotes(company);
CREATE INDEX IF NOT EXISTS idx_quotes_project_type ON quotes(project_type);
CREATE INDEX IF NOT EXISTS idx_quotes_source ON quotes(source);
CREATE INDEX IF NOT EXISTS idx_quotes_lead_score ON quotes(lead_score);

-- Add indexes for projects table
CREATE INDEX IF NOT EXISTS idx_projects_client_name ON projects(client_name);
CREATE INDEX IF NOT EXISTS idx_projects_location ON projects(location);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);
CREATE INDEX IF NOT EXISTS idx_projects_end_date ON projects(end_date);
CREATE INDEX IF NOT EXISTS idx_projects_budget ON projects(budget);

-- Add indexes for tasks table
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_estimated_hours ON tasks(estimated_hours);

-- Add indexes for materials table
CREATE INDEX IF NOT EXISTS idx_materials_name ON materials(name);
CREATE INDEX IF NOT EXISTS idx_materials_supplier ON materials(supplier);
CREATE INDEX IF NOT EXISTS idx_materials_unit_price ON materials(unit_price);

-- Add indexes for documents table
CREATE INDEX IF NOT EXISTS idx_documents_title ON documents(title);
CREATE INDEX IF NOT EXISTS idx_documents_version ON documents(version);
CREATE INDEX IF NOT EXISTS idx_documents_is_confidential ON documents(is_confidential);

-- Add indexes for newsletter_subscribers table
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at ON newsletter_subscribers(subscribed_at);