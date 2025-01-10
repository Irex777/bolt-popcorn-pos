/*
  # Add indexes for better performance

  1. Changes
    - Add indexes on frequently queried columns
    - Add indexes for foreign keys
  
  2. Security
    - No changes to existing policies
*/

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_key_user ON settings(key, user_id);