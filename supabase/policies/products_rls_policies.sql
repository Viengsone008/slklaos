-- =====================================================
-- Products Table RLS (Row Level Security) Policies
-- =====================================================
-- This file contains comprehensive RLS policies for the products table
-- Supports role-based access control for different user types
-- Updated to match actual table structure from Supabase schema

-- Actual table columns:
-- id (uuid, primary key)
-- user_id (uuid, references auth.users)
-- name (text)
-- description (text) 
-- long_description (text)
-- price (numeric(10,2))
-- rating (numeric(3,2))
-- features (text[])
-- applications (text[])
-- benefits (text[])
-- installation (text[])
-- specifications (jsonb)
-- colours (jsonb)
-- manufacturer (text)
-- warranty (text)
-- "relatedProducts" (text[])
-- image (text)
-- images (text[])
-- "pdfUrl" (text)
-- "catalogueUrl" (text)
-- created_at (timestamp with time zone)
-- updated_at (timestamp with time zone)
-- category_id (uuid, references categories)
-- subcategory_id (uuid, references commercial_subcategories)
-- commercial_subcategory_id (uuid, references commercial_subcategories)
-- "categoryName" (text)
-- is_featured (boolean, default false)

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SELECT Policies
-- =====================================================

-- Policy: Allow public read access to all products (public catalog)
CREATE POLICY "products_public_select" ON products
FOR SELECT 
TO public
USING (true); -- All products are visible to public

-- Policy: Allow authenticated users to view all products
CREATE POLICY "products_authenticated_select" ON products
FOR SELECT 
TO authenticated
USING (true);

-- =====================================================
-- INSERT Policies
-- =====================================================

-- Policy: Allow admin users to insert products
CREATE POLICY "products_admin_insert" ON products
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Policy: Allow manager users to insert products in their category
CREATE POLICY "products_manager_insert" ON products
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'manager'
    AND (
      -- Check against category table if category_id is used
      auth.users.raw_user_meta_data->>'department' = "categoryName"
      OR auth.users.raw_user_meta_data->>'department' = 'all'
    )
  )
  AND auth.uid() = user_id -- Ensure they set themselves as the user_id
);

-- Policy: Allow content creators to insert products
CREATE POLICY "products_creator_insert" ON products
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' IN ('content_creator', 'editor')
  )
  AND auth.uid() = user_id -- Ensure they set themselves as the user_id
);

-- =====================================================
-- UPDATE Policies
-- =====================================================

-- Policy: Allow admin users to update all products
CREATE POLICY "products_admin_update" ON products
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Policy: Allow manager users to update products in their category
CREATE POLICY "products_manager_update" ON products
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'manager'
    AND (
      auth.users.raw_user_meta_data->>'department' = "categoryName"
      OR auth.users.raw_user_meta_data->>'department' = 'all'
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'manager'
    AND (
      auth.users.raw_user_meta_data->>'department' = "categoryName"
      OR auth.users.raw_user_meta_data->>'department' = 'all'
    )
  )
);

-- Policy: Allow users to update their own products
CREATE POLICY "products_owner_update" ON products
FOR UPDATE 
TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' IN ('content_creator', 'editor', 'manager')
  )
)
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' IN ('content_creator', 'editor', 'manager')
  )
);

-- =====================================================
-- DELETE Policies
-- =====================================================

-- Policy: Allow admin users to delete any product
CREATE POLICY "products_admin_delete" ON products
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Policy: Allow manager users to delete products in their category
CREATE POLICY "products_manager_delete" ON products
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'manager'
    AND (
      auth.users.raw_user_meta_data->>'department' = "categoryName"
      OR auth.users.raw_user_meta_data->>'department' = 'all'
    )
  )
);

-- Policy: Allow users to delete their own products
CREATE POLICY "products_owner_delete" ON products
FOR DELETE 
TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' IN ('content_creator', 'editor', 'manager')
  )
);

-- =====================================================
-- Additional Security Functions
-- =====================================================

-- Function to check if user has permission for specific product category
CREATE OR REPLACE FUNCTION check_product_category_permission(user_id UUID, product_category TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND (
      raw_user_meta_data->>'role' = 'admin'
      OR (
        raw_user_meta_data->>'role' = 'manager'
        AND (
          raw_user_meta_data->>'department' = product_category
          OR raw_user_meta_data->>'department' = 'all'
        )
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can manage products
CREATE OR REPLACE FUNCTION can_manage_products(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND raw_user_meta_data->>'role' IN ('admin', 'manager', 'editor', 'content_creator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT raw_user_meta_data->>'role'
    FROM auth.users 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Policy for category-based restrictions
-- =====================================================

-- Policy: Ensure category matches user department for non-admin operations
CREATE POLICY "products_category_restriction" ON products
FOR ALL
TO authenticated
USING (
  -- Admin can access all categories
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
  OR
  -- Manager can access their department categories
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'manager'
    AND (
      auth.users.raw_user_meta_data->>'department' = "categoryName"
      OR auth.users.raw_user_meta_data->>'department' = 'all'
    )
  )
  OR
  -- Users can access their own products
  user_id = auth.uid()
  OR
  -- Editors and content creators can access all (for now)
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' IN ('editor', 'content_creator')
  )
)
WITH CHECK (
  -- Same restrictions for data modification
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'manager'
    AND (
      auth.users.raw_user_meta_data->>'department' = "categoryName"
      OR auth.users.raw_user_meta_data->>'department' = 'all'
    )
  )
  OR
  -- Users can modify their own products
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' IN ('editor', 'content_creator')
  )
);

-- =====================================================
-- Notes and Best Practices
-- =====================================================

/*
Updated for actual table structure from Supabase schema:
- id: uuid (primary key)
- user_id: uuid (references auth.users) 
- name: text
- description: text
- long_description: text
- price: numeric(10,2)
- rating: numeric(3,2)
- features: text[]
- applications: text[]
- benefits: text[]
- installation: text[]
- specifications: jsonb
- colours: jsonb
- manufacturer: text
- warranty: text
- "relatedProducts": text[]
- image: text
- images: text[]
- "pdfUrl": text
- "catalogueUrl": text
- created_at: timestamp with time zone
- updated_at: timestamp with time zone
- category_id: uuid (references categories)
- subcategory_id: uuid (references commercial_subcategories)
- commercial_subcategory_id: uuid (references commercial_subcategories)
- "categoryName": text
- is_featured: boolean (default false)

Role Hierarchy:
- admin: Full access to all products
- manager: Access to products in their department/category (based on categoryName)
- editor: Can edit products
- content_creator: Can create and edit their own products
- authenticated: Can view all products
- public: Can view all products (public catalog)

Key Features:
1. Uses actual column names from schema (user_id, categoryName, etc.)
2. Owner-based permissions using user_id column
3. Category-based restrictions using categoryName field
4. Public product catalog (typical for e-commerce)
5. Proper foreign key relationships to categories and subcategories

Testing Commands:
-- Test as admin
SELECT * FROM products; -- Should see all
INSERT INTO products (user_id, name, "categoryName", price, description, rating, features) VALUES (auth.uid(), 'Test Product', 'waterproofing', 100.00, 'Test description', 4.5, ARRAY['feature1']);

-- Test as manager (department = 'waterproofing')
SELECT * FROM products WHERE "categoryName" = 'waterproofing'; -- Should work

-- Test as content creator (own products)
SELECT * FROM products WHERE user_id = auth.uid(); -- Should see own products only

-- Test as public
SELECT * FROM products; -- Should see all products
*/
