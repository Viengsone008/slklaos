/*
  # Initial Database Schema for SLK Trading & Design Construction

  1. New Tables
    - `users` - User management for admin, employee, manager roles
    - `projects` - Construction projects tracking
    - `tasks` - Task management for projects
    - `materials` - Inventory and materials management
    - `documents` - Document storage and management
    - `contacts` - Contact form submissions and leads
    - `quotes` - Quote requests and estimates
    - `posts` - Blog posts and news articles
    - `settings` - Application settings and configuration

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each user role
    - Secure access based on user authentication

  3. Features
    - UUID primary keys for all tables
    - Timestamps for audit trails
    - JSON fields for flexible data storage
    - Proper indexing for performance
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for multi-role authentication
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'employee', 'manager')),
  login_type text NOT NULL CHECK (login_type IN ('admin', 'employee', 'manager')),
  department text,
  position text,
  permissions jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'on_hold', 'cancelled')),
  start_date date,
  end_date date,
  budget numeric(12,2),
  spent numeric(12,2) DEFAULT 0,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  location text,
  manager_id uuid REFERENCES users(id),
  client_name text,
  client_email text,
  client_phone text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid REFERENCES users(id),
  assigned_by uuid REFERENCES users(id),
  project_id uuid REFERENCES projects(id),
  due_date timestamptz,
  estimated_hours numeric(5,2),
  actual_hours numeric(5,2),
  category text,
  tags text[] DEFAULT ARRAY[]::text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Materials table for inventory management
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  supplier text,
  sku text UNIQUE,
  quantity numeric(10,2) DEFAULT 0,
  unit text NOT NULL,
  unit_price numeric(10,2),
  total_value numeric(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  location text,
  status text DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock', 'discontinued')),
  reorder_level numeric(10,2) DEFAULT 0,
  last_ordered date,
  expiry_date date,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  type text NOT NULL,
  category text,
  project_id uuid REFERENCES projects(id),
  file_url text,
  file_size text,
  file_format text,
  version text DEFAULT '1.0',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'archived')),
  uploaded_by uuid REFERENCES users(id),
  approved_by uuid REFERENCES users(id),
  tags text[] DEFAULT ARRAY[]::text[],
  is_confidential boolean DEFAULT false,
  expiry_date date,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contacts table for lead management
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  service text,
  subject text,
  message text NOT NULL,
  preferred_contact text DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'both')),
  urgency text DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  source text DEFAULT 'website',
  assigned_to uuid REFERENCES users(id),
  follow_up_date timestamptz,
  lead_score integer DEFAULT 50 CHECK (lead_score >= 0 AND lead_score <= 100),
  estimated_value numeric(12,2),
  conversion_probability integer DEFAULT 30 CHECK (conversion_probability >= 0 AND conversion_probability <= 100),
  customer_profile jsonb DEFAULT '{}'::jsonb,
  project_context jsonb DEFAULT '{}'::jsonb,
  internal_notes jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  project_type text,
  budget_range text,
  timeline text,
  location text,
  description text,
  preferred_contact text DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'both')),
  status text DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'quoted', 'accepted', 'rejected')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  source text DEFAULT 'website',
  estimated_value numeric(12,2),
  quoted_amount numeric(12,2),
  assigned_to uuid REFERENCES users(id),
  follow_up_date timestamptz,
  lead_score integer DEFAULT 50 CHECK (lead_score >= 0 AND lead_score <= 100),
  win_probability integer DEFAULT 30 CHECK (win_probability >= 0 AND win_probability <= 100),
  customer_profile jsonb DEFAULT '{}'::jsonb,
  project_details jsonb DEFAULT '{}'::jsonb,
  sales_tracking jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Posts table for blog/news
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  category text DEFAULT 'news' CHECK (category IN ('news', 'project', 'announcement', 'blog')),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  featured_image text,
  tags text[] DEFAULT ARRAY[]::text[],
  author text NOT NULL,
  published_at timestamptz,
  scheduled_at timestamptz,
  view_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Settings table for application configuration
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  category text DEFAULT 'general',
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- RLS Policies for Projects
CREATE POLICY "Users can read projects" ON projects
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Managers and admins can insert projects" ON projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Managers and admins can update projects" ON projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager')
    )
  );

-- RLS Policies for Tasks
CREATE POLICY "Users can read tasks" ON tasks
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can insert tasks" ON tasks
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (
    assigned_to::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager')
    )
  );

-- RLS Policies for Materials
CREATE POLICY "Users can read materials" ON materials
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Authorized users can manage materials" ON materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND (role IN ('admin', 'manager') OR department = 'Materials')
    )
  );

-- RLS Policies for Documents
CREATE POLICY "Users can read non-confidential documents" ON documents
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    (is_confidential = false OR 
     EXISTS (
       SELECT 1 FROM users 
       WHERE id::text = auth.uid()::text 
       AND role IN ('admin', 'manager')
     ))
  );

CREATE POLICY "Users can insert documents" ON documents
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- RLS Policies for Contacts
CREATE POLICY "Authorized users can read contacts" ON contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "System can insert contacts" ON contacts
  FOR INSERT WITH CHECK (true);

-- RLS Policies for Quotes
CREATE POLICY "Authorized users can read quotes" ON quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "System can insert quotes" ON quotes
  FOR INSERT WITH CHECK (true);

-- RLS Policies for Posts
CREATE POLICY "Everyone can read published posts" ON posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage posts" ON posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- RLS Policies for Settings
CREATE POLICY "Everyone can read public settings" ON settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage settings" ON settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_status ON materials(status);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_assigned_to ON contacts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_assigned_to ON quotes(assigned_to);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Insert default settings
INSERT INTO settings (key, value, category, description, is_public) VALUES
  ('site_name', '"SLK Trading & Design Construction"', 'general', 'Site name', true),
  ('site_description', '"Leading construction company in Laos"', 'general', 'Site description', true),
  ('company_email', '"info@slktrading.la"', 'contact', 'Company email', true),
  ('company_phone', '"+856 21 123 456"', 'contact', 'Company phone', true),
  ('company_address', '"Vientiane Capital, Laos"', 'contact', 'Company address', true),
  ('posts_per_page', '10', 'content', 'Posts per page', false),
  ('enable_registration', 'false', 'auth', 'Enable user registration', false),
  ('maintenance_mode', 'false', 'system', 'Maintenance mode', false)
ON CONFLICT (key) DO NOTHING;

-- Insert sample data for demonstration
INSERT INTO users (id, email, name, role, login_type, department, position) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@slklaos.la', 'SLK System Administrator', 'admin', 'admin', 'Administration', 'System Administrator'),
  ('550e8400-e29b-41d4-a716-446655440002', 'webmaster@slklaos.la', 'Website Manager', 'admin', 'admin', 'IT', 'Website Manager'),
  ('550e8400-e29b-41d4-a716-446655440003', 'john.doe@slklaos.la', 'John Doe', 'employee', 'employee', 'Construction', 'Site Engineer'),
  ('550e8400-e29b-41d4-a716-446655440004', 'jane.smith@slklaos.la', 'Jane Smith', 'employee', 'employee', 'Materials', 'Inventory Specialist'),
  ('550e8400-e29b-41d4-a716-446655440005', 'sarah.wilson@slklaos.la', 'Sarah Wilson', 'manager', 'manager', 'Construction', 'Construction Manager'),
  ('550e8400-e29b-41d4-a716-446655440006', 'david.chen@slklaos.la', 'David Chen', 'manager', 'manager', 'Operations', 'Operations Manager')
ON CONFLICT (id) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (id, name, description, status, start_date, end_date, budget, spent, progress, location, manager_id, client_name, priority) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Vientiane Commercial Complex', 'Modern 5-story commercial building with retail spaces and offices', 'in_progress', '2024-01-01', '2024-12-31', 250000, 120000, 48, 'Vientiane Capital, Laos', '550e8400-e29b-41d4-a716-446655440005', 'Lao Development Corp', 'high'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Luxury Residential Villa', 'High-end villa with premium waterproofing and luxury flooring', 'completed', '2023-06-01', '2023-12-15', 180000, 175000, 100, 'Luang Prabang, Laos', '550e8400-e29b-41d4-a716-446655440006', 'Private Client', 'medium')
ON CONFLICT (id) DO NOTHING;

-- Insert sample materials
INSERT INTO materials (name, description, category, supplier, sku, quantity, unit, unit_price, location, status) VALUES
  ('Premium Waterproof Membrane', 'High-performance waterproofing membrane for roofs and foundations', 'waterproofing', 'International Materials Ltd', 'WPM-001', 150, 'rolls', 45, 'Warehouse A - Section 1', 'in_stock'),
  ('Luxury Porcelain Tiles', 'Premium porcelain tiles with natural stone appearance', 'flooring', 'Tile Masters Co', 'LPT-002', 500, 'sqm', 85, 'Warehouse B - Section 2', 'in_stock'),
  ('Crystalline Waterproofing', 'Advanced crystalline technology for concrete protection', 'waterproofing', 'Crystal Tech Solutions', 'CWP-003', 75, 'bags', 35, 'Warehouse A - Section 2', 'low_stock')
ON CONFLICT (sku) DO NOTHING;

-- Insert sample posts
INSERT INTO posts (title, content, excerpt, category, status, author, published_at) VALUES
  ('SLK Trading Completes Major Commercial Project in Vientiane', 'We are proud to announce the successful completion of our latest commercial project in downtown Vientiane. This 5-story mixed-use building showcases our expertise in modern construction techniques and premium material supply.', 'SLK Trading successfully completes major commercial project in downtown Vientiane.', 'project', 'published', 'SLK Admin', now()),
  ('New Waterproofing Materials Now Available', 'We have expanded our product line with the latest waterproofing materials from leading international manufacturers. These advanced solutions offer superior protection against moisture damage.', 'Latest waterproofing materials now available from international manufacturers.', 'news', 'published', 'SLK Admin', now())
ON CONFLICT DO NOTHING;